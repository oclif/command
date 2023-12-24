import Command from './command'

export type CommandConstructor = typeof Command

export const makeDecorator = <Field extends keyof CommandConstructor>(field: Field) =>
  (value: CommandConstructor[Field]) =>
    (target: CommandConstructor) => {
      target[field] = value
    }

export const Description = makeDecorator('description')
export const Hidden = makeDecorator('hidden')
export const Usage = makeDecorator('usage')
export const Help = makeDecorator('help')
export const Aliases = makeDecorator('aliases')
export const Strict = makeDecorator('strict')
export const Parse = makeDecorator('parse')
export const Flags = makeDecorator('flags')
export const Args = makeDecorator('args')
export const Examples = makeDecorator('plugin')
export const ParserOptions = makeDecorator('parserOptions')
