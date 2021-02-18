import chalk from 'chalk'

import refreshToken from '../refreshToken'
import { del } from '../api/client'
import getDeploymentId from '../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return del(token, `/deployments/${deploymentId}/domain`, {})
})

export const command = 'unset-domain'
export const describe = chalk.green('unset domain for existing deployment')
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
    .group(['name', 'configuration'], 'Options:')
