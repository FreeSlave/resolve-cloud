import chalk from 'chalk'

import refreshToken from '../../refreshToken'
import { patch, get } from '../../api/client'
import getDeploymentId from '../../utils/get-deployment-id'

export const handler = refreshToken(async (token: any, params: any) => {
  const { deployment, name: nameOverride } = params

  const deploymentId = await getDeploymentId({
    token,
    deploymentId: deployment,
    nameOverride,
  })

  const { result } = await get(token, `deployments/${deploymentId}/read-models`, {})

  const promises: Array<Promise<unknown>> = []
  const errors: Array<Error> = []
  for (const { eventSubscriber } of result) {
    promises.push(
      Promise.resolve()
        .then(() =>
          patch(token, `deployments/${deploymentId}/read-models/${eventSubscriber}/resume`, {})
        )
        .catch((error) => errors.push(error))
    )
  }
  await Promise.all(promises)
  if (errors.length > 0) {
    const error = new Error(errors.map(({ message }) => message).join('\n'))
    error.stack = errors.map(({ stack }) => stack).join('\n')
    throw error
  }
})

export const command = 'resume-all'
export const describe = chalk.green('resume all read model updates')
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
