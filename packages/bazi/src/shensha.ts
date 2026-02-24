import type { GanZhi, Zhi } from '@yhjs/bagua'
import { zhi } from '@yhjs/bagua'
import type { ShenshaResult } from './types'

/**
 * 驿马表: 地支 index % 4 → 驿马地支 index
 * 申子辰→寅(2), 巳酉丑→亥(11), 寅午戌→申(8), 亥卯未→巳(5)
 */
const HORSE_INDEX_LIST = [2, 11, 8, 5] as const

/**
 * 天乙贵人表: 天干 index → [阳贵地支index, 阴贵地支index]
 */
const GUI_GOD_LIST: readonly (readonly [number, number])[] = [
  [1, 7],   // 甲 → 丑未
  [0, 8],   // 乙 → 子申
  [11, 9],  // 丙 → 亥酉
  [11, 9],  // 丁 → 亥酉
  [1, 7],   // 戊 → 丑未
  [0, 8],   // 己 → 子申
  [1, 7],   // 庚 → 丑未
  [6, 2],   // 辛 → 午寅
  [5, 3],   // 壬 → 巳卯
  [5, 3],   // 癸 → 巳卯
]

/**
 * 旺相休囚死矩阵
 * 行=月支五行(0木1火2土3金4水), 列=目标五行(0木1火2土3金4水)
 */
const SEASON_POWER_LIST: readonly (readonly string[])[] = [
  ['旺', '相', '死', '囚', '休'], // 木月(春)
  ['休', '旺', '相', '死', '囚'], // 火月(夏)
  ['囚', '休', '旺', '相', '死'], // 土月(四季)
  ['死', '囚', '休', '旺', '相'], // 金月(秋)
  ['相', '死', '囚', '休', '旺'], // 水月(冬)
]

export function computeHorse(ganZhi: GanZhi): Zhi {
  const horseIdx = HORSE_INDEX_LIST[ganZhi.zhi.index % 4]
  return zhi(horseIdx)
}

export function computeGuiren(ganZhi: GanZhi): readonly [Zhi, Zhi] {
  const [yangIdx, yinIdx] = GUI_GOD_LIST[ganZhi.gan.index]
  return [zhi(yangIdx), zhi(yinIdx)]
}

export function computeSeasonPower(monthZhi: Zhi): readonly string[] {
  return SEASON_POWER_LIST[monthZhi.wuxing]
}

export function computeShensha(
  yearGanZhi: GanZhi,
  monthGanZhi: GanZhi,
  dayGanZhi: GanZhi,
  hourGanZhi: GanZhi,
): ShenshaResult {
  const pillars = [yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi]

  return {
    horses: pillars.map(p => computeHorse(p)),
    kongWang: pillars.map(p => p.kongWang),
    guiren: pillars.map(p => computeGuiren(p)),
    seasonPower: computeSeasonPower(monthGanZhi.zhi),
  }
}
