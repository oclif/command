import * as Config from '@dxcli/config'
import cli from 'cli-ux'
import {expect, fancy} from 'fancy-test'

import Base from '../src'

class Command extends Base {
  static description = 'test command'
  async run() {
    cli.log('foo')
  }
}

describe('run', () => {
  fancy
  .stdout()
  .do(() => Command.run([]))
  .do(output => expect(output.stdout).to.equal('foo\n'))
  .it('logs to stdout')

  fancy
  .do(() => {
    const Command: Config.ICommand = class extends Base {
      async run() {
        throw new Error('new x error')
      }
    }

    return Command.run([])
  })
  .catch(/new x error/)
  .it('errors out')

  fancy
  .stdout()
  .do(() => {
    const Command: Config.ICommand = class extends Base {
      async run() {
        cli.exit(0)
      }
    }
    return Command.run([])
  })
  .catch(/EEXIT: 0/)
  .it('exits with 0')

  describe('help error', () => {
    ['-h', '--help', 'help'].forEach(arg => {
      fancy
      .do(() => Command.run([arg]))
      .catch((err: any) => expect(err.code).to.equal('EHELP'))
      .it(`throws help error when passed "${arg}"`)
    })

    fancy
    .do(() => Command.run(['foo']))
    .catch((err: any) => expect(err.code).not.to.equal('EHELP'))
    .it('does not throw help error when passed "foo"')
  })

  describe('convertToCached', () => {
    fancy
    .do(() => {
      const c = Command.convertToCached()
      expect(c.description).to.equal('test command')
    })
    .it('converts to cached')
  })
})
