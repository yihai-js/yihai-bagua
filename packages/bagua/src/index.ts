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
