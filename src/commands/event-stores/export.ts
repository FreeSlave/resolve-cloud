import { promisify } from 'util'
import { pipeline } from 'stream'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import createAdapter from 'resolve-eventstore-postgresql-serverless'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { logger } from '../../utils/std'
import * as config from '../../config'

type Deployment = {
  deploymentId: string
  applicationName: string
  version: string
  eventStoreId: string
  domainName: string
}

const getEventStoreId = async (params: {
  token: string
  name?: string
  eventStoreId?: string
}): Promise<string> => {
  const { name, eventStoreId, token } = params

  if (eventStoreId == null) {
    let deployment: Deployment

    const applicationName = config.getApplicationIdentifier(name)

    void ({ result: deployment } = await get(token, '/deployments', { applicationName }))

    if (deployment == null) {
      throw new Error(`Deployment ${applicationName} is not found`)
    }

    return deployment.eventStoreId
  } else {
    return eventStoreId
  }
}

export const exportEventStore = async (params: {
  token: string
  eventStorePath: string
  name?: string
  eventStoreId?: string
}) => {
  const { token, eventStorePath } = params

  const eventStoreId = await getEventStoreId(params)

  const {
    result: {
      eventStoreDatabaseName,
      eventStoreClusterArn,
      eventStoreSecretArn,
      region,
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  } = await get(token, `/event-stores/${eventStoreId}`)

  const eventStoreAdapter = createAdapter({
    databaseName: eventStoreDatabaseName,
    dbClusterOrInstanceArn: eventStoreClusterArn,
    awsSecretStoreArn: eventStoreSecretArn,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    region,
  })

  const pathToEventStore = path.resolve(process.cwd(), eventStorePath)

  if (!fs.existsSync(pathToEventStore)) {
    fs.mkdirSync(pathToEventStore)
  }

  const pathToEvents = path.join(pathToEventStore, 'events.db')
  const pathToSecrets = path.join(pathToEventStore, 'secrets.db')

  await promisify(pipeline)(eventStoreAdapter.exportEvents(), fs.createWriteStream(pathToEvents))
  await promisify(pipeline)(eventStoreAdapter.exportSecrets(), fs.createWriteStream(pathToSecrets))
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { name: nameOverride, path: eventStorePath, 'event-store-id': eventStoreId } = params

  await exportEventStore({
    token,
    eventStorePath,
    name: nameOverride,
    eventStoreId,
  })

  logger.success('Export event-store successfully completed!')
})

export const describe = chalk.green('export event-store from the cloud')
export const command = 'export <path>'
export const builder = (yargs: any) =>
  yargs
    .positional('path', {
      describe: chalk.green('path to event-store backup file or directory'),
      type: 'string',
    })
    .option('name', {
      alias: 'n',
      describe: 'the application name (the name from package.json is used by default)',
      type: 'string',
    })
    .option('event-store-id', {
      describe: 'id of the existing event-store',
      type: 'string',
    })
    .group(['name', 'event-store-id'], 'Options:')
