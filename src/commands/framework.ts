import chalk from 'chalk'

export const command = 'framework'
export const describe = chalk.red('[experimental] reSolve framework operations')
export const builder = (yargs: any) =>
  yargs.commandDir('framework', {
    extensions: ['ts', 'js'],
    exclude: /\.d\.ts/,
  })
