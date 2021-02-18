import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

import { set, get } from '../../config'
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
    logger.trace('[experimental] reSolve framework detected, linking')

    set('symlinks.resolve', currentDirectory)

    logger.trace(
      `[experimental]: symlink to (${packageJson.name}) framework v${packageJson.version} created successfully`
    )
  } else {
    const resolveSymlink = get('symlinks.resolve')

    if (!resolveSymlink) {
      logger.error(`[experimental] no framework symlinks found`)
      return 1
    }

    const linkedProjects = get('linked_projects') || []
    if (!linkedProjects.find((directory: any) => directory === currentDirectory)) {
      set('linked_projects', [...linkedProjects, currentDirectory])
      logger.info(`[experimental] frameworks links added to the project`)
    } else {
      logger.info(`[experimental] frameworks links already added to the project`)
    }
  }
  return 0
}

export const command = 'link'
export const describe = chalk.red('[experimental] link local reSolve framework')
