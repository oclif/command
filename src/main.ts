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
    const [id, ...argv] = this.argv
    this.parse({strict: false, '--': false, ...this.ctor as any})
    if (!this.config.findCommand(id)) {
      const topic = this.config.findTopic(id)
      if (topic) return this._help()
    }
    await this.config.runCommand(id, argv)
  }

  protected get _helpAliases() {
    const helpAlias = ['-h', '-help', '--help']
    if (this._helpCommandId) {
      helpAlias.push(this._helpCommandId)
    }
    return helpAlias
  }

  protected get _versionAliases() {
    const versionAlias = ['-v', '-version', '--version']
    if (this._versionCommandId) {
      versionAlias.push(this._versionCommandId)
    }
    return versionAlias
  }

  protected _helpOverride(): boolean {
    if (this._versionAliases.includes(this.argv[0])) return this._version() as any
    if (this._helpAliases.includes(this.argv[0])) return true
    if (this.argv.length === 0) return true
    return super._helpOverride()
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
