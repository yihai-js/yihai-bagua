import type { Gan } from './gan'
import { gan } from './gan'
import type { GanZhiIndex, Wuxing } from './types'
import type { Zhi } from './zhi'
import { zhi } from './zhi'

export interface NayinInfo {
  readonly name: string
  readonly wuxing: Wuxing
}

export interface GanZhi {
  readonly index: GanZhiIndex
  readonly gan: Gan
  readonly zhi: Zhi
  readonly name: string
  readonly xunIndex: number
  readonly nayin: NayinInfo
  readonly kongWang: readonly [Zhi, Zhi]
}

const NAYIN_NAMES: readonly string[] = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金',
  '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
  '泉中水', '屋上土', '霹雳火', '松柏木', '长流水',
  '沙中金', '山下火', '平地木', '壁上土', '金箔金',
  '覆灯火', '天河水', '大驿土', '钗钏金', '桑拓木',
  '大溪水', '沙中土', '天上火', '石榴木', '大海水',
]

const NAYIN_WUXING: readonly Wuxing[] = [
  3, 1, 0, 2, 3, 1, 4, 2, 3, 0,
  4, 2, 1, 0, 4, 3, 1, 0, 2, 3,
  1, 4, 2, 3, 0, 4, 2, 1, 0, 4,
]

// 旬空表：每旬10个干支，空对应当旬末尾的两个地支
// 甲子旬(0-9):  空戌亥 → zhi(10), zhi(11)
// 甲戌旬(10-19): 空申酉 → zhi(8), zhi(9)
// 甲申旬(20-29): 空午未 → zhi(6), zhi(7)
// 甲午旬(30-39): 空辰巳 → zhi(4), zhi(5)
// 甲辰旬(40-49): 空寅卯 → zhi(2), zhi(3)
// 甲寅旬(50-59): 空子丑 → zhi(0), zhi(1)
const KONG_WANG_ZHI_INDICES: readonly [number, number][] = [
  [10, 11],
  [8, 9],
  [6, 7],
  [4, 5],
  [2, 3],
  [0, 1],
]

function buildGanZhi(i: number): GanZhi {
  const ganObj = gan(i % 10)
  const zhiObj = zhi(i % 12)
  const xunIndex = Math.floor(i / 10)
  const nayinIndex = Math.floor(i / 2)
  const nayin = Object.freeze<NayinInfo>({
    name: NAYIN_NAMES[nayinIndex],
    wuxing: NAYIN_WUXING[nayinIndex],
  })
  const [kw0, kw1] = KONG_WANG_ZHI_INDICES[xunIndex]
  const kongWang = Object.freeze([zhi(kw0), zhi(kw1)] as [Zhi, Zhi])

  return Object.freeze<GanZhi>({
    index: i as GanZhiIndex,
    gan: ganObj,
    zhi: zhiObj,
    name: ganObj.name + zhiObj.name,
    xunIndex,
    nayin,
    kongWang,
  })
}

const ALL_GANZHI: readonly GanZhi[] = Object.freeze(
  Array.from({ length: 60 }, (_, i) => buildGanZhi(i))
)

const GANZHI_NAME_MAP = new Map<string, GanZhi>(ALL_GANZHI.map(gz => [gz.name, gz]))

/** 按索引（支持取模）或名称查找六十甲子 */
export function ganZhi(input: GanZhiIndex | number | string): GanZhi {
  if (typeof input === 'string') {
    const gz = GANZHI_NAME_MAP.get(input)
    if (!gz) throw new Error(`未知干支: ${input}`)
    return gz
  }
  const idx = ((input % 60) + 60) % 60
  return ALL_GANZHI[idx]
}

/** 从天干名称和地支名称组合查找 */
export function ganZhiFromNames(ganName: string, zhiName: string): GanZhi {
  const name = ganName + zhiName
  const gz = GANZHI_NAME_MAP.get(name)
  if (!gz) throw new Error(`未知干支组合: ${name}`)
  return gz
}

/** 六十甲子表 */
export const JIA_ZI_TABLE: readonly GanZhi[] = ALL_GANZHI
