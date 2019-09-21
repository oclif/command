import * as Config from '@oclif/config'
import Help from '@oclif/plugin-help'

import {Command} from '.'

export class Main extends Command {
  static run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
    return super.run(argv, options || (module.parent && module.parent.parent && module.parent.parent.filename) || __dirname)
  }

  async init() {
    const [id, ...argv] = this.argv
    await this.config.runHook('init', {id, argv})
    return super.init()
  }

  async run() {
    if (this.argv.length === 0) {
      if (this._defaultCommandId) return this._runDefaultCommand()
      return this._help()
    }
    const [id, ...argv] = this.argv
    this.parse({strict: false, '--': false, ...this.ctor as any})
    if (!this.config.findCommand(id)) {
      const topic = this.config.findTopic(id)
      if (topic) return this._help()
      if (this._defaultCommandId) return this._runDefaultCommand()
    }
    await this.config.runCommand(id, argv)
  }

  protected _runDefaultCommand() {
    return this.config.runCommand(this._defaultCommandId || '', [...this.argv], {isRunByDefault: true})
  }

  protected _helpOverride(): boolean {
    if (this.argv.length === 0) {
      return !this._defaultCommandId
    }
    if (['-v', '--version', 'version'].includes(this.argv[0])) return this._version() as any
    if (['-h', 'help'].includes(this.argv[0])) return true
    for (const arg of this.argv) {
      if (arg === '--help') return true
      if (arg === '--') return false
    }
    return false
  }

  protected _help() {
    const HHelp: typeof Help = require('@oclif/plugin-help').default
    const help = new HHelp(this.config)
    help.showHelp(this.argv)
    return this.exit(0)
  }
}

export function run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
  return Main.run(argv, options)
}
