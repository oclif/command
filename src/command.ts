const pjson = require('../package.json')
import * as Config from '@anycli/config'
import * as Parser from '@anycli/parser'
import Help from '@anycli/plugin-help'
import cli from 'cli-ux'
import * as _ from 'lodash'

import * as flags from './flags'

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
  static parse = true
  static flags: flags.Input<any> = {
    version: flags.version(),
    help: flags.help(),
  }
  static args: Parser.args.IArg[] = []
  static plugin: Config.IPlugin | undefined
  static examples: string[] | undefined
  static parserOptions = {}

  /**
   * instantiate and run the command
   */
  static run: Config.Command.Class['run'] = async function (this: Config.Command.Class, argv = process.argv.slice(2), opts) {
    let cmd = new this(argv, opts)
    await cmd._run(argv)
  }

  // we disable these so that it's clear they need to be static not instance properties
  description!: null
  hidden!: null
  usage!: null
  aliases!: null
  title!: null
  strict!: null
  examples!: null

  id: string | undefined
  config: Config.IConfig
  protected debug: (...args: any[]) => void

  constructor(public argv: string[], options: Config.Options) {
    this.id = this.ctor.id
    this.config = Config.load(options || module.parent && module.parent.parent && module.parent.parent.filename || __dirname)
    this.debug = require('debug')(this.id ? `${this.config.bin}:${this.id}` : this.config.bin)
  }

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }

  async _run(): Promise<void> {
    let err: Error | undefined
    try {
      await this.init()
      await this.run()
    } catch (e) {
      err = e
      await this.catch(e)
    } finally {
      await this.finally(err)
    }
  }

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<any>
  protected async init() {
    this.debug('init version: %s argv: %o', this.ctor._base, this.argv)
    cli.config.context.command = _.compact([this.id, ...this.argv]).join(' ')
    cli.config.context.version = this.config.userAgent
    if (this.config.debug) cli.config.debug = true
    cli.config.errlog = this.config.errlog
    global['http-call'] = global['http-call'] || {}
    global['http-call']!.userAgent = this.config.userAgent
    await this.config.runHook('init', {id: this.id})
    if (this._helpOverride()) return this._help()
  }

  protected parse<F, A extends {[name: string]: any}>(options?: Parser.Input<F>, argv = this.argv): Parser.Output<F, A> {
    if (!options) options = this.constructor as any
    return Parser.parse(argv, {context: this, ...options})
  }

  protected async catch(err: Error) {
    if (err.message.match(/Unexpected arguments?: (-h|--help)(,|\n)/)) {
      this._help()
    } else if (err.message.match(/Unexpected arguments?: (-v|--version)(,|\n)/)) {
      this._version()
    } else cli.error(err)
  }
  protected async finally(_: Error | undefined) {
    try {
      await cli.done()
    } catch (err) {
      cli.warn(err)
    }
  }

  protected _help() {
    const HHelp: typeof Help = require('@anycli/plugin-help').default
    const help = new HHelp(this.config)
    help.showHelp(this.argv)
    cli.exit(0)
  }

  protected _helpOverride(): boolean {
    if (this.argv[0] === '--version' || this.argv[0] === 'version') this._version()
    for (let arg of this.argv) {
      if (arg === '--help') return true
      if (arg === '--') return false
    }
    return false
  }

  protected _version() {
    cli.info(this.config.userAgent)
    cli.exit(0)
  }
}
