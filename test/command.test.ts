import * as Config from '@dxcli/config'
import cli from 'cli-ux'
import {expect, fancy} from 'fancy-mocha'

import Base from '../src'

class Command extends Base {
  async run() {
    cli.log('foo')
  }
}

describe('run', () => {
  fancy()
  .stdout()
  .run(() => Command.run([]))
  .run(output => expect(output.stdout).to.equal('foo\n'))
  .end('logs to stdout')

  fancy()
  .run(() => {
    const Command: Config.ICommand = class extends Base {
      async run() {
        throw new Error('new x error')
      }
    }

    return Command.run([])
  })
  .catch(/new x error/)
  .end('errors out')

  fancy()
  .stdout()
  .run(() => {
    const Command: Config.ICommand = class extends Base {
      async run() {
        cli.exit(0)
      }
    }
    return Command.run([])
  })
  .catch(/EEXIT: 0/)
  .end('exits with 0')

  describe('help error', () => {
    ['-h', '--help', 'help'].forEach(arg => {
      fancy()
      .run(() => Command.run([arg]))
      .catch((err: any) => expect(err.code).to.equal('EHELP'))
      .end(`throws help error when passed "${arg}"`)
    })

    fancy()
    .run(() => Command.run(['foo']))
    .catch((err: any) => expect(err.code).not.to.equal('EHELP'))
    .end('does not throw help error when passed "foo"')
  })
})
