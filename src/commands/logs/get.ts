import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { get } from '../../api/client'
import { out } from '../../utils/std'
import { setTimeout } from 'timers'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const {
    deployment,
    'start-time': startTime,
    'end-time': endTime,
    'filter-pattern': filterPattern,
    'stream-limit': streamLimit,
    name: nameOverride,
    follow,
    offset = 15000,
  } = params

  const deploymentId = await getDeploymentId({
    token,
    nameOverride,
    deploymentId: deployment,
  })

  const { result } = await get(token, `deployments/${deploymentId}/logs`, {
    startTime,
    endTime,
    filterPattern,
    streamLimit,
  })
  if (result) {
    out(result)
  }

  if (follow) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const tempStartTime = Date.now() - offset
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { result } = await get(token, `deployments/${deploymentId}/logs`, {
        startTime: tempStartTime,
        endTime,
        filterPattern,
        streamLimit,
      })
      if (result) {
        out(result)
      }
      await new Promise((resolve) => setTimeout(resolve, offset))
    }
  }
})

export const command = 'get'
export const aliases = ['$0']
export const describe = chalk.green('retrieve application logs from the cloud')
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
    .option('start-time', {
      alias: 's',
      describe: 'the timestamp at which the log should start',
      type: 'string',
    })
    .option('end-time', {
      alias: 'e',
      describe: 'the timestamp at which the log should end',
      type: 'string',
    })
    .option('filter-pattern', {
      alias: 'f',
      describe: 'a pattern used to filter the output',
      type: 'string',
    })
    .option('stream-limit', {
      alias: 'l',
      describe: 'a number of streams used to fetch logs',
      type: 'number',
    })
    .option('follow', {
      describe: 'flag for using stream of updating logs',
      type: 'boolean',
    })
    .option('offset', {
      describe: 'frequency of updating logs',
      type: 'number',
    })
    .group(
      [
        'name',
        'deployment',
        'start-time',
        'end-time',
        'filter-pattern',
        'stream-limit',
        'follow',
        'offset',
      ],
      'Options:'
    )
