import { Wuxing } from './wuxing'

export interface BaguaInfo {
  index: number
  name: string
  beforeName: string
  yinyang: number
  wuxing: Wuxing
  gua: string
}

export const BAGUA_LIST = ['坎', '坤', '震', '巽', '乾', '兑', '艮', '离'] as const
const BEFORE_BAGUA_LIST = ['兑', '坎', '艮', '坤', '离', '巽', '乾', '震'] as const
const YINYANG_LIST = [1, 0, 1, 0, 1, 0, 1, 0] as const
const WUXING_LIST = [Wuxing.水, Wuxing.土, Wuxing.木, Wuxing.木, Wuxing.金, Wuxing.金, Wuxing.土, Wuxing.火] as const
const GUA_LIST = ['010', '000', '001', '110', '111', '011', '100', '101'] as const

export function getBagua(input: number | string): BaguaInfo {
  let index: number
  if (typeof input === 'string') {
    index = BAGUA_LIST.indexOf(input as typeof BAGUA_LIST[number])
    if (index === -1)
      throw new Error(`未知八卦: ${input}`)
  }
  else {
    index = input
  }
  return {
    index,
    name: BAGUA_LIST[index],
    beforeName: BEFORE_BAGUA_LIST[index],
    yinyang: YINYANG_LIST[index],
    wuxing: WUXING_LIST[index],
    gua: GUA_LIST[index],
  }
}

export function compareBagua(a: BaguaInfo, b: BaguaInfo): string {
  let result = ''
  for (let i = 0; i < 3; i++) {
    result += a.gua[i] === b.gua[i] ? '0' : '1'
  }
  return result
}
