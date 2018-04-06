// tslint:disable no-implicit-dependencies
const pjson = require('../package.json')
import * as Config from '@oclif/config'
import * as Errors from '@oclif/errors'
import * as Parser from '@oclif/parser'
import Help from '@oclif/plugin-help'
import {format, inspect} from 'util'

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
  static flags?: flags.Input<any>
  static args?: Parser.args.IArg[]
  static plugin: Config.IPlugin | undefined
  static examples: string[] | undefined
  static parserOptions = {}

  /**
   * instantiate and run the command
   */
  static run: Config.Command.Class['run'] = async function (this: Config.Command.Class, argv?: string[], opts?) {
    if (!argv) argv = process.argv.slice(2)
    const config = await Config.load(opts || module.parent && module.parent.parent && module.parent.parent.filename || __dirname)
    let cmd = new this(argv, config)
    return cmd._run(argv)
  }

  id: string | undefined
  protected debug: (...args: any[]) => void

  constructor(public argv: string[], public config: Config.IConfig) {
    this.id = this.ctor.id
    try {
      this.debug = require('debug')(this.id ? `${this.config.bin}:${this.id}` : this.config.bin)
    } catch { this.debug = () => {} }
  }

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }

  async _run<T>(): Promise<T | undefined> {
    let err: Error | undefined
    try {
      await this.init()
      return await this.run()
    } catch (e) {
      err = e
      await this.catch(e)
    } finally {
      await this.finally(err)
    }
  }

  exit(code = 0) { Errors.exit(code) }
  warn(input: string | Error) { Errors.warn(input) }
  error(input: string | Error, options: {code?: string, exit?: number} = {}) {
    Errors.error(input, options)
  }
  log(message = '', ...args: any[]) {
    // tslint:disable-next-line strict-type-predicates
    message = typeof message === 'string' ? message : inspect(message)
    process.stdout.write(format(message, ...args) + '\n')
  }

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<any>
  protected async init() {
    this.debug('init version: %s argv: %o', this.ctor._base, this.argv)
    if (this.config.debug) Errors.config.debug = true
    if (this.config.errlog) Errors.config.errlog = this.config.errlog
    // global['cli-ux'].context = global['cli-ux'].context || {
    //   command: compact([this.id, ...this.argv]).join(' '),
    //   version: this.config.userAgent,
    // }
    global['http-call'] = global['http-call'] || {}
    global['http-call']!.userAgent = this.config.userAgent
    if (this._helpOverride()) return this._help()
  }

  protected parse<F, A extends {[name: string]: any}>(options?: Parser.Input<F>, argv = this.argv): Parser.Output<F, A> {
    if (!options) options = this.constructor as any
    return require('@oclif/parser').parse(argv, {context: this, ...options})
  }

  protected async catch(err: any) {
    if (err.message.match(/Unexpected arguments?: (-h|--help|help)(,|\n)/)) {
      this._help()
    } else if (err.message.match(/Unexpected arguments?: (-v|--version|version)(,|\n)/)) {
      this._version()
    } else throw err
  }
  protected async finally(_: Error | undefined) {
    try {
      await require('@oclif/errors').config.errorLogger.flush()
      // tslint:disable-next-line no-console
    } catch (err) { console.error(err) }
  }

  protected _help() {
    const HHelp: typeof Help = require('@oclif/plugin-help').default
    const help = new HHelp(this.config)
    let title = this.ctor.description && help.render(this.ctor.description).split('\n')[0]
    if (title) this.log(title + '\n')
    this.log(help.command(Config.Command.toCached(this.ctor as any as Config.Command.Class)))
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
