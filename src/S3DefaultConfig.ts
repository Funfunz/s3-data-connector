import { IEntityInfo } from '@funfunz/core/lib/generator/configurationTypes'

type s3ConfigOptions = {
  name: string,
  connector: string
}

export const model = (options: s3ConfigOptions): IEntityInfo => ({
  name: options.name,
  connector: options.connector,
  visible: true,
  roles: {
    create: [
      'all'
    ],
    read: [
      'all'
    ],
    update: [
      'all'
    ],
    delete: [
      'all'
    ]
  },
  properties: [
    {
      name: 'Key',
      filterable: {
        filters: ['_like']
      },
      model: {
        type: 'varchar(255)',
        allowNull: false,
        isPk: true
      }
    },
    {
      name: 'LastModified',
      filterable: false,
      model: {
        type: 'varchar(255)',
        allowNull: true
      }
    },
    {
      name: 'ETag',
      filterable: false,
      model: {
        type: 'varchar(255)',
        allowNull: true
      }
    },
    {
      name: 'Size',
      filterable: false,
      model: {
        type: 'int(11)',
        allowNull: true
      }
    },
    {
      name: 'StorageClass',
      filterable: false,
      model: {
        type: 'varchar(255)',
        allowNull: true
      }
    }
  ],
})