import * as Config from '@oclif/config'
import Help from '@oclif/plugin-help'

import {Command} from '.'

export class Main extends Command {
  static run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
    return super.run(argv, options || module.parent && module.parent.parent && module.parent.parent.filename || __dirname)
  }

  async init() {
    let [id, ...argv] = this.argv
    await this.config.runHook('init', {id, argv})
    return super.init()
  }

  async run() {
    const {id, argv} = this.splitArgv()
    this.parse({strict: false, '--': false, ...this.ctor as any})
    if (!this.config.findCommand(id)) {
      let topic = this.config.findTopic(id)
      if (topic) return this._help()
    }
    await this.config.runCommand(id, argv)
  }

  splitArgv() {
    // For example, if this.argv is ['user', 'add', 'Peter'] and this.config.commandIDs
    // contain the 'user add' command, this function returns {id: 'user add', argv: ['Peter']}
    let argvIndex = 0
    let id = ''
    let idCandidate = this.argv[argvIndex]
    const {commandIDs} = this.config // avoid expensive getter in the loop

    while (commandIDs.some(commandID => commandID.startsWith(idCandidate))) {
      id = idCandidate
      argvIndex++
      idCandidate += ` ${this.argv[argvIndex]}`
    }

    return {
      id,
      argv: this.argv.slice(argvIndex),
    }
  }

  protected _helpOverride(): boolean {
    if (['-v', '--version', 'version'].includes(this.argv[0])) return this._version() as any
    if (['-h', 'help'].includes(this.argv[0])) return true
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
    return this.exit(0)
  }
}

export function run(argv = process.argv.slice(2), options?: Config.LoadOptions) {
  return Main.run(argv, options)
}
