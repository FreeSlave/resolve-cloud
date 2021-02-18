import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

import { get, del, set } from '../../config'
import { logger } from '../../utils/std'

export const handler = async () => {
  const currentDirectory = path.resolve()

  let packageJson
  try {
    logger.trace('[experimental] reading package.json')
    packageJson = JSON.parse(
      fs.readFileSync(path.resolve(currentDirectory, 'package.json')).toString()
    )
  } catch (e) {
    logger.error(e.message)
    return 1
  }

  if (packageJson.name === 'resolve') {
    logger.trace('[experimental] reSolve framework detected, unlinking')

    del('symlinks.resolve', 'linked_projects')

    logger.trace(
      `[experimental] symlink to (${packageJson.name}) framework v${packageJson.version} removed`
    )
  } else {
    const linkedProjects = get('linked_projects') || []
    if (linkedProjects.find((directory: any) => directory === currentDirectory)) {
      set(
        'linked_projects',
        linkedProjects.filter((directory: any) => directory !== currentDirectory)
      )
      logger.info(`[experimental] frameworks links removed`)
    } else {
      logger.info(`[experimental] no frameworks links found`)
    }
  }
  return 0
}

export const command = 'unlink'
export const describe = chalk.red('[experimental] unlink local reSolve framework')
