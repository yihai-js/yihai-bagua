/**
 * 二十四山向数据与罗盘计算
 *
 * 提供 24 山向的基础数据、角度转换、三盘偏移、三元局数等核心功能。
 */

import type { Wuxing } from '../types'

/* ------------------------------------------------------------------ */
/*  常量                                                                */
/* ------------------------------------------------------------------ */

/** 最大角度 */
export const MAX_ANGLE = 360

/** 三盘偏移角度 */
export const PAN_DELTA = 7.5

/** 每个山向角度范围 */
export const MOUNTAIN_RANGE = 15

/** 结尾精度 */
export const RANGE_TAIL = 0.01

/* ------------------------------------------------------------------ */
/*  24 山向数据                                                         */
/* ------------------------------------------------------------------ */

/** 24 山向名称（从癸开始，每15度一个） */
export const MOUNTAIN_NAMES = [
  '癸',
  '丑',
  '艮',
  '寅',
  '甲',
  '卯',
  '乙',
  '辰',
  '巽',
  '巳',
  '丙',
  '午',
  '丁',
  '未',
  '坤',
  '申',
  '庚',
  '酉',
  '辛',
  '戌',
  '乾',
  '亥',
  '壬',
  '子',
] as const

/** 每个山向的五行 (木=0, 火=1, 土=2, 金=3, 水=4) */
export const MOUNTAIN_WUXING = [
  4,
  2,
  2,
  0,
  0,
  0,
  0,
  2,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  3,
  3,
  3,
  3,
  2,
  3,
  4,
  4,
  4,
] as const

/** 每个山向的阴阳 (1=阳, 0=阴) */
export const MOUNTAIN_YINYANG = [
  1,
  0,
  0,
  1,
  1,
  0,
  1,
  1,
  0,
  0,
  0,
  1,
  0,
  0,
  1,
  1,
  0,
  0,
  0,
  1,
  1,
  0,
  1,
  1,
] as const

/** 纳甲八卦 */
export const MOUNTAIN_NAJIA = [
  '坎',
  '兑',
  '艮',
  '离',
  '乾',
  '震',
  '坤',
  '坎',
  '巽',
  '兑',
  '艮',
  '离',
  '兑',
  '震',
  '坤',
  '坎',
  '震',
  '兑',
  '巽',
  '离',
  '乾',
  '震',
  '离',
  '坎',
] as const

/** 八宫名称 */
export const PALACE_NAMES_8 = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾'] as const

/** 八宫黄泉煞 */
export const PALACE_HUANGQUAN = ['辰', '寅', '申', '酉', '亥', '卯', '巳', '午'] as const

/* ------------------------------------------------------------------ */
/*  类型定义                                                            */
/* ------------------------------------------------------------------ */

/** 山向信息 */
export interface MountainInfo {
  /** 山向索引 0-23 */
  index: number
  /** 山向名称 */
  name: string
  /** 起始角度 */
  angle: number
  /** 五行 */
  wuxing: Wuxing
  /** 阴阳 (1=阳, 0=阴) */
  yinyang: number
  /** 纳甲八卦名 */
  najia: string
}

/** 山向详情（含角度范围） */
export interface MountainDetail {
  /** 山向索引 0-23 */
  index: number
  /** 起始角度 */
  start: number
  /** 结束角度 */
  end: number
}

/** 盘类型：人盘、地盘、天盘 */
export type PanType = 'human' | 'ground' | 'sky'

/** 三元局数数据 */
export interface NumData {
  /** 阴阳（true=阳, false=阴） */
  isSolar: boolean
  /** 元偏移 (0=上元, 1=中元, 2=下元) */
  numOffset: number
  /** 局数 1-9 */
  num: number
}

/* ------------------------------------------------------------------ */
/*  辅助函数                                                            */
/* ------------------------------------------------------------------ */

/**
 * 角度差值（始终为正）
 */
function angleSub(a: number, b: number): number {
  return ((a - b) % MAX_ANGLE + MAX_ANGLE) % MAX_ANGLE
}

/* ------------------------------------------------------------------ */
/*  核心函数                                                            */
/* ------------------------------------------------------------------ */

/**
 * 角度 -> 山向索引
 */
export function getMountainIndexFromAngle(angle: number): number {
  return Math.floor(((angle % MAX_ANGLE) + MAX_ANGLE) % MAX_ANGLE / MOUNTAIN_RANGE)
}

/**
 * 获取山向信息
 */
export function getMountainInfo(index: number): MountainInfo {
  return {
    index,
    name: MOUNTAIN_NAMES[index],
    angle: (index * MOUNTAIN_RANGE) % MAX_ANGLE,
    wuxing: MOUNTAIN_WUXING[index] as Wuxing,
    yinyang: MOUNTAIN_YINYANG[index],
    najia: MOUNTAIN_NAJIA[index],
  }
}

/**
 * 根据角度和盘类型获取山向详情（三盘偏移）
 *
 * - human: 无偏移
 * - ground: 偏移 7.5 度
 * - sky: 偏移 15 度
 */
export function getMountainDetailFromAngle(angle: number, panType: PanType = 'human'): MountainDetail {
  const panIndex = panType === 'human' ? 0 : panType === 'ground' ? 1 : 2
  const tempAngle = ((angle + MAX_ANGLE - panIndex * PAN_DELTA) % MAX_ANGLE)
  const index = Math.floor(tempAngle / MOUNTAIN_RANGE)
  return {
    index,
    start: (index * MOUNTAIN_RANGE + panIndex * PAN_DELTA) % MAX_ANGLE,
    end: ((index + 1) * MOUNTAIN_RANGE + panIndex * PAN_DELTA - RANGE_TAIL) % MAX_ANGLE,
  }
}

/**
 * 对面角度
 */
export function getOppositeAngle(angle: number): number {
  return (angle + MAX_ANGLE / 2) % MAX_ANGLE
}

/**
 * 对面山向索引
 */
export function getOppositeMountain(index: number): number {
  return (index + Math.floor(MOUNTAIN_NAMES.length / 2)) % MOUNTAIN_NAMES.length
}

/**
 * 双山五行获取地支名称
 */
export function getZhiMountain(index: number): string {
  const newIndex = index % 2 === 0 ? index + 1 : index
  return MOUNTAIN_NAMES[newIndex]
}

/**
 * 三元局数计算
 *
 * 根据角度和人盘山向详情，计算该方位对应的三元局数。
 */
export function getNumData(angle: number, humanMountain: MountainDetail): NumData {
  const DELTA_NUM = 6
  const upStart = [1, 8, 3, 4, 9, 2, 7, 6]
  const limitLen = upStart.length + 1 // 9
  const NUM_RANGE = 5 // Math.floor(360 / (24 * 3))

  const index = humanMountain.index
  // 巳(9)到乾(20)为阴，其他为阳
  const isSolar = !(index >= 9 && index <= 20)

  const len = MOUNTAIN_NAMES.length
  const groupIndex = Math.floor(((index + len + 2) % len) / 3)
  let groupOffset = ((index + len + 2) % len) % 3
  groupOffset = groupIndex < Math.floor(upStart.length / 2) ? groupOffset : groupOffset * (-1)

  const angleDelta = angleSub(angle, humanMountain.start)
  const numOffset = Math.floor(angleDelta / NUM_RANGE)
  const deltaOffset = isSolar ? numOffset : numOffset * (-1)

  let curNum = (upStart[groupIndex] + groupOffset + limitLen - 1) % limitLen + 1
  curNum = (curNum + deltaOffset * DELTA_NUM + limitLen * 2 - 1) % limitLen + 1

  return { isSolar, numOffset, num: curNum }
}
