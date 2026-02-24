/**
 * 干支计算 - Gan-Zhi (Heavenly Stems and Earthly Branches)
 *
 * 来源：寿星万年历 lunar.js
 * @see lunar.js:210-218 天干地支生肖数据
 * @see lunar.js:802-830 干支纪年纪月纪日计算
 *
 * 中国传统干支纪年法，用于农历计时
 */

import {
  ganZhi as baguaGanZhi,
  GANS,
  JIA_ZI_TABLE as BAGUA_JIA_ZI_TABLE,
  ZHIS,
} from '@yhjs/bagua'
import type { GanZhi } from '@yhjs/bagua'
import { calculateLunarYear } from './calendar'

// === 向后兼容的字符串常量（从 bagua 派生） ===

/** 十天干 */
export const TIAN_GAN = GANS.map(g => g.name) as unknown as readonly ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

/** 十二地支 */
export const DI_ZHI = ZHIS.map(z => z.name) as unknown as readonly ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 十二生肖 */
export const SHENG_XIAO = ZHIS.map(z => z.shengXiao) as unknown as readonly ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

/** 十二星座 */
export const XING_ZUO = [
  '摩羯',
  '水瓶',
  '双鱼',
  '白羊',
  '金牛',
  '双子',
  '巨蟹',
  '狮子',
  '处女',
  '天秤',
  '天蝎',
  '射手',
] as const

// === 类型（从 bagua 导出） ===

/** @deprecated 使用 @yhjs/bagua 的 GanZhi 类型代替 */
export type GanZhiInfo = GanZhi

/**
 * 根据索引获取干支
 *
 * @param index - 干支索引 (0-59)
 * @returns 干支信息（bagua GanZhi 对象）
 */
export function getGanZhi(index: number): GanZhi {
  return baguaGanZhi(index)
}

/**
 * 干支纪年（以立春为界）
 * @see lunar.js:802-816
 */
export function getYearGanZhi(jd: number): GanZhi {
  const yearData = calculateLunarYear(jd)
  const lichun = yearData.zhongQi[3] // 立春

  const adjustedDays = lichun + (jd < lichun ? -365 : 0) + 365.25 * 16 - 35
  const yearIndex = Math.floor(adjustedDays / 365.2422 + 0.5)

  const index = yearIndex + 12000
  return baguaGanZhi(index)
}

/**
 * 干支纪年（以正月初一为界）
 */
export function getYearGanZhiBySpring(jd: number): GanZhi {
  const yearData = calculateLunarYear(jd)

  let springFestivalJd = yearData.heSuo[2]
  for (let j = 0; j < 14; j++) {
    if (yearData.monthNames[j] !== '正' || (yearData.leapMonth === j && j > 0))
      continue
    springFestivalJd = yearData.heSuo[j]
    if (jd < springFestivalJd) {
      springFestivalJd -= 365
      break
    }
  }

  springFestivalJd = springFestivalJd + 5810
  const yearIndex = Math.floor(springFestivalJd / 365.2422 + 0.5)

  const index = yearIndex + 12000
  return baguaGanZhi(index)
}

/**
 * 干支纪月（以节气大雪为界）
 * @see lunar.js:821-826
 */
export function getMonthGanZhi(jd: number): GanZhi {
  const yearData = calculateLunarYear(jd)

  let monthIndex = Math.floor((jd - yearData.zhongQi[0]) / 30.43685)
  if (monthIndex < 12 && jd >= yearData.zhongQi[2 * monthIndex + 1]) {
    monthIndex++
  }

  const monthOffset = monthIndex + Math.floor((yearData.zhongQi[12] + 390) / 365.2422) * 12 + 900000

  return baguaGanZhi(monthOffset)
}

/**
 * 干支纪日（以2000年1月7日甲子日为基准）
 * @see lunar.js:828-830
 */
export function getDayGanZhi(jd: number): GanZhi {
  const dayOffset = Math.floor(jd) - 6 + 9000000
  return baguaGanZhi(dayOffset)
}

/**
 * 干支纪时
 */
export function getHourGanZhi(jd: number): GanZhi {
  const dayGZ = getDayGanZhi(jd)

  const dayFraction = (jd + 0.5) % 1
  const hour = Math.floor(dayFraction * 24)
  const shiChen = Math.floor((hour + 1) / 2) % 12

  const dayGanBase = [0, 2, 4, 6, 8][dayGZ.gan.index % 5]
  const hourIndex = dayGanBase * 12 + shiChen

  return baguaGanZhi(hourIndex)
}

/**
 * 获取生肖
 */
export function getShengXiao(jd: number, useLichun: boolean = true): string {
  const gz = useLichun ? getYearGanZhi(jd) : getYearGanZhiBySpring(jd)
  return gz.zhi.shengXiao
}

/**
 * 获取星座
 */
export function getXingZuo(jd: number): string {
  const yearData = calculateLunarYear(jd)

  let constellationIndex = Math.floor((jd - yearData.zhongQi[0] - 15) / 30.43685)
  if (constellationIndex < 11 && jd >= yearData.zhongQi[2 * constellationIndex + 2]) {
    constellationIndex++
  }

  return `${XING_ZUO[(constellationIndex + 12) % 12]}座`
}

/**
 * 完整的干支纪年月日时信息
 */
export interface FullGanZhiInfo {
  year: GanZhi
  yearBySpring: GanZhi
  month: GanZhi
  day: GanZhi
  hour: GanZhi
  shengXiao: string
  xingZuo: string
}

/**
 * 获取完整的干支信息
 */
export function getFullGanZhi(jd: number): FullGanZhiInfo {
  return {
    year: getYearGanZhi(jd),
    yearBySpring: getYearGanZhiBySpring(jd),
    month: getMonthGanZhi(jd),
    day: getDayGanZhi(jd),
    hour: getHourGanZhi(jd),
    shengXiao: getShengXiao(jd),
    xingZuo: getXingZuo(jd),
  }
}

/**
 * 将干支字符串转换为索引
 * @returns 0-59，无效返回-1
 */
export function ganZhiToIndex(ganZhiStr: string): number {
  if (ganZhiStr.length !== 2) return -1

  const ganIdx = TIAN_GAN.indexOf(ganZhiStr[0] as typeof TIAN_GAN[number])
  const zhiIdx = DI_ZHI.indexOf(ganZhiStr[1] as typeof DI_ZHI[number])

  if (ganIdx === -1 || zhiIdx === -1) return -1
  if (ganIdx % 2 !== zhiIdx % 2) return -1

  for (let i = 0; i < 60; i++) {
    if (i % 10 === ganIdx && i % 12 === zhiIdx) return i
  }

  return -1
}

/** 六十甲子表（字符串数组，兼容） */
export const JIA_ZI_TABLE: readonly string[] = BAGUA_JIA_ZI_TABLE.map(gz => gz.name)
