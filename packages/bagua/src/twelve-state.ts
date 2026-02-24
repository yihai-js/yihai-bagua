import type { Gan } from './gan'
import type { Zhi } from './zhi'

export type TwelveStateName = '长生' | '沐浴' | '冠带' | '临官' | '帝旺' | '衰' | '病' | '死' | '墓' | '绝' | '胎' | '养'

const STATE_NAMES: readonly TwelveStateName[] = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰',
  '病', '死', '墓', '绝', '胎', '养',
]

const ZHI_LEN = 12

export function twelveState(g: Gan, z: Zhi): TwelveStateName {
  let offset: number
  if (g.isYangGan) {
    offset = z.index >= g.bornZhi ? z.index - g.bornZhi : z.index + ZHI_LEN - g.bornZhi
  }
  else {
    offset = z.index <= g.bornZhi ? g.bornZhi - z.index : g.bornZhi + ZHI_LEN - z.index
  }
  return STATE_NAMES[offset]
}

export { STATE_NAMES as TWELVE_STATE_NAMES }
