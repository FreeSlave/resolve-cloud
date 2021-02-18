import chalk from 'chalk'

import refreshToken from '../refreshToken'
import { put } from '../api/client'
import getDeploymentId from '../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, domain, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return put(token, `/deployments/${deploymentId}/domain`, { domain })
})

export const command = 'set-domain <domain>'
export const describe = chalk.green('set domain for existing deployment')
export const builder = (yargs: any) =>
  yargs
    .positional('domain', {
      describe:
        'an existing custom domain name in fully qualified format (e.g. store.root-domain.org)',
      type: 'string',
    })
    .option('deployment', {
      alias: 'id',
      describe: "an existing deployment's id",
      type: 'string',
    })
    .option('name', {
      alias: 'n',
      describe: 'the application name (the name from package.json is used by default)',
      type: 'string',
    })
    .group(['name', 'configuration'], 'Options:')
