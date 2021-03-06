# Funfunz S3 Data Connector

[![Discord][discord-badge]][discord]
[![Build Status][actions-badge]][actions]
[![codecov][codecov-badge]][codecov]
![node][node]
[![npm version][npm-badge]][npm]
[![PRs Welcome][prs-badge]][prs]
[![GitHub][license-badge]][license]

This connector creates all the mutations and query to upload and retrieve files from an S3 bucket

At the moment, the connector is using the local machine AWS credentials

## Documentation

Just follow the [link](https://funfunz.github.io/funfunz/#/usage/dataConnectors/s3)

## Usage

**S3 config**

```js
{
  connectors: {
    [key: string]: { // user defined name for the connector
      type: '@funfunz/s3-data-connector',
      config: {
        bucket: string // name of the bucket
        region?: string // region of the bucket
        apiVersion?: string // api version to use
      },
    }
    ...
  }
}
```

**S3 entity**

```js
import { model } from '@funfunz/s3-data-connector'

export default model({
      name: 's3', // name for the entity, this will be visible under the GraphQL docs
      connector: 's3' // name defined by the user on the config file
    })
```


[discord-badge]: https://img.shields.io/discord/774439225520554004?logo=discord
[discord]: https://discord.gg/HwZ7zMJKwg

[actions-badge]: https://github.com/funfunz/s3-data-connector/workflows/Node.js%20CI/badge.svg
[actions]: https://github.com/Funfunz/s3-data-connector/actions

[codecov-badge]: https://codecov.io/gh/Funfunz/s3-data-connector/branch/master/graph/badge.svg
[codecov]: https://codecov.io/gh/Funfunz/s3-data-connector

[node]: https://img.shields.io/node/v/funfunz.svg

[npm-badge]: https://badge.fury.io/js/funfunz.svg
[npm]: https://badge.fury.io/js/funfunz

[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[prs]: http://makeapullrequest.com

[license-badge]: https://img.shields.io/github/license/JWebCoder/funfunz.svg
[license]: https://github.com/JWebCoder/funfunz/blob/master/LICENSE