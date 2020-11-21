import fs from 'fs'
import shortid from 'shortid'

import { Connector, addMutation, updateMutation, model } from '../index'

const connector = new Connector({
  type: 's3',
  config: {
    bucket: 'funfunz'
  }
})

let localFilename = 'soMilkySoJohn.png'
let uploadedFilename = `${shortid.generate()}.png`

describe('s3-data-connector', () => {
  it('Upload a file', (done) => {
    connector.create({
      entityName: 's3',
      data: {
        file: {
          filename: uploadedFilename,
          createReadStream: () => {
            return fs.createReadStream(`${__dirname}/${localFilename}`)
          },
          mimetype: 'image/png'
        }
      }
    }).then(
      (response) => {
        expect(Array.isArray(response)).toBeTruthy()
        expect(response[0].ETag).toBeTruthy()
        expect(response[0].Location).toBeTruthy()
        expect(response[0].Key).toBeTruthy()
        expect(response[0].Bucket).toBeTruthy()
        done()
      }
    )
  })

  it('Query a file', (done) => {
    connector.query({
      entityName: 's3',
      filter: {
        Key: {
          _like: uploadedFilename
        }
      },
      fields: ['Key']
    }).then(
      (response) => {
        expect(Array.isArray(response)).toBeTruthy()
        expect(response[0].Key).toBe(uploadedFilename)
        done()
      }
    )
  })

  it('Only filter Key is taken into account', (done) => {
    connector.query({
      entityName: 's3',
      filter: {
        stuff: {
          _like: uploadedFilename
        }
      },
      fields: ['Key']
    }).then(
      (response) => {
        expect(Array.isArray(response)).toBeTruthy()
        done()
      }
    )
  })
  
  it('Query all files', (done) => {
    connector.query({
      entityName: 's3',
      fields: ['Key']
    }).then(
      (response) => {
        expect(Array.isArray(response)).toBeTruthy()
        done()
      }
    )
  })

  it('Query a file with exact name', (done) => {
    connector.query({
      entityName: 's3',
      filter: {
        Key: {
          _eq: uploadedFilename
        }
      },
      fields: ['Key']
    }).then(
      (response) => {
        expect(Array.isArray(response)).toBeTruthy()
        expect(response[0].Key).toBe(uploadedFilename)
        done()
      }
    )
  })

  it('Query a file return the count', (done) => {
    connector.query({
      entityName: 's3',
      filter: {
        Key: {
          _like: uploadedFilename
        }
      },
      fields: ['Key'],
      count: true,
    }).then(
      (response) => {
        expect(typeof response).toBe('number')
        expect(response).toBe(1)
        done()
      }
    )
  })

  it('Update a file', (done) => {
    connector.update({
      entityName: 's3',
      filter: {
        Key: {
          _like: 'asdasd',
        },
      },
      fields: ['Key'],
      data: {
        file: {
          filename: uploadedFilename,
          createReadStream: () => {
            return fs.createReadStream(`${__dirname}/${localFilename}`)
          },
          mimetype: 'image/png'
        }
      }
    }).then(
      (response) => {
        expect(Array.isArray(response)).toBeTruthy()
        expect(response[0].Key).toBe(uploadedFilename)
        done()
      }
    )
  })

  it('Delete a file', (done) => {
    connector.remove({
      entityName: 's3',
      filter: {
        Key: {
          _like: uploadedFilename,
        },
      },
    }).then(
      (response) => {
        expect(typeof response === 'number').toBeTruthy()
        done()
      }
    )
  })

  it('Delete a file, not match', (done) => {
    connector.remove({
      entityName: 's3',
      filter: {
        Key: {
          _like: 'qweasdzxcertyfghcvbn',
        },
      },
    }).then(
      (response) => {
        expect(typeof response === 'number').toBeTruthy()
        done()
      }
    )
  })

  it('Add mutation should be custom', () => {
    const mutation = addMutation(model({
      name: 's3',
      connector: 's3'
    }))

    expect(mutation.args).toBeTruthy()
  })

  it('Update mutation should be custom', () => {
    const mutation = updateMutation(model({
      name: 's3',
      connector: 's3'
    }))

    expect(mutation.args).toBeTruthy()
  })
})
