import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { post } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id, user } = params
  return post(token, `/domains/${id}/users`, { userId: user })
})

export const command = 'add-user <id>'
export const describe = chalk.green('add user for existing domain')
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
