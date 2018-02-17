import * as Config from '@oclif/config'
import Help from '@oclif/plugin-help'

import {Command, flags} from '.'

export class Main extends Command {
  static flags = {
    version: flags.version(),
    help: flags.help(),
  }

  static run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
    return super.run(argv, options || module.parent && module.parent.parent && module.parent.parent.filename || __dirname)
  }

  async run() {
    let [id, ...argv] = this.argv
    await this.config.runHook('init', {id, argv})
    this.parse({strict: false, '--': false, ...this.ctor as any})
    await this.config.runCommand(id, argv)
  }

  protected _helpOverride(): boolean {
    if (['-v', '--version', 'version'].includes(this.argv[0])) return this._version() as any
    if (this.argv[0] === '-h') return true
    if (this.argv.length === 0) return true
    for (let arg of this.argv) {
      if (arg === '--help') return true
      if (arg === '--') return false
    }
    return false
  }

  protected _help() {
    const HHelp: typeof Help = require('@oclif/plugin-help').default
    const help = new HHelp(this.config)
    help.showHelp(this.argv)
    this.exit(0)
  }
}

export function run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
  return Main.run(argv, options)
}
