import {expect} from 'fancy-test'

import {splitArgv} from '../src/util'

describe('splitArgv', () => {
  it('Colon support (no breaking change)', () => {
    expectEqual(
      splitArgv(['user:add', 'Peter'], ['user:add']),
      {id: 'user:add', argv: ['Peter']}
    )
  })

  it('Space-separated when topic itself is in the list', () => {
    expectEqual(
      splitArgv(['user', 'add', 'Peter'], ['user', 'user add']),
      {id: 'user add', argv: ['Peter']}
    )
  })

  it('Space-separated when topic is missing from the list', () => {
    expectEqual(
      splitArgv(['user', 'add', 'Peter'], ['user add']),
      {id: 'user add', argv: ['Peter']}
    )
  })
})

// Small strongly-typed helper
function expectEqual(expected: ReturnType<typeof splitArgv>, actual: ReturnType<typeof splitArgv>) {
  expect(expected).to.deep.equal(actual)
}
