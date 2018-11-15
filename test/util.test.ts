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

  it('Similar but not really - topic level', () => {
    expect(() => splitArgv(['user', 'add', 'Peter'], ['user2'])).to.throw(Error)
  })

  it('Similar but not really - nested level', () => {
    expect(() => splitArgv(['user', 'add', 'Peter'], ['user add2'])).to.throw(Error)
  })

  it('Multiple nesting levels', () => {
    expectEqual(
      splitArgv(['user', 'config', 'frontend', 'add', 'key', 'value'], ['user config frontend add']),
      {id: 'user config frontend add', argv: ['key', 'value']}
    )
  })

  it('Multiple nesting levels, ending in the middle', () => {
    expectEqual(
      splitArgv(['user', 'config', 'frontend', 'add', 'key', 'value'], ['user config frontend']),
      {id: 'user config frontend', argv: ['add', 'key', 'value']}
    )
  })

  it('Flags', () => {
    expectEqual(
      splitArgv(['user', 'add', '--name', 'Peter'], ['user add']),
      {id: 'user add', argv: ['--name', 'Peter']}
    )
  })

})

// Small strongly-typed helper
function expectEqual(expected: ReturnType<typeof splitArgv>, actual: ReturnType<typeof splitArgv>) {
  expect(expected).to.deep.equal(actual)
}
