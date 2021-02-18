import chalk from 'chalk'

import refreshToken from '../../../refreshToken'
import { del } from '../../../api/client'
import getDeploymentId from '../../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, saga, property, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return del(token, `deployments/${deploymentId}/sagas/${saga}/properties/${property}`, {})
})

export const command = 'delete <saga> <property>'
export const aliases = ['rm', 'remove']
export const describe = chalk.green('delete a saga property')
export const builder = (yargs: any) =>
  yargs
    .positional('saga', {
      describe: chalk.green("an existing saga's name"),
      type: 'string',
    })
    .positional('property', {
      describe: chalk.green('property name'),
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
