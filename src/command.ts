const pjson = require('../package.json')
import * as Config from '@anycli/config'
import Help from '@anycli/help'
import {args} from '@anycli/parser'
import cli from 'cli-ux'
import * as _ from 'lodash'

import {convertToCached, ConvertToCachedOptions} from './cache'
import * as flags from './flags'

const g = global as any
g.anycli = g.anycli || {}

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
  static strict = true
  static flags: flags.Input<any>
  static args: args.IArg[] = []
  static plugin: Config.IPlugin | undefined
  static examples: string[] | undefined

  /**
   * instantiate and run the command
   */
  static run: Config.ICommand['run'] = async function (this: Config.ICommand, argv = process.argv.slice(2), opts = {}) {
    g.anycli.command = {}
    let cmd!: Command
    try {
      let config
      if (opts.config && Config.isIConfig(opts.config)) config = opts.config
      else config = await Config.read({root: opts.root || parentModule!})
      cmd = new this(argv, {...opts, config})
      if (g.anycli.command.showVersion) {
        cli.info(config.userAgent)
        return
      }
      if (argv.includes('--help') || g.anycli.command.showHelp) {
        const Helper: typeof Help = require('@anycli/help').default
        const help = new Helper(config)
        help.command(this.convertToCached())
        cli.info(help.command(this.convertToCached()))
        return
      }
      return await cmd.run()
    } finally {
      if (cmd) await cmd.finally()
    }
  }

  static async load() { return this }

  static convertToCached(this: Config.ICommand, opts: ConvertToCachedOptions = {}): Config.ICachedCommand {
    return convertToCached(this, opts)
  }

  config: Config.IConfig

  // we disable these so that it's clear they need to be static not instance properties
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
