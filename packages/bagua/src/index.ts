// @yhjs/bagua - 术数基础库

export const VERSION = '1.0.0'

// 类型
export { ganIndex, ganZhiIndex, Wuxing, WUXING_NAMES, zhiIndex } from './types'
export type { GanIndex, GanZhiIndex, YinYang, ZhiIndex } from './types'

// 原语层
export { gan, GANS } from './gan'
export type { Gan } from './gan'
export { zhi, ZHIS } from './zhi'
export type { HiddenGan, Zhi } from './zhi'

// 关系层
export { wuxingName, wuxingRelation } from './wuxing'
export type { WuxingRelation } from './wuxing'
export { TEN_GOD_NAMES, TEN_GOD_SHORTS, tenGod } from './ten-god'
export type { TenGod, TenGodName, TenGodShort } from './ten-god'
export { twelveState, TWELVE_STATE_NAMES } from './twelve-state'
export type { TwelveStateName } from './twelve-state'
export { ganRelation, zhiRelation, zhiTripleRelation } from './relation'
export type { GanRelationType, XingType, ZhiRelationResult, ZhiRelationType, ZhiTripleRelationType } from './relation'
