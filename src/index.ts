import * as Config from '@anycli/config'

import Command from './command'
import * as flags from './flags'
export {parse} from '@anycli/parser'
export {run, Main} from './main'

export default Command
export {
  Config,
  Command,
  flags,
}
