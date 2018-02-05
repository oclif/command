export function compact<T>(a: (T | undefined)[]): T[] {
  return a.filter((a): a is T => !!a)
}
