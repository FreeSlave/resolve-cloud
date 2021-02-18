import chalk from 'chalk'
import * as request from 'request'
import fs from 'fs'
import qr from 'qrcode-terminal'
import dotenv from 'dotenv'

import { post, get, patch, put } from '../api/client'
import refreshToken from '../refreshToken'
import packager, { codeZipPath, staticZipPath } from '../packager'
import * as config from '../config'
import { logger } from '../utils/std'

type Deployment = {
  deploymentId: string
  applicationName: string
  version: string
  eventStoreId: string
  domainName: string
}

export const handler = refreshToken(async (token: any, params: any) => {
  const resolveVersion = config.getResolvePackageVersion()

  const {
    'skip-build': skipBuild,
    configuration,
    name: nameOverride,
    'event-store-id': receivedEventStoreId,
    qr: generateQrCode,
    environment,
    'npm-registry': npmRegistry,
    domain,
    envs,
    tag,
  } = params

  void environment

  const applicationName = config.getApplicationIdentifier(nameOverride)

  if (!skipBuild) {
    await packager(configuration, applicationName)
  } else {
    logger.trace(`skipping the application build phase`)
  }

  let deployment: Deployment
  let eventStoreId: string
  let eventStoreDatabaseName: string
  let eventBusLambdaArn: string
  let eventBusDatabaseName: string

  logger.trace(`requesting the list of existing deployments`)
  void ({ result: deployment } = await get(token, '/deployments', { applicationName }))

  logger.trace(`deployment list received: ${deployment == null ? 0 : 1} items`)

  if (deployment == null) {
    logger.start(`deploying the "${applicationName}" application to the cloud`)

    if (receivedEventStoreId == null) {
      void ({
        result: { eventStoreId, eventStoreDatabaseName, eventBusLambdaArn, eventBusDatabaseName },
      } = await post(token, `/event-stores`, { version: resolveVersion }))
    } else {
      const {
        result: listEventStores,
      }: {
        result: Array<{
          eventStoreId: string
          eventStoreDatabaseName: string
          eventBusLambdaArn: string
          eventBusDatabaseName: string
          version: string
        }>
      } = await get(token, `/event-stores`, {
        version: resolveVersion,
      })

      if (listEventStores == null) {
        throw new Error('Failed to get list event-stores')
      }

      const foundEventStore = listEventStores.find(
        ({ eventStoreId: foundEventStoreId }) => receivedEventStoreId === foundEventStoreId
      )

      if (foundEventStore == null) {
        throw new Error(`Event-store with "${receivedEventStoreId}" id was not found`)
      }

      if (foundEventStore.version !== resolveVersion) {
        throw new Error(
          `Wrong event-store "${receivedEventStoreId}" version ${foundEventStore.version}`
        ) // TODO update message
      }

      void ({
        eventStoreId,
        eventStoreDatabaseName,
        eventBusLambdaArn,
        eventBusDatabaseName,
      } = foundEventStore)
    }

    const { result } = await post(token, `/deployments`, {
      applicationName,
      version: resolveVersion,
      eventStoreId,
      eventStoreDatabaseName,
      eventBusLambdaArn,
      eventBusDatabaseName,
      domain,
      deploymentTag: tag,
    })

    const { deploymentId, domainName } = result

    if (envs != null) {
      await put(token, `deployments/${deploymentId}/environment`, {
        variables: dotenv.parse(Buffer.from(envs.join('\n'))),
      })
    }

    deployment = {
      deploymentId,
      applicationName,
      version: resolveVersion,
      domainName,
      eventStoreId,
    }
  }

  const {
    result: { codeUploadUrl, staticUploadUrl },
  } = await get(token, `/deployments/${deployment.deploymentId}/upload`, {})

  logger.debug(`upload code.zip and static.zip`)
  try {
    await Promise.all(
      [
        {
          zipPath: codeZipPath,
          uploadUrl: codeUploadUrl,
        },
        {
          zipPath: staticZipPath,
          uploadUrl: staticUploadUrl,
        },
      ].map(
        ({ zipPath, uploadUrl }) =>
          new Promise((resolve, reject) => {
            const fileSizeInBytes = fs.lstatSync(zipPath).size
            const contentType = 'application/zip'
            const fileStream = fs.createReadStream(zipPath)
            request.put(
              {
                uri: uploadUrl,
                headers: {
                  'Content-Length': fileSizeInBytes,
                  'Content-Type': contentType,
                },
                body: fileStream,
              },
              (error: Error, _: any, body: any) => {
                return error ? reject(error) : body ? reject(body) : resolve(body)
              }
            )
          })
      )
    )
    logger.debug(`code.zip and static.zip have been uploaded`)
  } catch (error) {
    logger.debug(`Failed to upload code.zip and static.zip`)
    throw error
  }

  await patch(token, `/deployments/${deployment.deploymentId}/upload`, {
    npmRegistry,
  })

  await patch(token, `/deployments/${deployment.deploymentId}/bootstrap`, {})

  const applicationUrl = `https://${deployment.domainName}`

  logger.success(`"${applicationName}" available at ${applicationUrl}`)

  if (generateQrCode) {
    qr.generate(applicationUrl, { small: true })
  }
})

export const aliases = undefined
export const command = 'deploy'
export const describe = chalk.green('deploy a reSolve application to the cloud')
export const builder = (yargs: any) =>
  yargs
    .option('skip-build', {
      describe: 'skip the application build phase',
      type: 'boolean',
      default: false,
    })
    .option('configuration', {
      alias: 'c',
      describe: 'the name of the configuration to use',
      type: 'string',
      default: 'cloud',
    })
    .option('name', {
      alias: 'n',
      describe: 'the application name (the name from package.json is used by default)',
      type: 'string',
    })
    .option('event-store-id', {
      alias: 'es',
      describe: `event-store id`,
      type: 'string',
    })
    .option('qr', {
      describe: 'generate QR code',
      type: 'boolean',
      default: false,
    })
    .option('environment', {
      describe: 'a list of key=value pairs describing environment variables',
      alias: 'env',
      type: 'array',
    })
    .option('npm-registry', {
      describe: 'custom NPM registry link',
      type: 'string',
    })
    .option('domain', {
      describe: 'custom domain',
      type: 'string',
    })
    .option('envs', {
      describe: 'a list of key=value pairs',
      type: 'array',
    })
    .option('tag', {
      describe: 'custom deployment tag',
      type: 'string',
    })
    .group(
      [
        'skip-build',
        'configuration',
        'name',
        'event-store-id',
        'qr',
        'environment',
        'npm-registry',
        'domain',
        'envs',
        'tag',
      ],
      'Options:'
    )
