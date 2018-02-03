import * as Config from '@anycli/config'
import cli from 'cli-ux'
import {expect, fancy} from 'fancy-test'

import Base, {flags} from '../src'

// const pjson = require('../package.json')

class Command extends Base {
  static description = 'test command'

  async run() {
    this.parse()
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
    class Command extends Base {
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
    class Command extends Base {
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
    // .skip()
    // .do(async () => {
      // class C extends Command {
      //   static title = 'cmd title'
      //   static type = 'mytype'
      //   static usage = ['$ usage']
      //   static description = 'test command'
      //   static aliases = ['alias1', 'alias2']
      //   static hidden = true
      //   static flags = {
      //     flaga: flags.boolean(),
      //     flagb: flags.string({
      //       char: 'b',
      //       hidden: true,
      //       required: false,
      //       description: 'flagb desc',
      //       options: ['a', 'b'],
      //       default: () => 'mydefault',
      //     }),
      //   }
      //   static args = [
      //     {
      //       name: 'arg1',
      //       description: 'arg1 desc',
      //       required: true,
      //       hidden: false,
      //       options: ['af', 'b'],
      //       default: () => 'myadefault',
      //     }
      //   ]
      // }
      // const c = Config.Command.toCached(C)
      // expect(await c.load()).to.have.property('run')
      // delete c.load
      // expect(c).to.deep.equal({
      //   _base: `@anycli/command@${pjson.version}`,
      //   id: 'foo:bar',
      //   type: 'mytype',
      //   hidden: true,
      //   pluginName: undefined,
      //   description: 'test command',
      //   aliases: ['alias1', 'alias2'],
      //   title: 'cmd title',
      //   usage: ['$ usage'],
      //   flags: {
      //     flaga: {
      //       char: undefined,
      //       description: undefined,
      //       name: 'flaga',
      //       hidden: undefined,
      //       required: undefined,
      //       type: 'boolean',
      //     },
      //     flagb: {
      //       char: 'b',
      //       description: 'flagb desc',
      //       name: 'flagb',
      //       hidden: true,
      //       required: false,
      //       type: 'option',
      //       helpValue: undefined,
      //       default: 'mydefault',
      //       options: ['a', 'b'],
      //     }
      //   },
      //   args: [
      //     {
      //       description: 'arg1 desc',
      //       name: 'arg1',
      //       hidden: false,
      //       required: true,
      //       options: ['af', 'b'],
      //       default: 'myadefault',
      //     }
      //   ],
      // })
    // })
    .it('converts to cached with everything set')

    fancy
    // .skip()
    .do(async () => {
      // const c = class extends Command {
      // }.convertToCached()
      // expect(await c.load()).to.have.property('run')
      // delete c.load
      // expect(c).to.deep.equal({
      //   _base: `@anycli/command@${pjson.version}`,
      //   id: undefined,
      //   type: undefined,
      //   hidden: undefined,
      //   pluginName: undefined,
      //   description: 'test command',
      //   aliases: [],
      //   title: undefined,
      //   usage: undefined,
      //   flags: {},
      //   args: [],
      // })
    })

    .it('adds plugin name')

    fancy
    // .skip()
    // .do(async () => {
    //   const c = class extends Command {
    //   }.convertToCached({pluginName: 'myplugin'})
    //   expect(await c.load()).to.have.property('run')
    //   delete c.load
    //   expect(c).to.deep.equal({
    //     _base: `@anycli/command@${pjson.version}`,
    //     type: undefined,
    //     id: undefined,
    //     hidden: undefined,
    //     pluginName: 'myplugin',
    //     description: 'test command',
    //     aliases: [],
    //     title: undefined,
    //     usage: undefined,
    //     flags: {},
    //     args: [],
    //   })
    // })
    .it('converts to cached with nothing set')
  })

  describe('http', () => {
    fancy
    .nock('https://api.github.com', nock => nock.get('/me').reply(200, {name: 'jdxcode'}))
    .skip()
    .stdout()
    .it('makes http call', async _ => {
      // const cmd = class extends Base {
      //   async run() {
      //     let {body: user} = await this.http.get('https://api.github.com/me')
      //     cli.log(user.name)
      //   }
      // }

      // await cmd.run([])
      // expect(ctx.stdout).to.equal('jdxcode\n')
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

        async run() {
          const {flags} = this.parse(CMD)
          cli.log(flags.foo)
        }
      }

      await CMD.run(['--foo=bar'])
      expect(ctx.stdout).to.equal('bar\n')
    })
  })

  describe('version', () => {
    fancy
    .stdout()
    .it('shows version', async ctx => {
      const config = Config.load()
      class CMD extends Command {
        static flags = {version: flags.version()}

        async run() {
          this.parse(CMD)
        }
      }
      await CMD.run(['--version'])
      expect(ctx.stdout).to.equal(`${config.userAgent}\n`)
    })
  })

  describe('help', () => {
    fancy
    .skip()
    .stdout()
    .it('--help', async ctx => {
      class CMD extends Command {
        static flags = {help: flags.help()}
      }
      await CMD.run(['--help'])
      expect(ctx.stdout).to.contain(`USAGE
  $ @anycli/command`)
    })

    fancy
    .skip()
    .stdout()
    .it('-h', async ctx => {
      class CMD extends Command {}
      await CMD.run(['-h'])
      expect(ctx.stdout).to.contain(`USAGE
  $ @anycli/command`)
    })
  })
})
