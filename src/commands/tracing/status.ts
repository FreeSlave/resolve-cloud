import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { logger } from '../../utils/std'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  const { result } = await get(token, `deployments/${deploymentId}/tracing/status`)

  logger.info(`Performance tracing status: "${result}"`)
})

export const command = 'status'
export const describe = chalk.green("retrieve an application's performance tracing status")
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
