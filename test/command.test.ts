import {describe, expect, it, output} from '@dxcli/dev-test'
import cli from 'cli-ux'

import Base, {HelpErr} from '../src'

class Command extends Base {
  async run() {
    cli.log('foo')
  }
}

describe.stdout.stderr('run', () => {
  it('logs to stdout', async () => {
    await Command.run([])
    expect(output.stdout).to.equal('foo\n')
  })

  it('errors out', async () => {
    class Command extends Base {
      async run() {
        throw new Error('new x error')
      }
    }

    await expect(Command.run([])).to.eventually.be.rejectedWith(/new x error/)
  })

  describe('help error', () => {
    ['-h', '--help', 'help'].forEach(arg => {
      it(`throws help error when passed "${arg}"`, async () => {
        await expect(Command.run([arg])).to.eventually.be.rejectedWith(HelpErr)
      })
    })
    it('does not throw help error when passed "foo"', async () => {
      await expect(Command.run(['foo'])).to.not.eventually.be.rejectedWith(HelpErr)
    })
  })
})
