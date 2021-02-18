import dotenv from 'dotenv'
import chalk from 'chalk'

import { put } from '../../api/client'
import refreshToken from '../../refreshToken'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, variables, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return put(token, `deployments/${deploymentId}/environment`, {
    variables: dotenv.parse(Buffer.from(variables.join('\n'))),
  })
})

export const command = `set <variables...>`
export const describe = chalk.green('set an environment variables')
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
