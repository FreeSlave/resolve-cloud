import chalk from 'chalk'

import packager from '../packager'

import refreshToken from '../refreshToken'
import * as config from '../config'

export const handler = refreshToken(async (token: any, params: any) => {
  config.getResolvePackageVersion()

  const { configuration, name: nameOverride } = params

  const applicationName = config.getApplicationIdentifier(nameOverride)

  await packager(configuration, applicationName)
})

export const aliases = undefined
export const command = 'build'
export const describe = chalk.green('build a reSolve application')
export const builder = (yargs: any) =>
  yargs
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
    .group(['name', 'configuration'], 'Options:')
