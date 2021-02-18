import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  aliases,
  handler,
  builder,
  describe as commandDescription,
} from '../../../../../commands/sagas/properties/delete'
import { del } from '../../../../../api/client'
import refreshToken from '../../../../../refreshToken'

jest.mock('../../../../../api/client', () => ({
  del: jest.fn(),
}))

jest.mock('../../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

const version = '0.0.0'

jest.mock('../../../../../config', () => ({
  getResolvePackageVersion: jest.fn(() => version),
}))

jest.mock('../../../../../utils/get-deployment-id', () => jest.fn(() => 'deployment-id'))

const { positional, option } = yargs

test('command', () => {
  expect(command).toEqual('delete <saga> <property>')
  expect(commandDescription).toEqual(expect.any(String))
  expect(aliases).toEqual(['rm', 'remove'])
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('saga', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledWith('property', {
    describe: expect.any(String),
    type: 'string',
  })
  expect(positional).toHaveBeenCalledTimes(2)

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
    mocked(del).mockClear()
  })

  test('wrapped with refreshToken', async () => {
    await handler({})

    expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  })

  test('api call', async () => {
    await handler({
      deployment: 'deployment-id',
      saga: 'saga-name',
      property: 'prop-name',
    })

    expect(del).toHaveBeenCalledWith(
      'token',
      'deployments/deployment-id/sagas/saga-name/properties/prop-name',
      {}
    )
  })
})
