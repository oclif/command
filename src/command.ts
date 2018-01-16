const pjson = require('../package.json')
import {ConfigOptions, IConfig, IPlugin, isIConfig, PluginConfig} from '@dxcli/config'
import {args} from '@dxcli/parser'
import {HTTP} from 'http-call'

import deps from './deps'
import * as flags from './flags'

export type CommandRunFn = <T extends Command>(this: ICommandClass<T>, argv?: string[], config?: IConfig | ConfigOptions) => Promise<T>

export interface ICommandClass<T extends Command> {
  run: CommandRunFn
  new (config: IConfig): T
}

const parentModule = module.parent && module.parent.parent && module.parent.parent.filename

export default abstract class Command {
  static id?: string
  static description: string | undefined
  static hidden: boolean
  static usage: string | undefined
  static help: string | undefined
  static aliases: string[] = []
  static variableArgs = false
  static flags: flags.Input
  static args: args.IArg[] = []
  static _base = `${pjson.name}@${pjson.version}`
  static plugin: IPlugin | undefined

  /**
   * instantiate and run the command
   */
  static run: CommandRunFn = async function (argv: string[] = process.argv.slice(2), config: IConfig | ConfigOptions = {}) {
    if (!isIConfig(config)) config = await PluginConfig.create({root: parentModule!, ...config})
    const cmd = new this(config as any)
    try {
      await cmd.init(argv)
      await cmd.run()
      await cmd.done()
    } catch (err) {
      // throw HelpErr to allow the CLI to do something with it
      if (err.code === 'EHELP') throw err
      deps.cli.error(err)
    }
    return cmd
  }

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

  get http(): typeof HTTP { return require('http-call').HTTP }

  constructor(protected config: IConfig) {
    global['http-call'] = global['http-call'] || {}
    global['http-call']!.userAgent = config.userAgent
    this.debug = require('debug')(`cli:command:${this.ctor.id || config.name}`)
  }

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<void>

  protected async init(argv: string[]) {
    this.debug('init version: %s argv: %o', this.ctor._base, argv)
    deps.cli.config.errlog = this.config.errlog
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
      await deps.cli.done()
    } catch (err) {
      deps.cli.warn(err)
    }
  }
}
