import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id } = params
  return del(token, `domains/${id}`)
})

export const command = 'drop <id>'
export const aliases = ['remove', 'delete', 'rm']
export const describe = chalk.green('removes an existing domain')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('id of the registered domain'),
    type: 'string',
  })
