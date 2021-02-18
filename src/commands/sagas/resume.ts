import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch } from '../../api/client'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, item: any) => {
  const { deployment, saga, name: nameOverride } = item

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return await patch(token, `deployments/${deploymentId}/sagas/${saga}/resume`, {})
})

export const command = 'resume <saga>'
export const describe = chalk.green('resume handling events')
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
