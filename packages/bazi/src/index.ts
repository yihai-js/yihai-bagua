// @yhjs/bazi - 八字排盘库

// 主类
export { Bazi } from './bazi'

// 类型
export type {
  BaziMeta,
  BaziOptions,
  BaziBoardData,
  DayunEntry,
  Gender,
  HiddenGodEntry,
  LiunianEntry,
  LiuyueEntry,
  Pillar,
  ShenshaResult,
} from './types'

// 工具函数（高级用户可直接调用）
export { computeFourPillars, dateToJd } from './pillar'
export type { FourPillars } from './pillar'
export { buildAllPillars, buildPillar } from './analysis'
export type { BuiltPillars } from './analysis'
export { computeDayun, isDayunReverse, findTargetJie } from './dayun'
export { computeLiunian, computeLiuyue, computePreDayunLiunian } from './liunian'
export { computeShensha, computeHorse, computeGuiren, computeSeasonPower } from './shensha'
