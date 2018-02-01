import * as Config from '@anycli/config'
import cli from 'cli-ux'
import {expect, fancy} from 'fancy-test'

import Base, {flags, parse} from '../src'

const pjson = require('../package.json')

class Command extends Base {
  static description = 'test command'

  async run() {
    cli.log('foo')
  }
}

describe('command', () => {
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
            options: ['a', 'b'],
            default: () => 'mydefault',
          }),
        }
        static args = [
          {
            name: 'arg1',
            description: 'arg1 desc',
            required: true,
            hidden: false,
            options: ['af', 'b'],
            default: () => 'myadefault',
          }
        ]
      }.convertToCached({id: 'foo:bar'})
      expect(await c.load()).to.have.property('run')
      delete c.load
      expect(c).to.deep.equal({
        _base: `@anycli/command@${pjson.version}`,
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
            helpValue: undefined,
            default: 'mydefault',
            options: ['a', 'b'],
          }
        },
        args: [
          {
            description: 'arg1 desc',
            name: 'arg1',
            hidden: false,
            required: true,
            options: ['af', 'b'],
            default: 'myadefault',
          }
        ],
      })
    })
    .it('converts to cached with everything set')

    fancy
    .do(async () => {
      const c = class extends Command {
      }.convertToCached()
      expect(await c.load()).to.have.property('run')
      delete c.load
      expect(c).to.deep.equal({
        _base: `@anycli/command@${pjson.version}`,
        id: undefined,
        hidden: undefined,
        pluginName: undefined,
        description: 'test command',
        aliases: [],
        title: undefined,
        usage: undefined,
        flags: {},
        args: [],
      })
    })

    .it('adds plugin name')
    fancy
    .do(async () => {
      const c = class extends Command {
      }.convertToCached({plugin: {name: 'myplugin'} as any})
      expect(await c.load()).to.have.property('run')
      delete c.load
      expect(c).to.deep.equal({
        _base: `@anycli/command@${pjson.version}`,
        id: undefined,
        hidden: undefined,
        pluginName: 'myplugin',
        description: 'test command',
        aliases: [],
        title: undefined,
        usage: undefined,
        flags: {},
        args: [],
      })
    })
    .it('converts to cached with nothing set')
  })

  describe('http', () => {
    fancy
    .nock('https://api.github.com', nock => nock.get('/me').reply(200, {name: 'jdxcode'}))
    .stdout()
    .it('makes http call', async ctx => {
      const cmd = class extends Base {
        async run() {
          let {body: user} = await this.http.get('https://api.github.com/me')
          cli.log(user.name)
        }
      }

      await cmd.run([])
      expect(ctx.stdout).to.equal('jdxcode\n')
    })
  })

  describe('load', () => {
    fancy
    .it('returns self', async () => {
      const cmd = class extends Base {
        async run() {}
      }

      expect(await cmd.load()).to.equal(cmd)
    })
  })

  describe('parse', () => {
    fancy
    .stdout()
    .it('has a flag', async ctx => {
      class CMD extends Base {
        static flags = {
          foo: flags.string()
        }
        options = parse(this.argv, CMD)

        async run() {
          cli.log(this.options.flags.foo)
        }
      }

      await CMD.run(['--foo=bar'])
      expect(ctx.stdout).to.equal('bar\n')
    })
  })
})
