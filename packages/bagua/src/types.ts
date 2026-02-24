/**
 * 术数基础类型定义
 */

/** 五行枚举 */
export enum Wuxing { 木 = 0, 火 = 1, 土 = 2, 金 = 3, 水 = 4 }

/** 阴阳类型 */
export type YinYang = '阴' | '阳'

/** 五行名称 */
export const WUXING_NAMES = ['木', '火', '土', '金', '水'] as const

// === Branded Index Types ===
declare const __ganIndex: unique symbol
declare const __zhiIndex: unique symbol
declare const __ganZhiIndex: unique symbol

/** 天干索引 (0-9) */
export type GanIndex = number & { readonly [__ganIndex]: true }
/** 地支索引 (0-11) */
export type ZhiIndex = number & { readonly [__zhiIndex]: true }
/** 六十甲子索引 (0-59) */
export type GanZhiIndex = number & { readonly [__ganZhiIndex]: true }

export function ganIndex(n: number): GanIndex {
  if (n < 0 || n > 9 || !Number.isInteger(n))
    throw new RangeError(`GanIndex must be 0-9, got ${n}`)
  return n as GanIndex
}

export function zhiIndex(n: number): ZhiIndex {
  if (n < 0 || n > 11 || !Number.isInteger(n))
    throw new RangeError(`ZhiIndex must be 0-11, got ${n}`)
  return n as ZhiIndex
}

export function ganZhiIndex(n: number): GanZhiIndex {
  if (n < 0 || n > 59 || !Number.isInteger(n))
    throw new RangeError(`GanZhiIndex must be 0-59, got ${n}`)
  return n as GanZhiIndex
}
