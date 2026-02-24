import type { GanIndex, Wuxing, YinYang, ZhiIndex } from './types'

export interface Gan {
  readonly index: GanIndex
  readonly name: string
  readonly wuxing: Wuxing
  readonly yinyang: YinYang
  readonly bornZhi: ZhiIndex
  readonly isYangGan: boolean
}

const GAN_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const GAN_WUXING: readonly Wuxing[] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
const GAN_BORN_ZHI: readonly number[] = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]

const ALL_GAN: readonly Gan[] = GAN_NAMES.map((name, i) => Object.freeze<Gan>({
  index: i as GanIndex,
  name,
  wuxing: GAN_WUXING[i],
  yinyang: i % 2 === 0 ? '阳' : '阴',
  bornZhi: GAN_BORN_ZHI[i] as ZhiIndex,
  isYangGan: i % 2 === 0,
}))

const GAN_NAME_MAP = new Map<string, Gan>(ALL_GAN.map(g => [g.name, g]))

/** 按索引或名称获取天干，索引支持取模（如 10 → 甲, -1 → 癸） */
export function gan(input: GanIndex | number | string): Gan {
  if (typeof input === 'string') {
    const g = GAN_NAME_MAP.get(input)
    if (!g) throw new Error(`未知天干: ${input}`)
    return g
  }
  const idx = ((input % 10) + 10) % 10
  return ALL_GAN[idx]
}

/** 全部 10 天干 */
export const GANS: readonly Gan[] = ALL_GAN
