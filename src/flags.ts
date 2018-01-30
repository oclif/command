import {IConfig} from '@dxcli/config'
import {flags} from '@dxcli/parser'

import deps from './deps'

export interface ICompletionContext {
  args?: { [name: string]: string }
  flags?: { [name: string]: string }
  argv?: string[]
  config: IConfig
}

export interface ICompletion {
  skipCache?: boolean
  cacheDuration?: number
  cacheKey?(ctx: ICompletionContext): Promise<string>
  options(ctx: ICompletionContext): Promise<string[]>
}

export interface IOptionFlag<T> extends flags.IOptionFlag<T> {
  completion?: ICompletion
}

export type IFlag<T> = flags.IBooleanFlag<T> | IOptionFlag<T>

export type Output = flags.Output
export type Input<T extends flags.Output> = { [P in keyof T]: IFlag<T[P]> }

export interface Definition<T> {
  (options: {multiple: true} & Partial<IOptionFlag<T>>): IOptionFlag<T[]>
  (options: {required: true} & Partial<IOptionFlag<T>>): IOptionFlag<T>
  (options?: Partial<IOptionFlag<T>>): IOptionFlag<T | undefined>
}

export function build<T>(defaults: {parse: IOptionFlag<T>['parse']} & Partial<IOptionFlag<T>>): Definition<T>
export function build(defaults: Partial<IOptionFlag<string>>): Definition<string>
export function build<T>(defaults: Partial<IOptionFlag<T>>): Definition<T> {
  return deps.Parser.flags.build<T>(defaults as any)
}

const stringFlag = build({})
export {stringFlag as string}
export {boolean} from '@dxcli/parser/lib/flags'
