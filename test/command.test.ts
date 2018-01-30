import * as Config from '@dxcli/config'
import cli from 'cli-ux'
import {expect, fancy} from 'fancy-test'

import Base, {flags} from '../src'

const pjson = require('../package.json')

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
    .do(async () => {
      const c = class extends Command {
        static title = 'cmd title'
        static usage = ['$ usage']
        static description = 'test command'
        static aliases = ['alias1', 'alias2']
        static hidden = true
        static flags = {
          flaga: flags.boolean(),
          flagb: flags.string({
            char: 'b',
            hidden: true,
            required: false,
            description: 'flagb desc',
          }),
        }
        static args = [
          {
            name: 'arg1',
            description: 'arg1 desc',
            required: true,
            hidden: false,
          }
        ]
      }.convertToCached({id: 'foo:bar'})
      expect(await c.load()).to.have.property('run')
      delete c.load
      expect(c).to.deep.equal({
        _base: `@dxcli/command@${pjson.version}`,
        id: 'foo:bar',
        hidden: true,
        pluginName: undefined,
        description: 'test command',
        aliases: ['alias1', 'alias2'],
        title: 'cmd title',
        usage: ['$ usage'],
        flags: {
          flaga: {
            char: undefined,
            description: undefined,
            name: 'flaga',
            hidden: undefined,
            required: undefined,
            type: 'boolean',
          },
          flagb: {
            char: 'b',
            description: 'flagb desc',
            name: 'flagb',
            hidden: true,
            required: false,
            type: 'option',
          }
        },
        args: [
          {
            description: 'arg1 desc',
            name: 'arg1',
            hidden: false,
            required: true,
          }
        ],
      })
    })
    .it('converts to cached')
  })
})
