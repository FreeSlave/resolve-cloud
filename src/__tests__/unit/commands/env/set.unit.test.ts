import yargs from 'yargs'
import { mocked } from 'ts-jest/utils'

import {
  command,
  // handler,
  builder,
  describe as commandDescription,
} from '../../../../commands/env/set'
import { post } from '../../../../api/client'
import refreshToken from '../../../../refreshToken'

jest.mock('../../../../api/client', () => ({
  post: jest.fn(),
}))

jest.mock('../../../../refreshToken', () =>
  jest.fn((h: any) => (...args: Array<any>) => h('token', ...args))
)

const { positional, option } = yargs

test('command', () => {
  expect(command).toEqual('set <variables...>')
  expect(commandDescription).toEqual(expect.any(String))
})

test('options', () => {
  builder(yargs)

  expect(positional).toHaveBeenCalledWith('variables', {
    describe: expect.any(String),
    type: 'array',
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
    mocked(post).mockClear()
  })

  // test('wrapped with refreshToken', async () => {
  //   await handler({ deployment: 'deployment-id', variables: ['VAR_A=var_a', 'VAR_B=var_b'] })
  //
  //   expect(refreshToken).toHaveBeenCalledWith(expect.any(Function))
  // })
  //
  // test('api call', async () => {
  //   await handler({ deployment: 'deployment-id', variables: ['VAR_A=var_a', 'VAR_B=var_b'] })
  //
  //   expect(post).toHaveBeenCalledWith('token', 'deployments/deployment-id/environment', {
  //     variables: {
  //       VAR_A: 'var_a',
  //       VAR_B: 'var_b',
  //     },
  //   })
  // })
})
