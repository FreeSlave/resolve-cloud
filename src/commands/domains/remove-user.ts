import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id, user } = params
  return del(token, `/domains/${id}/users/${user}`)
})

export const command = 'remove-user <id>'
export const describe = chalk.green('remove user from existing domain')
export const builder = (yargs: any) =>
  yargs
    .positional('id', {
      describe: chalk.green('id of the registered domain'),
      type: 'string',
    })
    .option('user', {
      describe: 'id existing user',
      type: 'string',
      demandOption: true,
    })
    .group(['user'], 'Options:')
