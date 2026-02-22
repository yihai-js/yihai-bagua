export interface XunInfo {
  index: number
  name: string
  head: string
}

export const XUN_LIST = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'] as const
const XUN_HEAD_LIST = ['戊', '己', '庚', '辛', '壬', '癸'] as const
export const LIUYI_LIST = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'] as const

export function getXun(index: number): XunInfo {
  return {
    index,
    name: XUN_LIST[index],
    head: XUN_HEAD_LIST[index],
  }
}

export function getXunFromGanZhiIndex(ganZhiIndex: number): XunInfo {
  const xunIndex = Math.floor(((ganZhiIndex % 60) + 60) % 60 / 10)
  return getXun(xunIndex)
}
