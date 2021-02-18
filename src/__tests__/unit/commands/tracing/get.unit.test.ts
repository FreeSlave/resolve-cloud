import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/tracing/get'
import { get } from '../../../../api/client'
import { out } from '../../../../utils/std'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  get: jest.fn(() => ({
    result: 'trace-output',
  })),
}))

jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
jest.mock('../../../../utils/std', () => ({
  out: jest.fn(),
}))

jest.mock('../../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { positional, option } = yargs

test('command', () => {
  expect(command).toEqual('get <traceId>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('trace-id', {
    describe: expect.any(String),
    type: 'string',
  })

  expect(positional).toHaveBeenCalledTimes(1)

  expect(option).toHaveBeenCalledWith('deployment', {
    alias: 'id',
    describe: expect.any(String),
    type: 'string',
  })

  expect(option).toHaveBeenCalledWith('name', {
    alias: 'n',
    describe: expect.any(String),
    type: 'string',
  })
  expect(option).toHaveBeenCalledTimes(2)
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(get).mockClear()
    mocked(out).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('console output', async () => {
    await handler({ deployment: 'deployment-id' })

    expect(out).toHaveBeenCalledWith('"trace-output"')
  })

  test('api call', async () => {
    await handler({ deployment: 'deployment-id', 'trace-id': 'trace-id' })

    expect(get).toHaveBeenCalledWith('token', 'deployments/deployment-id/tracing/details', {
      traceIds: 'trace-id',
    })
  })
})
