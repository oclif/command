export function compact<T>(a: (T | undefined)[]): T[] {
  return a.filter((a): a is T => !!a)
}

/**
 * Splits argv to command ID and the rest of the array.
 *
 * For space-separated subcommands, the ID is built from multiple items in
 * the source array. For colon-separated subcommands, the argv item is the ID.
 */
export function splitArgv(argv: string[], commandIDs: string[]) {
  let argvIndex = 0
  let id = ''
  let idCandidate = argv[argvIndex]

  while (commandIDs.includes(idCandidate) || !id) {
    if (commandIDs.includes(idCandidate)) {
      id = idCandidate
    }
    argvIndex++
    if (argvIndex > argv.length) {
      break
    }

    idCandidate += ` ${argv[argvIndex]}`
  }

  if (id === '') {
    throw new Error('Command ID not found')
  }

  return {
    id,
    argv: argv.slice(argvIndex),
  }
}
