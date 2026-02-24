import type { GanZhiIndex } from './types'

export interface XunInfo {
  readonly index: number
  readonly name: string
  readonly head: string
}

export const XUN_LIST = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'] as const
const XUN_HEAD_LIST = ['戊', '己', '庚', '辛', '壬', '癸'] as const

/** 六仪三奇顺序 */
export const LIUYI_LIST = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'] as const

const ALL_XUN: readonly XunInfo[] = Object.freeze(
  XUN_LIST.map((name, i) => Object.freeze<XunInfo>({
    index: i,
    name,
    head: XUN_HEAD_LIST[i],
  }))
)

export function getXun(index: number): XunInfo {
  return ALL_XUN[index]
}

export function getXunFromGanZhiIndex(ganZhiIdx: GanZhiIndex | number): XunInfo {
  const idx = Math.floor(((ganZhiIdx % 60) + 60) % 60 / 10)
  return ALL_XUN[idx]
}

export const XUNS: readonly XunInfo[] = ALL_XUN
