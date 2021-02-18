import chalk from 'chalk'

import { del } from '../../api/client'
import refreshToken from '../../refreshToken'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, variables, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return del(token, `deployments/${deploymentId}/environment`, { variables })
})

export const command = 'remove <variables...>'
export const aliases = ['rm']
export const describe = chalk.green('remove environment variable')
export const builder = (yargs: any) =>
  yargs
    .positional('variables', {
      describe: chalk.green('a list of key=value pairs'),
      type: 'array',
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
    .group(['deployment', 'name'], 'Options:')
