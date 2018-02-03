import * as Config from '@anycli/config'

import {Command, flags} from '.'

export class Main extends Command {
  static flags = {
    version: flags.version(),
    help: flags.help(),
  }

  static run(argv = process.argv.slice(2), options?: Config.Options) {
    return super.run(argv, options || module.parent && module.parent.parent && module.parent.parent.filename || __dirname)
  }

  async run() {
    let [id, ...argv] = this.argv
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
}

export function run(argv = process.argv.slice(2), options?: Config.Options) {
  return Main.run(argv, options)
}
