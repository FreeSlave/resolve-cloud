import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { del } from '../../api/client'
import { logger } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { id } = params
  await del(token, `certificates/${id}`)

  logger.success(`The certificate ${id} successfully deleted`)
})

export const command = 'drop <id>'
export const aliases = ['remove', 'delete', 'rm']
export const describe = chalk.green('remove an existing SSL certificate by its id')
export const builder = (yargs: any) =>
  yargs.positional('id', {
    describe: chalk.green('an id of an existing certificate'),
    type: 'string',
  })
