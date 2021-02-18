import chalk from 'chalk'

import refreshToken from '../refreshToken'
import { del, patch } from '../api/client'
import { logger } from '../utils/std'
import getDeploymentId from '../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, 'with-event-store': withEventStore, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  logger.trace(`requesting deployment removal`)

  await patch(token, `/deployments/${deploymentId}/shutdown`)

  await del(token, `/deployments/${deploymentId}`, { withEventStore })

  logger.success(`Deployment "${deploymentId}" successfully removed`)
})

export const command = 'remove'
export const aliases = ['rm']
export const describe = chalk.green('remove an application deployment with all its data')
export const builder = (yargs: any) =>
  yargs
    .option('with-event-store', {
      describe: 'remove with linked event-store',
      type: 'boolean',
      default: false,
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
    .group(['name', 'configuration', 'with-event-store'], 'Options:')
