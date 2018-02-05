declare namespace NodeJS {
  interface Global {
    'cli-ux': {
      errlog?: string
      debug?: boolean
      context?: any
    },
    'http-call'?: {
      userAgent?: string
    }
  }
}
