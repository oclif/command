import * as Config from '@anycli/config'

import {Command} from '.'

export default class Main extends Command {
  static parserOptions = {'--': false, strict: false}

  static run(argv = process.argv.slice(2), opts?: Config.Options) {
    return super.run(argv, opts || module.parent && module.parent.parent && module.parent.parent.filename || __dirname)
  }

  async run() {
    const [id, ...argv] = this.argv
    await this.config.runCommand(id, argv)
  }
}
