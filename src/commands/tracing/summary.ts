import chalk from 'chalk'
import columnify from 'columnify'
import dateFormat from 'dateformat'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, 'start-time': startTime, 'end-time': endTime, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  const { result } = await get(token, `deployments/${deploymentId}/tracing/summary`, {
    startTime,
    endTime,
  })

  if (result) {
    out(
      columnify(
        result.map((item: any) => {
          const { Id, ResponseTime, Http } = item
          return {
            id: Id,
            url: Http != null ? Http.HttpURL : '',
            time: `${dateFormat(
              new Date(parseInt(Id.split('-')[1], 16) * 1000),
              'm/d/yy HH:MM:ss'
            )}`,
            latency: ResponseTime,
          }
        }),
        {
          minWidth: 20,
          columns: ['time', 'id', 'latency', 'url'],
        }
      )
    )
  }
})

export const command = 'summary'
export const aliases = []
export const describe = chalk.green("retrieve the list of an application's performance traces")
export const builder = (yargs: any) =>
  yargs
    .option('start-time', {
      alias: 's',
      describe: 'the timestamp at which the traces should start',
      type: 'string',
    })
    .option('end-time', {
      alias: 'e',
      describe: 'the timestamp at which the traces should end',
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
    .group(['name', 'deployment', 'start-time', 'end-time'], 'Options:')
