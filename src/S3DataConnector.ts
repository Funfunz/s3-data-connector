import Debug from 'debug'
import { S3 } from 'aws-sdk'
import { GraphQLInputObjectType } from 'graphql'
import { GraphQLUpload } from 'graphql-upload'
import type { FileUpload } from 'graphql-upload'
import type { GraphQLFieldConfig } from 'graphql'
import type { ICreateArgs, IQueryArgs, IRemoveArgs, IUpdateArgs, DataConnector, IDataConnector } from '@funfunz/core/lib/types/connector'
import type { IFilter } from '@funfunz/core/lib/middleware/utils/filter'
import type { ReadStream } from 'fs'
import type { IEntityInfo } from '@funfunz/core/lib/generator/configurationTypes'

const debug = Debug('funfunz:S3DataConnector')

type S3Config = {
  bucket: string
  region?: string,
  apiVersion?: string,
}

export const addMutation = (entity: IEntityInfo): Partial<GraphQLFieldConfig<unknown, unknown>> => ({
  args: {
    data: {
      description: 'Mutation data',
      type: new GraphQLInputObjectType({
        name: `inputCreate${entity.name}File`,
        description: `Data to create ${entity.name}`,
        fields: {
          file: {
            description: 'File to upload',
            type: GraphQLUpload,
          }
        },
      }),
    },
  }
})

export const updateMutation = (entity: IEntityInfo): Partial<GraphQLFieldConfig<unknown, unknown>> => ({
  args: {
    data: {
      description: 'Mutation data',
      type: new GraphQLInputObjectType({
        name: `inputUpdate${entity.name}File`,
        description: `Data to update ${entity.name}`,
        fields: {
          file: {
            description: 'File to upload',
            type: GraphQLUpload,
          }
        },
      }),
    },
  }
})

export class Connector implements DataConnector{
  public connection: S3
  private config: S3Config
  constructor(connector: IDataConnector<S3Config>) {
    this.config = connector.config

    this.connection = new S3({
      apiVersion: this.config.apiVersion || '2006-03-01',
      region: this.config.region || 'us-west-2'
    })

    debug('Start')
    Object.keys(connector).forEach(
      (key) => {
        debug(key, (connector)[key])
      }
    )
    debug('End')
  }

  public query(args: IQueryArgs): Promise<Record<string, unknown>[] | number> {
    let keyFilter: {key: string, filter: string} | undefined = undefined
    if (args.filter) {
      keyFilter = this.getKeyFromFilter(args.filter)
    }

    return new Promise<S3.ObjectList>(
      (res, rej) => {
        this.connection.listObjectsV2(
          {
            Bucket: this.config.bucket,
            Prefix: keyFilter?.key
          },
          (err, data) => {
            if (err) {
              return rej(err)
            }
            res(data.Contents || [])
          }
        )
      }
    ).then(
      (data: S3.ObjectList) => {
        let result: Record<string, unknown>[] = data as unknown as Record<string, unknown>[]
        if (args.count) {
          return result.length
        }
        if (keyFilter?.filter === '_eq') {
          result = result.filter(
            (entry) => entry.Key === keyFilter?.key
          )
        }
        return result
      }
    )
  }

  public update(args: IUpdateArgs): Promise<Record<string, unknown>[] | Record<string, unknown> | number> {
    return this.create(args)
  }

  public async create(args: ICreateArgs): Promise<Record<string, unknown>[] | Record<string, unknown> | number> {
    const { filename, createReadStream, mimetype } = await args.data.file as FileUpload
    const stream = createReadStream() as ReadStream
    

    // Configure the file stream and obtain the upload parameters

    const uploadParams = {
      Bucket: this.config.bucket,
      Key: filename,
      Body: stream,
      ContentType: mimetype,
    }

    // call S3 to retrieve upload file to specified bucket
    return new Promise(
      (res, rej) => {
        this.connection.upload(
          uploadParams,
          (err, data) => {
            if (err) {
              return rej(err)
            }
            if (data) {
              res([data])
            }
          }
        )
      }
    )
  }

  public remove(args: IRemoveArgs): Promise<number> {
    const queryArgs: IQueryArgs = {
      ...args,
      fields: ['Key']
    }
    return this.query(queryArgs).then(
      (results) => {
        if (Array.isArray(results) && results.length) {
          const params = {
            Bucket: this.config.bucket, 
            Delete: {
              Objects: results.map(
                (result) => ({
                  Key: result.Key as string
                })
              ),
            },
          }
          return new Promise(
            (res, rej) => {
              this.connection.deleteObjects(
                params,
                (err, data) => {
                  if (err || data.Errors?.length) {
                    return rej(err || data.Errors)
                  }
                  if (data) {
                    res(data.Deleted?.length || 0)
                  }
                }
              )
            }
          )
        }
        return 0
      }
    )
  }

  private getKeyFromFilter(filter: IFilter): {key: string, filter: string} | undefined {
    let result: {key: string, filter: string} | undefined = undefined
    const entry = filter.Key as Record<string, string> | undefined
    if (!entry) {
      return result
    }
    if (entry._like !== undefined) {
      result = {
        key: entry._like,
        filter: '_like'
      }
    }
    if (entry._eq !== undefined) {
      result = {
        key: entry._eq,
        filter: '_eq'
      }
    }
    return result
  }
}