import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'
import { logger } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { 'event-store-id': id } = params

  await del(token, `/event-stores/${id}`)

  logger.success(`Event store has been removed`)
})

export const command = 'drop <event-store-id>'
export const aliases = ['rm', 'remove']
export const describe = chalk.green("removes the user's event store")
export const builder = (yargs: any) =>
  yargs.positional('event-store-id', {
    describe: chalk.green("an existing event store's id"),
    type: 'string',
  })
