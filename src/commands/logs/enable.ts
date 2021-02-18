import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import { logger } from '../../utils/std'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, 'log-level': logLevel, scope, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  await patch(token, `deployments/${deploymentId}/logs/enable`, { logLevel, scope })

  logger.success(`Logs for application "${deploymentId}" successfully enabled`)
})

export const command = 'enable'
export const describe = chalk.green('enable application logs')
export const builder = (yargs: any) =>
  yargs
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
    .option('log-level', {
      alias: 'lvl',
      describe: 'possibly levels [ log, error, warn, debug, info, verbose ]',
      type: 'string',
    })
    .option('scope', {
      alias: 's',
      describe: 'the scope for logs',
      type: 'string',
    })
    .group(['name', 'deployment', 'log-level', 'scope'], 'Options:')
