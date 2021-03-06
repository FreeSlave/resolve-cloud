import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import { logger } from '../../utils/std'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    nameOverride,
    deploymentId: deployment,
  })

  await patch(token, `deployments/${deploymentId}/logs/disable`, {})

  logger.success(`Logs for application "${deploymentId}" successfully disabled`)
})

export const command = 'disable'
export const describe = chalk.green('disable application logs')
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
    .group(['name', 'deployment'], 'Options:')
