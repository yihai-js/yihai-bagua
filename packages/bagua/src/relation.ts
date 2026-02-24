import type { Gan } from './gan'
import type { Zhi } from './zhi'

// === 天干关系 ===

export type GanRelationType = '五合' | '相冲'

export interface GanRelationResult {
  readonly type: GanRelationType
}

// 天干五合表：ganHe.list[i] = 与第i干相合的干名称
// 甲己合, 乙庚合, 丙辛合, 丁壬合, 戊癸合
const GAN_HE_LIST: readonly (string | null)[] = [
  '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊',
]

// 天干相冲表：ganChong.list[i] = 与第i干相冲的干名称（戊己无冲）
// 甲庚冲, 乙辛冲, 丙壬冲, 丁癸冲
const GAN_CHONG_LIST: readonly (string | null)[] = [
  '庚', '辛', '壬', '癸', null, null, '甲', '乙', '丙', '丁',
]

/**
 * 判断两个天干之间的关系
 * @returns '五合' | '相冲' | null
 */
export function ganRelation(a: Gan, b: Gan): GanRelationResult | null {
  const aIdx = a.index
  const heTarget = GAN_HE_LIST[aIdx]
  if (heTarget !== null && heTarget === b.name) {
    return Object.freeze<GanRelationResult>({ type: '五合' })
  }
  const chongTarget = GAN_CHONG_LIST[aIdx]
  if (chongTarget !== null && chongTarget === b.name) {
    return Object.freeze<GanRelationResult>({ type: '相冲' })
  }
  return null
}

// === 地支关系 ===

export type ZhiRelationType = '六合' | '相冲' | '相刑' | '相破' | '相害'
export type XingType = '无礼' | '恃势' | '无恩' | '自刑'

export interface ZhiRelationResult {
  readonly type: ZhiRelationType
  readonly xingType?: XingType
}

// 地支六合表：index i 与 ZHI_LIU_HE[i] 对应的地支相合
// 子丑合, 寅亥合, 卯戌合, 辰酉合, 巳申合, 午未合
const ZHI_LIU_HE: readonly string[] = [
  '丑', '子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅',
]

// 地支相冲表
// 子午冲, 丑未冲, 寅申冲, 卯酉冲, 辰戌冲, 巳亥冲
const ZHI_CHONG: readonly string[] = [
  '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳',
]

// 地支相刑表
const ZHI_XING: readonly string[] = [
  '卯', '戌', '巳', '子', '辰', '申', '午', '丑', '寅', '酉', '未', '亥',
]

// 相刑类型
const ZHI_XING_TYPE: readonly XingType[] = [
  '无礼', '恃势', '无恩', '无礼', '自刑', '无恩', '自刑', '恃势', '无恩', '自刑', '恃势', '自刑',
]

// 地支相破表
const ZHI_PO: readonly string[] = [
  '酉', '辰', '亥', '午', '丑', '申', '卯', '戌', '巳', '子', '未', '寅',
]

// 地支相害表
const ZHI_HAI: readonly string[] = [
  '未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌', '酉', '申',
]

/**
 * 判断两个地支之间的关系（优先级：六合 > 相冲 > 相刑 > 相破 > 相害）
 * @returns ZhiRelationResult | null
 */
export function zhiRelation(a: Zhi, b: Zhi): ZhiRelationResult | null {
  const aIdx = a.index

  if (ZHI_LIU_HE[aIdx] === b.name) {
    return Object.freeze<ZhiRelationResult>({ type: '六合' })
  }
  if (ZHI_CHONG[aIdx] === b.name) {
    return Object.freeze<ZhiRelationResult>({ type: '相冲' })
  }
  if (ZHI_XING[aIdx] === b.name) {
    return Object.freeze<ZhiRelationResult>({ type: '相刑', xingType: ZHI_XING_TYPE[aIdx] })
  }
  if (ZHI_PO[aIdx] === b.name) {
    return Object.freeze<ZhiRelationResult>({ type: '相破' })
  }
  if (ZHI_HAI[aIdx] === b.name) {
    return Object.freeze<ZhiRelationResult>({ type: '相害' })
  }
  return null
}

// === 地支三合/三会 ===

export type ZhiTripleRelationType = '三合' | '三会'

export interface ZhiTripleResult {
  readonly type: ZhiTripleRelationType
  readonly group: readonly string[]
}

// 三合局：寅午戌, 亥卯未, 巳酉丑, 申子辰
const SAN_HE_GROUPS: readonly (readonly string[])[] = [
  ['寅', '午', '戌'],
  ['亥', '卯', '未'],
  ['巳', '酉', '丑'],
  ['申', '子', '辰'],
]

// 三会局：寅卯辰, 巳午未, 申酉戌, 亥子丑
const SAN_HUI_GROUPS: readonly (readonly string[])[] = [
  ['寅', '卯', '辰'],
  ['巳', '午', '未'],
  ['申', '酉', '戌'],
  ['亥', '子', '丑'],
]

/**
 * 判断三个地支是否构成三合或三会
 * @returns ZhiTripleResult | null
 */
export function zhiTripleRelation(a: Zhi, b: Zhi, c: Zhi): ZhiTripleResult | null {
  const names = new Set([a.name, b.name, c.name])

  for (const group of SAN_HE_GROUPS) {
    if (group.every(n => names.has(n))) {
      return Object.freeze<ZhiTripleResult>({ type: '三合', group })
    }
  }

  for (const group of SAN_HUI_GROUPS) {
    if (group.every(n => names.has(n))) {
      return Object.freeze<ZhiTripleResult>({ type: '三会', group })
    }
  }

  return null
}
