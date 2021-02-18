import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../../../refreshToken'
import { out } from '../../../utils/std'
import { get } from '../../../api/client'
import getDeploymentId from '../../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, saga, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  const { result } = await get(token, `deployments/${deploymentId}/sagas/${saga}/properties`, {})

  if (result) {
    out(
      columnify(result, {
        minWidth: 30,
        columns: ['name', 'value'],
      })
    )
  }
})

export const command = 'list <saga>'
export const aliases = ['ls', '$0']
export const describe = chalk.green('show a list of assigned properties')
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
