import Parser = require('@dxcli/parser')

import errors = require('./errors')

export const deps = {
  // remote
  get Parser(): typeof Parser { return fetch('@dxcli/parser') },

  // local
  get HelpErr(): typeof errors.HelpErr { return fetch('./errors').HelpErr },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}

export default deps
