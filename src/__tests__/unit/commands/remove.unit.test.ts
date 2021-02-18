import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  aliases,
  // handler,
  builder,
  describe as commandDescription,
} from '../../../commands/remove'
import { del } from '../../../api/client'
import refreshToken from '../../../refreshToken'

jest.mock('../../../api/client', () => ({
  del: jest.fn(),
  get: jest.fn(),
}))
jest.mock('../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)
const version = '0.0.0'

jest.mock('../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))
jest.mock('../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { option } = yargs

test('command', () => {
  expect(command).toEqual('remove')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['rm'])
})

test('options', () => {
  builder(yargs)

  expect(option).toHaveBeenCalledWith('with-event-store', {
    describe: expect.any(String),
    type: 'boolean',
    default: false,
  })
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
  expect(option).toHaveBeenCalledTimes(3)
})

describe('handler', () => {
  afterEach(() => {
    mocked(refreshToken).mockClear()
    mocked(del).mockClear()
  })

  // test('wrapped with refreshToken', async () => {
  //   await handler({
  //     deployment: 'deployment-id',
  //   })
  //
  //   expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  // })
  //
  // test('api call', async () => {
  //   await handler({
  //     deployment: 'deployment-id',
  //   })
  //
  //   expect(del).toHaveBeenCalledWith('token', '/deployments/deployment-id', {
  //     version,
  //   })
  // })
  //
  // test('api call with drop linked event-store', async () => {
  //   await handler({
  //     deployment: 'deployment-id',
  //     'with-eventstore': true,
  //   })
  //
  //   expect(del).toHaveBeenCalledWith('token', '/deployments/deployment-id', {
  //     version,
  //     withEventStore: true,
  //   })
  // })
})
