import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, readmodel, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return await patch(token, `deployments/${deploymentId}/read-models/${readmodel}/pause`, {})
})

export const command = 'pause <readmodel>'
export const describe = chalk.green('pause read model updates')
export const builder = (yargs: any) =>
  yargs
    .positional('readmodel', {
      describe: chalk.green("an existing readmodel's name"),
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
