import chalk from 'chalk'

import refreshToken from '../../../refreshToken'
import { put } from '../../../api/client'
import getDeploymentId from '../../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, saga, property, value, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  return put(token, `deployments/${deploymentId}/sagas/${saga}/properties`, {
    key: property,
    value,
  })
})

export const command = 'set <saga> <property> <value>'
export const describe = chalk.green('set a saga property')
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
    .positional('value', {
      describe: chalk.green('property value'),
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
