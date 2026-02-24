import type { GanZhi } from '@yhjs/bagua'
import { zhi } from '@yhjs/bagua'
import type { LegendResult, ZhiPalace } from './types'

/* ------------------------------------------------------------------ */
/*  数据表                                                              */
/* ------------------------------------------------------------------ */

/**
 * 十干寄宫：天干索引 → 地支索引
 * 甲→寅(2), 乙→辰(4), 丙→巳(5), 丁→未(7), 戊→巳(5),
 * 己→未(7), 庚→申(8), 辛→戌(10), 壬→亥(11), 癸→丑(1)
 */
export const GAN_JIGONG: readonly number[] = [2, 4, 5, 7, 5, 7, 8, 10, 11, 1]

/**
 * 相刑表：地支索引 → 刑的对象地支索引
 * 子→卯(3), 丑→戌(10), 寅→巳(5), 卯→子(0), 辰→辰(4 自刑),
 * 巳→申(8), 午→午(6 自刑), 未→丑(1), 申→寅(2), 酉→酉(9 自刑),
 * 戌→未(7), 亥→亥(11 自刑)
 */
export const XING_TABLE: readonly number[] = [3, 10, 5, 0, 4, 8, 6, 1, 2, 9, 7, 11]

/* ------------------------------------------------------------------ */
/*  伏吟判断                                                            */
/* ------------------------------------------------------------------ */

/**
 * 判断是否为伏吟（天盘与地盘相同）
 * 通过检查 palace[0] 的天盘是否等于地盘来判断
 */
export function isFuyin(palaces: readonly ZhiPalace[]): boolean {
  return palaces[0].tianpan.index === palaces[0].zhi.index
}

/* ------------------------------------------------------------------ */
/*  内部函数：单步三传推导                                                */
/* ------------------------------------------------------------------ */

/**
 * 获取下一传的地支索引
 *
 * 非伏吟模式：直接查天盘 palaces[zhiIndex].tianpan.index
 * 伏吟模式：
 *   - step 0（首传）：返回 zhiIndex 本身
 *   - step > 0：取相刑，若自刑则取相冲
 */
function getNextLegend(
  zhiIndex: number,
  palaces: readonly ZhiPalace[],
  fuyin: boolean,
  step: number,
): number {
  if (!fuyin) {
    return palaces[zhiIndex].tianpan.index
  }

  // 伏吟模式
  if (step === 0) {
    return zhiIndex
  }

  const xingResult = XING_TABLE[zhiIndex]
  if (xingResult === zhiIndex) {
    // 自刑 → 取相冲
    return (zhiIndex + 6) % 12
  }
  return xingResult
}

/* ------------------------------------------------------------------ */
/*  三传计算                                                            */
/* ------------------------------------------------------------------ */

/**
 * 计算三传（干传 + 支传）
 *
 * 干传：从天干寄宫出发，连续 3 步推导
 * 支传：从用神地支出发，连续 3 步推导
 */
export function computeLegend(
  palaces: readonly ZhiPalace[],
  keyGanZhi: GanZhi,
): LegendResult {
  const fuyin = isFuyin(palaces)

  // 干传：起始为天干寄宫
  const ganStart = GAN_JIGONG[keyGanZhi.gan.index]
  const gan0 = getNextLegend(ganStart, palaces, fuyin, 0)
  const gan1 = getNextLegend(gan0, palaces, fuyin, 1)
  const gan2 = getNextLegend(gan1, palaces, fuyin, 2)

  // 支传：起始为用神地支
  const zhiStart = keyGanZhi.zhi.index
  const zhi0 = getNextLegend(zhiStart, palaces, fuyin, 0)
  const zhi1 = getNextLegend(zhi0, palaces, fuyin, 1)
  const zhi2 = getNextLegend(zhi1, palaces, fuyin, 2)

  return {
    ganLegend: [zhi(gan0), zhi(gan1), zhi(gan2)] as const,
    zhiLegend: [zhi(zhi0), zhi(zhi1), zhi(zhi2)] as const,
  }
}
