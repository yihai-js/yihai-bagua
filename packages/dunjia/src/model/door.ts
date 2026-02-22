import type { DoorInfo } from '../types'
import { Wuxing } from '../base/wuxing'

export const DOORS: readonly DoorInfo[] = [
  { name: '休门', shortName: '休', wuxing: Wuxing.水, originPalace: 1 },
  { name: '生门', shortName: '生', wuxing: Wuxing.土, originPalace: 8 },
  { name: '伤门', shortName: '伤', wuxing: Wuxing.木, originPalace: 3 },
  { name: '杜门', shortName: '杜', wuxing: Wuxing.木, originPalace: 4 },
  { name: '景门', shortName: '景', wuxing: Wuxing.火, originPalace: 9 },
  { name: '死门', shortName: '死', wuxing: Wuxing.土, originPalace: 2 },
  { name: '惊门', shortName: '惊', wuxing: Wuxing.金, originPalace: 7 },
  { name: '开门', shortName: '开', wuxing: Wuxing.金, originPalace: 6 },
  { name: '中门', shortName: '中', wuxing: Wuxing.土, originPalace: 5 },
]

export function doorIndexFromAfterNum(num: number): number {
  const index = DOORS.findIndex(d => d.originPalace === num)
  return index >= 0 ? index : 0
}
