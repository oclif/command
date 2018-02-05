// tslint:disable no-implicit-dependencies
const pjson = require('../package.json')
import * as Config from '@anycli/config'
import * as Parser from '@anycli/parser'
import Help from '@anycli/plugin-help'

import {ExitError} from './exit'
import * as flags from './flags'
import {compact} from './util'

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
    try {
      this.debug = require('debug')(this.id ? `${this.config.bin}:${this.id}` : this.config.bin)
    } catch { this.debug = () => {} }
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

  exit(code?: number) { throw new ExitError(code || 0) }

  log(s?: string | undefined) {
    process.stdout.write((s || '') + '\n')
  }

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<any>
  protected async init() {
    this.debug('init version: %s argv: %o', this.ctor._base, this.argv)
    global['cli-ux'] = global['cli-ux'] || {}
    global['cli-ux'].debug = global['cli-ux'].debug || !!this.config.debug
    global['cli-ux'].errlog = global['cli-ux'].errlog || this.config.errlog
    global['cli-ux'].context = global['cli-ux'].context || {
      command: compact([this.id, ...this.argv]).join(' '),
      version: this.config.userAgent,
    }
    global['http-call'] = global['http-call'] || {}
    global['http-call']!.userAgent = this.config.userAgent
    await this.config.runHook('init', {argv: this.argv})
    if (this._helpOverride()) return this._help()
  }

  protected parse<F, A extends {[name: string]: any}>(options?: Parser.Input<F>, argv = this.argv): Parser.Output<F, A> {
    if (!options) options = this.constructor as any
    return require('@anycli/parser').parse(argv, {context: this, ...options})
  }

  protected async catch(err: any) {
    if (err && err['cli-ux'] && err['cli-ux'].exit !== undefined) {
      process.exitCode = err['cli-ux'].exit
    } else if (err.message.match(/Unexpected arguments?: (-h|--help)(,|\n)/)) {
      this._help()
    } else if (err.message.match(/Unexpected arguments?: (-v|--version)(,|\n)/)) {
      this._version()
    } else throw err
  }
  protected async finally(_: Error | undefined) {
    try {await require('cli-ux').done()} catch {}
  }

  protected _help() {
    const HHelp: typeof Help = require('@anycli/plugin-help').default
    const help = new HHelp(this.config)
    help.showHelp(this.argv)
    this.exit(0)
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
    this.log(this.config.userAgent)
    this.exit(0)
  }
}
