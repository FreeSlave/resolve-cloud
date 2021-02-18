import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { post } from '../../api/client'
import { logger } from '../../utils/std'

export const handler = refreshToken(async (token: any, params: any) => {
  const { aliases, 'certificate-id': certificateId, 'domain-id': domainId } = params

  const {
    result: { DomainName, DomainId, VerificationCode },
  } = await post(token, `domains`, {
    aliases: aliases.split(',').map((alias: string) => alias.trim()),
    certificateId,
    domainId,
  })

  logger.info(`Your domain "${DomainName}" with id "${DomainId}"`)

  if (VerificationCode != null) {
    logger.info(`Your verification code - ${VerificationCode}`)
  }
})

export const command = 'create'
export const aliases = ['register']
export const describe = chalk.green('create a new domain for user')
export const builder = (yargs: any) =>
  yargs
    .option('certificate-id', {
      alias: 'cert',
      describe: 'the id of an SSL certificate to use',
      type: 'string',
      demand: 'a certificate id is required',
    })
    .option('aliases', {
      alias: 'a',
      describe: 'an aliases for domain',
      type: 'string',
      demand: 'an aliases is required',
    })
    .option('domain-id', {
      alias: 'id',
      describe: 'the id for existing domain',
      type: 'string',
    })
    .group(['certificate-id', 'aliases', 'domain-id'], 'Options:')
