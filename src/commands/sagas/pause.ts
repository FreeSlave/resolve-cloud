import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, saga, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return await patch(token, `deployments/${deploymentId}/sagas/${saga}/pause`, {})
})

export const command = 'pause <saga>'
export const describe = chalk.green('stop handling events')
export const builder = (yargs: any) =>
  yargs
    .positional('saga', {
      describe: chalk.green("an existing saga's name"),
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
