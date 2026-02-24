import { Wuxing, WUXING_NAMES } from './types'

export type WuxingRelation = '生' | '克' | '泄' | '耗' | '比'

const RELATION_TABLE: readonly (readonly WuxingRelation[])[] = [
  ['比', '生', '克', '耗', '泄'], // 木
  ['泄', '比', '生', '克', '耗'], // 火
  ['耗', '泄', '比', '生', '克'], // 土
  ['克', '耗', '泄', '比', '生'], // 金
  ['生', '克', '耗', '泄', '比'], // 水
]

export function wuxingRelation(a: Wuxing, b: Wuxing): WuxingRelation {
  return RELATION_TABLE[a][b]
}

export function wuxingName(w: Wuxing): string {
  return WUXING_NAMES[w]
}

export { Wuxing, WUXING_NAMES }
