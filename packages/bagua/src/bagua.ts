import type { Wuxing } from './types'

export interface BaguaInfo {
  readonly index: number
  readonly name: string
  readonly beforeName: string
  readonly yinyang: number
  readonly wuxing: Wuxing
  readonly gua: string
}

export const BAGUA_LIST = ['坎', '坤', '震', '巽', '乾', '兑', '艮', '离'] as const
const BEFORE_BAGUA_LIST = ['兑', '坎', '艮', '坤', '离', '巽', '乾', '震'] as const
const YINYANG_LIST = [1, 0, 1, 0, 1, 0, 1, 0] as const
const WUXING_LIST: readonly Wuxing[] = [4, 2, 0, 0, 3, 3, 2, 1] // 水土木木金金土火
const GUA_LIST = ['010', '000', '001', '110', '111', '011', '100', '101'] as const

const ALL_BAGUA: readonly BaguaInfo[] = Object.freeze(
  BAGUA_LIST.map((name, i) => Object.freeze<BaguaInfo>({
    index: i,
    name,
    beforeName: BEFORE_BAGUA_LIST[i],
    yinyang: YINYANG_LIST[i],
    wuxing: WUXING_LIST[i],
    gua: GUA_LIST[i],
  }))
)

const BAGUA_NAME_MAP = new Map<string, BaguaInfo>(ALL_BAGUA.map(b => [b.name, b]))

export function getBagua(input: number | string): BaguaInfo {
  if (typeof input === 'string') {
    const b = BAGUA_NAME_MAP.get(input)
    if (!b) throw new Error(`未知八卦: ${input}`)
    return b
  }
  return ALL_BAGUA[input]
}

export function compareBagua(a: BaguaInfo, b: BaguaInfo): string {
  let result = ''
  for (let i = 0; i < 3; i++) {
    result += a.gua[i] === b.gua[i] ? '0' : '1'
  }
  return result
}

export const BAGUAS: readonly BaguaInfo[] = ALL_BAGUA
