import columnify from 'columnify'
import chalk from 'chalk'

import * as config from '../config'
import refreshToken from '../refreshToken'
import { get } from '../api/client'
import { out } from '../utils/std'

type Deployment = {
  deploymentId: string
  applicationName: string
  version: string
  eventStoreId: string
  domainName: string
  deploymentTag?: string
}

export const getDeployment = async (params: {
  token: string
  deploymentId?: string
  nameOverride?: string
  deploymentTag?: string
}): Promise<Deployment | null> => {
  const { token, deploymentId, nameOverride, deploymentTag } = params

  if (deploymentId != null) {
    const response = await get(token, `/deployments/${deploymentId}`)
    return response?.result
  }

  if (deploymentTag != null) {
    const response = await get(token, '/deployments', { deploymentTag })
    return response?.result
  }

  const applicationName = config.getApplicationIdentifier(nameOverride)

  const response = await get(token, '/deployments', { applicationName })

  return response?.result
}

export const handler = refreshToken(
  async (
    token: string,
    params: { deployment?: string; name?: string; getEventStoreId?: boolean; tag?: string }
  ) => {
    const deployment = await getDeployment({
      token,
      deploymentId: params.deployment,
      nameOverride: params.name,
      deploymentTag: params.tag,
    })

    if (deployment == null) {
      throw new Error(`Deployment is not found`)
    }

    if (params.getEventStoreId) {
      out(deployment.eventStoreId)
      return
    }

    const {
      applicationName,
      deploymentId,
      version,
      eventStoreId,
      domainName,
      deploymentTag,
    } = deployment
    out(
      columnify(
        [
          {
            'application-name': applicationName,
            'deployment-id': deploymentId,
            domain: domainName,
            version,
            'event-store-id': eventStoreId ?? 'N/A',
            tag: deploymentTag ?? '',
          },
        ],
        {
          columnSplitter: '    ',
          columns: [
            'application-name',
            'deployment-id',
            'domain',
            'version',
            'event-store-id',
            'tag',
          ],
        }
      )
    )
  }
)

export const command = 'describe'
export const aliases = ['get']
export const describe = chalk.green('display information on the specified deployment')
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
    .option('get-event-store-id', {
      describe: 'returns only event-store-id',
      type: 'boolean',
    })
    .option('tag', {
      describe: 'custom deployment tag',
      type: 'string',
    })
    .conflicts('deployment', 'tag')
    .conflicts('name', 'tag')
    .group(['name', 'configuration', 'get-event-store-id', 'tag'], 'Options:')
