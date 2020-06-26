import * as Config from '@oclif/config'
import {HelpBase} from '@oclif/plugin-help'

import {Command} from '.'
import {getHelpClass} from '@oclif/plugin-help'

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

  protected _versionOverride(): boolean {
    // first arg is version, show version
    const firstArgIsVersion = this.argv[0] === 'version'
    if (firstArgIsVersion) return true

    // if a version flag is found in argv before `--` separator
    for (const arg of this.argv) {
      if (['--version', '-v'].includes(arg)) return true
      if (arg === '--') return false
    }

    return false
  }

  protected _helpOverride(): boolean {
    // first arg is help, show help
    const firstArgIsHelp = this.argv[0] === 'help'
    if (firstArgIsHelp) return true

    // no arguments, show help
    const noArguments = this.argv.length === 0
    if (noArguments) return true

    // if help flag before `--` separator
    for (const arg of this.argv) {
      if (['--help', '-h'].includes(arg)) return true
      if (arg === '--') return false
    }

    return false
  }

  protected _help() {
    const HelpClass = getHelpClass(this.config)
    const help: HelpBase = new HelpClass(this.config)
    help.showHelp(this.argv)
    return this.exit(0)
  }
}

export function run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
  return Main.run(argv, options)
}
