import type { Gan } from './gan'
import { wuxingRelation, type WuxingRelation } from './wuxing'

export type TenGodName = '正财' | '偏财' | '正官' | '七煞' | '伤官' | '食神' | '正印' | '偏印' | '劫财' | '比肩'
export type TenGodShort = '财' | '才' | '官' | '杀' | '伤' | '食' | '印' | '枭' | '劫' | '比'

export interface TenGod {
  readonly name: TenGodName
  readonly shortName: TenGodShort
  readonly wuxingRel: WuxingRelation
  readonly sameYinYang: boolean
}

const NAMES: readonly TenGodName[] = ['正财', '偏财', '正官', '七煞', '伤官', '食神', '正印', '偏印', '劫财', '比肩']
const SHORTS: readonly TenGodShort[] = ['财', '才', '官', '杀', '伤', '食', '印', '枭', '劫', '比']

// 五行关系到十神基础索引的映射
const WUXING_TO_BASE: Record<WuxingRelation, number> = {
  '克': 0, // 我克他 → 财(0,1)
  '耗': 1, // 他克我 → 官(2,3)
  '生': 2, // 我生他 → 伤食(4,5)
  '泄': 3, // 他生我 → 印(6,7)
  '比': 4, // 同类 → 劫比(8,9)
}

export function tenGod(dayMaster: Gan, target: Gan): TenGod {
  const wxRel = wuxingRelation(dayMaster.wuxing, target.wuxing)
  const sameYY = dayMaster.yinyang === target.yinyang
  const base = WUXING_TO_BASE[wxRel]
  const idx = base * 2 + (sameYY ? 1 : 0)
  return Object.freeze<TenGod>({
    name: NAMES[idx],
    shortName: SHORTS[idx],
    wuxingRel: wxRel,
    sameYinYang: sameYY,
  })
}

export { NAMES as TEN_GOD_NAMES, SHORTS as TEN_GOD_SHORTS }
