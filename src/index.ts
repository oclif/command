import {parse} from '@anycli/parser'

import Command, {convertToCached} from './command'
import * as flags from './flags'

export * from './errors'

export default Command
export {
  convertToCached,
  Command,
  flags,
  parse,
}
