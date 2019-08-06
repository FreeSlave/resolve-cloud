const columnify = require('columnify')
const dateFormat = require('dateformat')
const chalk = require('chalk')
const refreshToken = require('../../refreshToken')
const { get } = require('../../api/client')
const { out } = require('../../utils/std')

const handler = refreshToken(async (token, { deployment }) => {
  const { result } = await get(token, `deployments/${deployment}/read-models`)
  if (result) {
    out(
      columnify(
        result.map(({ name, status, lastEvent, lastError }) => ({
          name,
          status,
          'last event': lastEvent
            ? `${dateFormat(new Date(lastEvent.timestamp), 'm/d/yy HH:MM:ss')} ${lastEvent.type}`
            : 'N\\A',
          'last error': lastError ? `${lastError.message}` : 'N\\A'
        })),
        {
          minWidth: 30,
          columns: ['name', 'status', 'last event', 'last error']
        }
      )
    )
  }
})

module.exports = {
  handler,
  command: 'list <deployment>',
  aliases: ['ls', '$0'],
  describe: chalk.green("display a list of an application's read models"),
  builder: yargs =>
    yargs.positional('deployment', {
      describe: chalk.green("an existing deployment's id"),
      type: 'string'
    })
}