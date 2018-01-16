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

export interface IOptionFlag<T = string> extends flags.IOptionFlag<T> {
  completion?: ICompletion
}

export type IFlag<T = string> = flags.IBooleanFlag | IOptionFlag<T>

export interface Input {
  [k: string]: IFlag<any>
}

export type Definition<T = string> = (options?: Partial<IOptionFlag<T>>) => IOptionFlag<T>

export function option<T = string>(defaults: Partial<IOptionFlag<T>> = {}): Definition<T> {
  return deps.Parser.flags.option<T>(defaults)
}

export function string(defaults: Partial<IOptionFlag> = {}): IOptionFlag {
  return deps.Parser.flags.string(defaults)
}

export {boolean} from '@dxcli/parser/lib/flags'
