import columnify from 'columnify'
import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import { out } from '../../../utils/std'
import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../commands/describe'
import { get } from '../../../api/client'
import refreshToken from '../../../refreshToken'

jest.mock('../../../api/client', () => ({
  get: jest.fn(),
}))

jest.mock('../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('../../../utils/std', () => ({
  out: jest.fn(),
}))

const { option } = yargs

beforeAll(() => {
  mocked(get).mockResolvedValue({
    result: {
      applicationName: 'applicationName',
      deploymentId: 'deploymentId',
      version: 'version',
      eventStoreId: 'eventStoreId',
      domainName: 'domainName',
    },
  })
})

test('command', () => {
  expect(command).toEqual('describe')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['get'])
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('deployment', {
    alias: 'id',
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledWith('name', {
    describe: expect.any(String),
    type: 'string',
    alias: 'n',
  })
  expect(option).toHaveBeenCalledWith('get-event-store-id', {
    describe: expect.any(String),
    type: 'boolean',
  })
  expect(option).toHaveBeenCalledWith('tag', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledTimes(4)
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(get).mockClear()
    mocked(out).mockClear()
    mocked(columnify).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('formatted output', async () => {
    mocked(columnify).mockReturnValue('result-output')

    await handler({})

    expect(columnify).toHaveBeenCalledWith(
      [
        {
          'application-name': 'applicationName',
          'deployment-id': 'deploymentId',
          version: 'version',
          'event-store-id': 'eventStoreId',
          domain: 'domainName',
          tag: '',
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
    expect(out).toHaveBeenCalledWith('result-output')
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id',
    })

    expect(get).toHaveBeenCalledWith('token', '/deployments/deployment-id')
  })
})
