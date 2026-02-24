import type { Gan } from './gan'
import { gan } from './gan'
import type { Wuxing, YinYang, ZhiIndex } from './types'

export interface HiddenGan {
  readonly gan: Gan
  readonly weight: 'main' | 'middle' | 'minor'
}

export interface Zhi {
  readonly index: ZhiIndex
  readonly name: string
  readonly wuxing: Wuxing
  readonly yinyang: YinYang
  readonly shengXiao: string
  readonly hiddenGans: readonly HiddenGan[]
  readonly bornZhi: ZhiIndex
}

const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const ZHI_WUXING: readonly Wuxing[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]
const ZHI_SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const
const ZHI_BORN_ZHI: readonly number[] = [8, 5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11]

// 藏干表：[本气, 中气?, 余气?]
const ZHI_HIDDEN_GANS: readonly (readonly string[])[] = [
  ['癸'],           // 子
  ['癸', '辛', '己'], // 丑
  ['戊', '丙', '甲'], // 寅
  ['乙'],           // 卯
  ['乙', '癸', '戊'], // 辰
  ['戊', '庚', '丙'], // 巳
  ['己', '丁'],     // 午
  ['丁', '乙', '己'], // 未
  ['戊', '壬', '庚'], // 申
  ['辛'],           // 酉
  ['辛', '丁', '戊'], // 戌
  ['甲', '壬'],     // 亥
]

const WEIGHT_MAP: readonly ('main' | 'middle' | 'minor')[] = ['main', 'middle', 'minor']

function buildHiddenGans(names: readonly string[]): readonly HiddenGan[] {
  return names.map((name, i) => Object.freeze<HiddenGan>({
    gan: gan(name),
    weight: WEIGHT_MAP[i],
  }))
}

const ALL_ZHI: readonly Zhi[] = ZHI_NAMES.map((name, i) => Object.freeze<Zhi>({
  index: i as ZhiIndex,
  name,
  wuxing: ZHI_WUXING[i],
  yinyang: i % 2 === 0 ? '阳' : '阴',
  shengXiao: ZHI_SHENGXIAO[i],
  hiddenGans: Object.freeze(buildHiddenGans(ZHI_HIDDEN_GANS[i])),
  bornZhi: ZHI_BORN_ZHI[i] as ZhiIndex,
}))

const ZHI_NAME_MAP = new Map<string, Zhi>(ALL_ZHI.map(z => [z.name, z]))

/** 按索引或名称获取地支，索引支持取模（如 12 → 子, -1 → 亥） */
export function zhi(input: ZhiIndex | number | string): Zhi {
  if (typeof input === 'string') {
    const z = ZHI_NAME_MAP.get(input)
    if (!z) throw new Error(`未知地支: ${input}`)
    return z
  }
  const idx = ((input % 12) + 12) % 12
  return ALL_ZHI[idx]
}

/** 全部 12 地支 */
export const ZHIS: readonly Zhi[] = ALL_ZHI
