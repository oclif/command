const pjson = require('../package.json')
import * as Config from '@dxcli/config'
import {args} from '@dxcli/parser'
import cli from 'cli-ux'

import deps from './deps'
import * as flags from './flags'

export type CommandRunFn = <T extends Command>(this: ICommandClass<T>, argv?: string[], opts?: Config.ICommandOptions) => Promise<void>

export interface ICommandClass<T extends Command> {
  run: CommandRunFn
  new (): T
}

const g = global as any

const parentModule = module.parent && module.parent.parent && module.parent.parent.filename

export default abstract class Command {
  static _base = `${pjson.name}@${pjson.version}`
  static id: string
  static description: string | undefined
  static hidden: boolean
  static usage: string | undefined
  static help: string | undefined
  static aliases: string[] = []
  static variableArgs = false
  static flags: flags.Input
  static args: args.IArg[] = []
  static plugin: Config.IPlugin | undefined

  /**
   * instantiate and run the command
   */
  static run: CommandRunFn = function (argv: string[] = process.argv.slice(2), opts: Config.ICommandOptions = {}) {
    const cmd = new this()
    return cmd._run(argv, opts)
  }
  static async load() { return this }

  config: Config.IConfig
  flags: { [name: string]: any } = {}
  argv: string[]
  args: { [name: string]: string } = {}

  // prevent setting things that need to be static
  topic: null
  command: null
  description: null
  hidden: null
  usage: null
  help: null
  aliases: null

  protected debug: (...args: any[]) => void

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }

  get http() { return require('http-call').HTTP }

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<void>

  protected async _run(argv: string[], opts: Config.ICommandOptions) {
    try {
      await this.init(argv, opts)
      await this.run()
      await this.done()
    } catch (err) {
      if (err.code === 'EEXIT') throw err
      if (this.config && this.config.engine) {
        await this.config.engine.runHook('error', err)
      }
      cli.error(err)
    }
  }

  protected async init(argv: string[], opts: Config.ICommandOptions) {
    this.config = opts.config || await Config.read({root: opts.root || parentModule!})
    g['http-call'] = g['http-call'] || {}
    g['http-call']!.userAgent = this.config.userAgent
    this.debug = require('debug')(`cli:command:${this.ctor.id || this.config.name}`)
    this.debug('init version: %s argv: %o', this.ctor._base, argv)
    cli.config.debug = !!this.config.debug
    cli.config.errlog = this.config.errlog
    try {
      const parse = await deps.Parser.parse({
        argv,
        args: this.ctor.args || [],
        flags: this.ctor.flags || {},
        strict: !this.ctor.variableArgs,
      })
      this.flags = parse.flags
      this.argv = parse.argv
      this.args = parse.args
    } catch (err) {
      if (err.message.match(/^Unexpected argument: (-h|help|--help)/)) {
        throw new deps.HelpErr(err.message)
      }
      throw err
    }
  }

  protected async done() {
    try {
      await cli.done()
    } catch (err) {
      cli.warn(err)
    }
  }
}
