#!/usr/bin/env ts-node

import * as fs from 'fs'

import Command, {flags} from '..' // use @oclif/command outside this repo

class LS extends Command {
  static flags = {
    version: flags.version(),
    help: flags.help(),
    // run with --dir= or -d=
    dir: flags.string({
      char: 'd',
      default: process.cwd(),
      required: true,
    }),
  }

  async run() {
    const {flags} = this.parse(LS)
    let files = fs.readdirSync(flags.dir)
    for (let f of files) {
      this.log(f)
    }
  }
}

LS.run()
  .then(() => {}, require('@oclif/errors/handle'))
