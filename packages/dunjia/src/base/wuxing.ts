// Re-export Wuxing from types (don't duplicate)
import type { Wuxing } from '../types'

export { Wuxing } from '../types'

export const WUXING_NAMES = ['木', '火', '土', '金', '水'] as const
export type WuxingRelation = '生' | '克' | '泄' | '耗' | '比'

/**
 * 五行生克关系表
 * relation[a][b] 表示 a 对 b 的关系
 * 生：a 生 b（木生火）
 * 克：a 克 b（木克土）
 * 泄：a 被 b 所生（火泄木 = 木生火的反面）
 * 耗：a 被 b 所克（土耗木 = 木克土的反面）
 * 比：同类
 */
const RELATION_TABLE: WuxingRelation[][] = [
  // 木对: 木火土金水
  ['比', '生', '克', '耗', '泄'],
  // 火对: 木火土金水
  ['泄', '比', '生', '克', '耗'],
  // 土对: 木火土金水
  ['耗', '泄', '比', '生', '克'],
  // 金对: 木火土金水
  ['克', '耗', '泄', '比', '生'],
  // 水对: 木火土金水
  ['生', '克', '耗', '泄', '比'],
]

export function getWuxingRelation(a: Wuxing, b: Wuxing): WuxingRelation {
  return RELATION_TABLE[a][b]
}
