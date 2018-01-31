#!/usr/bin/env ts-node

import cli from 'cli-ux'
import * as fs from 'fs'

import Command, {flags} from '..' // use @anycli/command outside this repo

class LS extends Command {
  static flags = {
    // run with --dir= or -d=
    dir: flags.string({
      char: 'd',
      default: process.cwd(),
    }),
  }

  async run() {
    let files = fs.readdirSync(this.flags.dir)
    for (let f of files) {
      cli.log(f)
    }
  }
}

LS.run()
