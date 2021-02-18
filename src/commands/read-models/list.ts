import columnify from 'columnify'
import dateFormat from 'dateformat'
import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  const { result } = await get(token, `deployments/${deploymentId}/read-models`, {})
  if (result) {
    out(
      columnify(
        result.map((item: any) => {
          const { name, status, successEvent, errors } = item
          return {
            name,
            status,
            'last event': successEvent
              ? `${
                  successEvent.type !== 'Init'
                    ? dateFormat(new Date(successEvent.timestamp), 'm/d/yy HH:MM:ss')
                    : ''
                } ${successEvent.type}`
              : 'N\\A',
            'last error': Array.isArray(errors)
              ? `${errors.map((e) => e.stack).join('\n')}`
              : 'N\\A',
          }
        }),
        {
          minWidth: 30,
          maxWidth: 100,
          columns: ['name', 'status', 'last event', 'last error'],
        }
      )
    )
  }
})

export const command = 'list'
export const aliases = ['ls', '$0']
export const describe = chalk.green("display a list of an application's read models")
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
    .group(['name', 'deployment'], 'Options:')
