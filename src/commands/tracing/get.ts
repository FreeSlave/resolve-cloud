import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, 'trace-id': traceId, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  const { result } = await get(token, `deployments/${deploymentId}/tracing/details`, {
    traceIds: traceId,
  })

  out(JSON.stringify(result, null, 2))
})

export const command = 'get <traceId>'
export const describe = chalk.green("retrieve an application's performance trace from the cloud")
export const builder = (yargs: any) =>
  yargs
    .positional('trace-id', {
      describe: chalk.green("a trace's id"),
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
    .group(['name', 'deployment'], 'Options:')
