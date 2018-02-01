// tslint:disable interface-over-type-literal

import {IConfig} from '@anycli/config'
import * as Parser from '@anycli/parser'

export type ICompletionContext = {
  args?: { [name: string]: string }
  flags?: { [name: string]: string }
  argv?: string[]
  config: IConfig
}

export type ICompletion = {
  skipCache?: boolean
  cacheDuration?: number
  cacheKey?(ctx: ICompletionContext): Promise<string>
  options(ctx: ICompletionContext): Promise<string[]>
}

export type IOptionFlag<T> = Parser.flags.IOptionFlag<T> & {
  completion?: ICompletion
}

export type IFlag<T> = Parser.flags.IBooleanFlag<T> | IOptionFlag<T>

export type Output = Parser.flags.Output
export type Input<T extends Parser.flags.Output> = { [P in keyof T]: IFlag<T[P]> }

export type Definition<T> = {
  (options: {multiple: true} & Partial<IOptionFlag<T>>): IOptionFlag<T[]>
  (options: {required: true} & Partial<IOptionFlag<T>>): IOptionFlag<T>
  (options?: Partial<IOptionFlag<T>>): IOptionFlag<T | undefined>
}

export function build<T>(defaults: {parse: IOptionFlag<T>['parse']} & Partial<IOptionFlag<T>>): Definition<T>
export function build(defaults: Partial<IOptionFlag<string>>): Definition<string>
export function build<T>(defaults: Partial<IOptionFlag<T>>): Definition<T> {
  return Parser.flags.build<T>(defaults as any)
}

export function option<T>(options: {parse: IOptionFlag<T>['parse']} & Partial<IOptionFlag<T>>) {
  return build<T>({optionType: 'custom', ...options})()
}

const _enum = <T = string>(opts: Parser.flags.EnumFlagOptions<T>): IOptionFlag<T> => {
  return build<T>({
    parse(input) {
      if (!opts.options.includes(input)) throw new Error(`Expected --${this.name}=${input} to be one of: ${opts.options.join(', ')}`)
      return input
    },
    helpValue: `(${opts.options.join('|')})`,
    ...opts as any,
    optionType: 'enum',
  })() as IOptionFlag<T>
}
export {_enum as enum}

const stringFlag = build({})
export {stringFlag as string}
export {boolean} from '@anycli/parser/lib/flags'

export const version = build({char: 'v', description: 'show CLI version'})
export const help = build({char: 'h', description: 'show CLI help'})
