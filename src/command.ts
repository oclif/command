const pjson = require('../package.json')
import * as Config from '@dxcli/config'
import {args} from '@dxcli/parser'
import cli from 'cli-ux'
import * as _ from 'lodash'

import {convertToCached, ConvertToCachedOptions} from './cache'
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
  static title: string | undefined
  static description: string | undefined
  static hidden: boolean
  static usage: string | string[] | undefined
  static help: string | undefined
  static aliases: string[] = []
  static variableArgs = false
  static flags: flags.Input<any>
  static args: args.IArg[] = []
  static plugin: Config.IPlugin | undefined
  static examples: string[] | undefined

  /**
   * instantiate and run the command
   */
  static run: CommandRunFn = function (argv: string[] = process.argv.slice(2), opts: Config.ICommandOptions = {}) {
    const cmd = new this()
    return cmd._run(argv, opts)
  }

  static async load() { return this }

  static convertToCached(opts: ConvertToCachedOptions = {}): Config.ICachedCommand {
    return convertToCached(this, opts)
  }

  config: Config.IConfig
  argv: string[]
  flags: flags.Output
  args: args.Output

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
        try {
          await this.config.engine.runHook('error', err)
        } catch (err) {
          cli.warn(err, {context: {description: 'error running hook'}})
        }
      }
      cli.error(err)
    }
  }

  protected async init(argv: string[], opts: Config.ICommandOptions) {
    this.config = opts.config || await Config.read({root: opts.root || parentModule!})
    this.initDebug(this.config)
    this.debug('init version: %s argv: %o', this.ctor._base, argv)
    cli.config.context.command = _.compact([this.ctor.id, ...argv]).join(' ')
    try {
      const parse = await deps.Parser.parse({
        argv,
        args: this.ctor.args || [],
        flags: this.ctor.flags || {},
        strict: !this.ctor.variableArgs,
      })
      this.flags = parse.flags as any
      this.argv = parse.argv
      this.args = parse.args
    } catch (err) {
      if (err.message.match(/^Unexpected argument: (-h|help|--help)/)) {
        throw new deps.HelpErr(err.message)
      }
      throw err
    }
  }

  protected initDebug(config: Config.IConfig) {
    g['http-call'] = g['http-call'] || {}
    g['http-call']!.userAgent = config.userAgent
    this.debug = require('debug')(`@dxcli/command:${this.ctor.id || config.name}`)
    cli.config.context.version = config.userAgent
    if (config.debug) cli.config.debug = true
    cli.config.errlog = config.errlog
  }

  protected async done() {
    try {
      await cli.done()
    } catch (err) {
      cli.warn(err)
    }
  }
}

export {
  convertToCached,
  ConvertToCachedOptions,
}
