import type { StarInfo } from '../types'
import { Wuxing } from '../base/wuxing'

export const STARS: readonly StarInfo[] = [
  { name: '天蓬星', shortName: '蓬', wuxing: Wuxing.水, originPalace: 1 },
  { name: '天任星', shortName: '任', wuxing: Wuxing.土, originPalace: 8 },
  { name: '天冲星', shortName: '冲', wuxing: Wuxing.木, originPalace: 3 },
  { name: '天辅星', shortName: '辅', wuxing: Wuxing.木, originPalace: 4 },
  { name: '天英星', shortName: '英', wuxing: Wuxing.火, originPalace: 9 },
  { name: '天芮星', shortName: '芮', wuxing: Wuxing.土, originPalace: 2 },
  { name: '天柱星', shortName: '柱', wuxing: Wuxing.金, originPalace: 7 },
  { name: '天心星', shortName: '心', wuxing: Wuxing.金, originPalace: 6 },
  { name: '天禽星', shortName: '禽', wuxing: Wuxing.土, originPalace: 5 },
]

export function starIndexFromAfterNum(num: number): number {
  const index = STARS.findIndex(s => s.originPalace === num)
  return index >= 0 ? index : 0
}
