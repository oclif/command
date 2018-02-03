import {Command} from '.'

export default class Main extends Command {
  static parserOptions = {'--': false, strict: false}

  async run() {
    const [id, ...argv] = this.argv
    await this.config.runCommand(id, argv)
  }
}
