export class HelpErr extends Error {
  code = 'EHELP'

  constructor(message: string) {
    super(message)
  }
}
