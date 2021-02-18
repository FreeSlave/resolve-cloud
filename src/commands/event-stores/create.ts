import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { post } from '../../api/client'
import { logger, out } from '../../utils/std'
import { getResolvePackageVersion } from '../../config'
import { importEventStore } from './import'

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': prevEventStoreId, mode, eventStore, getEventStoreId } = params
  const version = getResolvePackageVersion()

  if (version == null) {
    throw new Error('Failed to get resolve package version')
  }

  const {
    result: { eventStoreId },
  } = await post(token, `/event-stores`, { version, prevEventStoreId, mode })

  if (eventStore != null) {
    await importEventStore({
      token,
      eventStorePath: eventStore,
      eventStoreId,
    })
  }

  if (getEventStoreId) {
    out(eventStoreId)
    return
  }

  logger.success(`Event store with "${eventStoreId}" id has been created`)
})

export const command = 'create'
export const describe = chalk.green("create the user's event store")
export const builder = (yargs: any) =>
  yargs
    .option('event-store-id', {
      describe: 'id of the existing event-store',
      type: 'string',
    })
    .option('mode', {
      describe:
        'clone - creates new eventstore with events from specified eventstore; reuse - uses specified eventstore',
      type: 'string',
      choices: ['clone', 'reuse'],
      default: 'clone',
    })
    .option('event-store', {
      describe: 'path to event-store backup directory (new deployments only)',
      type: 'string',
    })
    .option('get-event-store-id', {
      describe: 'returns only event-store-id',
      type: 'boolean',
    })
    .conflicts('event-store-id', 'event-store')
    .group(['event-store-id', 'mode', 'event-store', 'get-event-store-id'], 'Options:')
