import * as Config from '@anycli/config'

import {Command} from '.'

export class Main extends Command {
  static parserOptions = {'--': false, strict: false}

  static run(argv = process.argv.slice(2), options?: Config.Options) {
    return super.run(argv, options || module.parent && module.parent.parent && module.parent.parent.filename || __dirname)
  }

  async run() {
    const [id, ...argv] = this.argv
    await this.config.runCommand(id, argv)
  }
}

export function run(argv = process.argv.slice(2), options?: Config.Options) {
  return Main.run(argv, options)
}
