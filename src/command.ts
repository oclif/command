const pjson = require('../package.json')
import * as Config from '@anycli/config'
import {args} from '@anycli/parser'
import cli from 'cli-ux'
import * as _ from 'lodash'

import {convertToCached, ConvertToCachedOptions} from './cache'
import deps from './deps'
import * as flags from './flags'

export type CommandRunFn = <T extends Command>(this: ICommandClass<T>, argv?: string[], opts?: Config.ICommandOptions) => Promise<void>

export interface ICommandClass<T extends Command> {
  run: CommandRunFn
  new (argv: string[], config: Config.IConfig): T
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
  static parse: boolean = true

  /**
   * instantiate and run the command
   */
  static run: CommandRunFn = async function (argv: string[] = process.argv.slice(2), opts: Config.ICommandOptions = {}) {
    let cmd!: Command
    try {
      let config
      if (Config.isIConfig(opts)) config = opts
      else config = await Config.read({root: opts.root || parentModule!})
      cmd = new this(argv, config)
      return await cmd.run()
    } finally {
      if (cmd) await cmd.finally()
    }
  }

  static async load() { return this }

  static convertToCached(opts: ConvertToCachedOptions = {}): Config.ICachedCommand {
    return convertToCached(this, opts)
  }

  argv!: string[]
  flags!: flags.Output
  args!: args.Output

  // prevent setting things that need to be static
  description!: null
  hidden!: null
  usage!: null
  aliases!: null
  title!: null
  variableArgs!: null
  examples!: null

  protected debug: (...args: any[]) => void

  constructor(argv: string[], public config: Config.IConfig) {
    g['http-call'] = g['http-call'] || {}
    g['http-call']!.userAgent = config.userAgent
    this.debug = require('debug')(this.ctor.id ? `${config.bin}:${this.ctor.id}` : config.bin)
    this.debug('init version: %s argv: %o', this.ctor._base, argv)
    cli.config.context.command = _.compact([this.ctor.id, ...argv]).join(' ')
    cli.config.context.version = config.userAgent
    if (config.debug) cli.config.debug = true
    cli.config.errlog = config.errlog
    if (!this.ctor.parse) {
      this.argv = argv.slice(1)
      return
    }
    try {
      const parse = deps.Parser.parse({
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

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }

  get http() { return require('http-call').HTTP }

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<void>

  protected async finally() {
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
