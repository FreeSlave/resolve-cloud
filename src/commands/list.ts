import columnify from 'columnify'
import chalk from 'chalk'

import refreshToken from '../refreshToken'
import { get } from '../api/client'
import { out } from '../utils/std'

export const handler = refreshToken(async (token: any) => {
  const { result } = await get(token, `/deployments`)

  if (result) {
    out(
      columnify(
        result.map(
          ({
            deploymentId,
            version,
            eventStoreId,
            applicationName,
            domainName,
            deploymentTag,
          }: {
            deploymentId: string
            applicationName: string
            version: string
            eventStoreId: string
            domainName: string
            deploymentTag: string
          }) => ({
            'application-name': applicationName,
            'deployment-id': deploymentId,
            version,
            'event-store-id': eventStoreId ?? 'N/A',
            domain: domainName,
            tag: deploymentTag ?? '',
          })
        ),
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
})

export const command = 'list'
export const aliases = ['ls']
export const describe = chalk.green('display a list of available deployments')
