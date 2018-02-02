import * as Config from '@anycli/config'
import * as _ from 'lodash'

export function convertToCached(c: Config.ICommand, opts: Config.IConvertToCachedOptions = {}): Config.ICachedCommand {
  return {
    _base: c._base,
    title: c.title,
    id: c.id || opts.id!,
    description: c.description,
    usage: c.usage,
    pluginName: opts.pluginName,
    hidden: c.hidden,
    aliases: c.aliases || [],
    flags: _.mapValues(c.flags || {}, (flag, name) => {
      if (flag.type === 'boolean') {
        return {
          name,
          type: flag.type,
          char: flag.char,
          description: flag.description,
          hidden: flag.hidden,
          required: flag.required,
        }
      }
      return {
        name,
        type: flag.type,
        char: flag.char,
        description: flag.description,
        hidden: flag.hidden,
        required: flag.required,
        helpValue: flag.helpValue,
        options: flag.options,
        default: _.isFunction(flag.default) ? flag.default({options: {}, flags: {}}) : flag.default,
      }
    }),
    args: c.args ? c.args.map(a => ({
      name: a.name,
      description: a.description,
      required: a.required,
      options: a.options,
      default: _.isFunction(a.default) ? a.default({}) : a.default,
      hidden: a.hidden,
    })) : {} as Config.ICachedCommand['args'],
    load: async () => c,
  }
}
