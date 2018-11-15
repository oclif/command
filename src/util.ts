export function compact<T>(a: (T | undefined)[]): T[] {
  return a.filter((a): a is T => !!a)
}

/**
 * Splits argv to command ID and the rest of the array.
 *
 * For space-separated subcommands, the ID is built from multiple items
 * in the source array.
 */
export function splitArgv(argv: string[], commandIDs: string[]) {
  let argvIndex = 0
  let id = ''
  let idCandidate = argv[argvIndex]

  while (commandIDs.some(commandID => commandID.startsWith(idCandidate))) {
    id = idCandidate
    argvIndex++
    idCandidate += ` ${argv[argvIndex]}`
  }

  return {
    id,
    argv: argv.slice(argvIndex),
  }
}
