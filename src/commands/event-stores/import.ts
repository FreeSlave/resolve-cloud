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

export const importEventStore = async (params: {
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

  const pathToEvents = path.resolve(process.cwd(), eventStorePath, 'events.db')
  const pathToSecrets = path.resolve(process.cwd(), eventStorePath, 'secrets.db')

  if (!fs.existsSync(pathToEvents)) {
    throw new Error(`No such file or directory "${pathToEvents}"`)
  }

  if (!fs.existsSync(pathToSecrets)) {
    throw new Error(`No such file or directory "${pathToSecrets}"`)
  }

  await promisify(pipeline)(fs.createReadStream(pathToEvents), eventStoreAdapter.importEvents())
  await promisify(pipeline)(fs.createReadStream(pathToSecrets), eventStoreAdapter.importSecrets())
}

export const handler = refreshToken(async (token: any, params: any) => {
  const { name: nameOverride, path: eventStorePath, 'event-store-id': eventStoreId } = params

  await importEventStore({
    token,
    eventStorePath,
    name: nameOverride,
    eventStoreId,
  })

  logger.success('Import event-store successfully completed!')
})

export const describe = chalk.green('import an event-store to the cloud')
export const command = 'import <path>'
export const builder = (yargs: any) =>
  yargs
    .option('event-store', {
      describe: 'path to event-store backup directory (new deployments only)',
      type: 'string',
    })
    .option('name', {
      alias: 'n',
      describe: 'the application name (the name from package.json is used by default)',
      type: 'string',
    })
    .option('event-store-id', {
      alias: 'es',
      describe: 'id of the existing event-store',
      type: 'string',
    })
    .group(['name', 'event-store-id', 'event-store'], 'Options:')
