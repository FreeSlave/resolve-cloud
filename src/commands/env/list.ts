import chalk from 'chalk'

import { get } from '../../api/client'
import { out } from '../../utils/std'
import refreshToken from '../../refreshToken'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  const { result } = await get(token, `deployments/${deploymentId}/environment`)

  out(result)
})

export const command = `list`
export const describe = chalk.green('display list an environment variables')
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
    .group(['deployment', 'name'], 'Options:')
