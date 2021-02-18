import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { put } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id, users } = params
  return put(token, `/domains/${id}/users`, {
    users: users === '*' ? users : users.split(','),
  })
})

export const command = 'set-users <id>'
export const describe = chalk.green('set users for existing domain')
export const builder = (yargs: any) =>
  yargs
    .positional('id', {
      describe: chalk.green('id of the registered domain'),
      type: 'string',
    })
    .option('users', {
      describe: 'list users or "*"',
      type: 'string',
      demandOption: true,
    })
    .group(['users'], 'Options:')
