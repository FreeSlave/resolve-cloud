import chalk from 'chalk'

import { get } from '../../../api/client'
import refreshToken from '../../../refreshToken'
import { out } from '../../../utils/std'
import getDeploymentId from '../../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, saga, property, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  const { result } = await get(
    token,
    `deployments/${deploymentId}/sagas/${saga}/properties/${property}`,
    {}
  )

  out(JSON.parse(result))
})

export const command = `get <saga> <property>`
export const describe = chalk.green('show a property')
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
