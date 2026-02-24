import type { Zhi } from '@yhjs/bagua'
import type { ZhiPalace } from './types'
import { zhi } from '@yhjs/bagua'
import {
  calculateLunarYear,
  gregorianToJD,
  J2000,
} from '@yhjs/lunar'

/* ------------------------------------------------------------------ */
/*  月将名称常量                                                        */
/* ------------------------------------------------------------------ */

/** 十二月将全名，按地支子(0)~亥(11)排列 */
export const YUEJIANG_NAMES = [
  '神后', // 子
  '大吉', // 丑
  '功曹', // 寅
  '太冲', // 卯
  '天罡', // 辰
  '太乙', // 巳
  '胜光', // 午
  '小吉', // 未
  '传送', // 申
  '从魁', // 酉
  '河魁', // 戌
  '登明', // 亥
] as const

/* ------------------------------------------------------------------ */
/*  dateToJd                                                           */
/* ------------------------------------------------------------------ */

/**
 * 将 Date 转为 J2000 相对儒略日
 */
export function dateToJd(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate() + date.getHours() / 24 + date.getMinutes() / 1440 + date.getSeconds() / 86400
  return gregorianToJD(y, m, d) - J2000
}

/* ------------------------------------------------------------------ */
/*  resolveYuejiang                                                    */
/* ------------------------------------------------------------------ */

/**
 * 根据 J2000 儒略日计算月将地支
 *
 * 算法：
 * 1. 获取当年节气数据（zhongQi 25 个，从冬至起）
 * 2. 找到最近的中气（偶数索引：0,2,4,...,22,24）
 * 3. 映射到月将地支：(13 - evenIndex/2 + 12) % 12
 */
export function resolveYuejiang(jd: number): Zhi {
  const yearData = calculateLunarYear(jd)
  const zhongQi = yearData.zhongQi

  // 找到最近的中气（偶数索引）
  let latestEvenIndex = 0
  for (let i = 0; i <= 24; i += 2) {
    if (zhongQi[i] <= jd) {
      latestEvenIndex = i
    }
  }

  // 映射到月将地支索引
  const zhiIdx = (13 - latestEvenIndex / 2 + 12) % 12
  return zhi(zhiIdx)
}

/* ------------------------------------------------------------------ */
/*  initPalaces                                                        */
/* ------------------------------------------------------------------ */

/**
 * 创建 12 地盘宫位
 * palace[0]=子, palace[1]=丑, ..., palace[11]=亥
 */
export function initPalaces(): ZhiPalace[] {
  const palaces: ZhiPalace[] = []
  for (let i = 0; i < 12; i++) {
    palaces.push({
      zhi: zhi(i),
      tianpan: zhi(i), // 初始天盘 = 地盘
      guiGod: null,
      outerGan: null,
    })
  }
  return palaces
}

/* ------------------------------------------------------------------ */
/*  setTianpan                                                         */
/* ------------------------------------------------------------------ */

/**
 * 排天盘：月将落于时支位置，其余顺时针排列
 *
 * @param palaces    - 12 宫位（地盘）
 * @param yuejiangZhi - 月将地支
 * @param hourZhi     - 时支
 * @returns 新的 12 宫位数组（天盘已设置）
 */
export function setTianpan(
  palaces: readonly ZhiPalace[],
  yuejiangZhi: Zhi,
  hourZhi: Zhi,
): ZhiPalace[] {
  const result = palaces.map(p => ({ ...p }))

  // 月将地支的索引
  const yjIdx = yuejiangZhi.index
  // 时支索引（月将要落在此处）
  const hourIdx = hourZhi.index

  // 天盘偏移量：月将(yjIdx)落在 hourZhi(hourIdx) 位置
  // 对于宫位 i，天盘地支 = (yjIdx + (i - hourIdx) + 12) % 12
  for (let i = 0; i < 12; i++) {
    const tianpanIdx = ((yjIdx + (i - hourIdx)) % 12 + 12) % 12
    result[i] = { ...result[i], tianpan: zhi(tianpanIdx) }
  }

  return result
}
