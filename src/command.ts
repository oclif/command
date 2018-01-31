const pjson = require('../package.json')
import * as Config from '@anycli/config'
import {args} from '@anycli/parser'
import cli from 'cli-ux'
import * as _ from 'lodash'

import {convertToCached, ConvertToCachedOptions} from './cache'
import * as flags from './flags'

export type CommandRunFn = <T extends Command>(this: ICommandClass<T>, argv?: string[], opts?: Partial<Config.ICommandOptions>) => Promise<void>

export interface ICommandClass<T extends Command> {
  run: CommandRunFn
  new (argv: string[], opts: Config.ICommandOptions): T
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
  static strict = false
  static flags: flags.Input<any>
  static args: args.IArg[] = []
  static plugin: Config.IPlugin | undefined
  static examples: string[] | undefined

  /**
   * instantiate and run the command
   */
  static run: CommandRunFn = async function (argv = process.argv.slice(2), opts = {}) {
    let cmd!: Command
    try {
      let config
      if (opts.config && Config.isIConfig(opts.config)) config = opts.config
      else config = await Config.read({root: opts.root || parentModule!})
      cmd = new this(argv, {...opts, config})
      return await cmd.run()
    } finally {
      if (cmd) await cmd.finally()
    }
  }

  static async load() { return this }

  static convertToCached(opts: ConvertToCachedOptions = {}): Config.ICachedCommand {
    return convertToCached(this, opts)
  }

  config: Config.IConfig

  // prevent setting things that need to be static
  description!: null
  hidden!: null
  usage!: null
  aliases!: null
  title!: null
  strict!: null
  examples!: null

  protected debug: (...args: any[]) => void

  constructor(public argv: string[], public opts: Config.ICommandOptions) {
    this.config = opts.config
    this.debug = require('debug')(this.ctor.id ? `${this.config.bin}:${this.ctor.id}` : this.config.bin)
    this.debug('init version: %s argv: %o', this.ctor._base, argv)
    cli.config.context.command = _.compact([this.ctor.id, ...argv]).join(' ')
    cli.config.context.version = this.config.userAgent
    if (this.config.debug) cli.config.debug = true
    cli.config.errlog = this.config.errlog
    g['http-call'] = g['http-call'] || {}
    g['http-call']!.userAgent = this.config.userAgent
    this.init()
  }

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }

  get http() { return require('http-call').HTTP }

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<void>
  protected init(): void {}
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
