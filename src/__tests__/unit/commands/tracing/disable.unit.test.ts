import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  // handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/tracing/disable'
import { post } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  post: jest.fn(),
}))

jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

jest.mock('../../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { option } = yargs

beforeAll(() => {
  mocked(post).mockResolvedValue({
    result: null,
  })
})

test('command', () => {
  expect(command).toEqual('disable')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

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
    mocked(post).mockClear()
  })

  // test('wrapped with refreshToken', async () => {
  //   await handler({})
  //
  //   expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  // })
  //
  // test('api call', async () => {
  //   await handler({ deployment: 'deployment-id' })
  //
  //   expect(post).toHaveBeenCalledWith('token', 'deployments/deployment-id/tracing/disable', {})
  // })
})
