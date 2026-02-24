import type { Gan, GanZhi } from '@yhjs/bagua'
import { ganZhi, tenGod } from '@yhjs/bagua'
import type { DayunEntry, LiunianEntry, LiuyueEntry } from './types'

/**
 * 计算某步大运内的流年列表
 */
export function computeLiunian(
  dayunEntry: DayunEntry,
  yearGanZhi: GanZhi,
  dayMaster: Gan,
  birthYear: number,
  nextDayunStartAge?: number,
): readonly LiunianEntry[] {
  const endAge = nextDayunStartAge ?? dayunEntry.startAge + 10
  const result: LiunianEntry[] = []

  for (let age = dayunEntry.startAge; age < endAge; age++) {
    // 流年干支 = 年柱干支 + 年龄偏移
    const gzIndex = (yearGanZhi.index as number) + age
    const gz = ganZhi(gzIndex)

    result.push({
      ganZhi: gz,
      year: birthYear + age,
      age,
      tenGod: tenGod(dayMaster, gz.gan),
    })
  }

  return result
}

/**
 * 计算运前（大运前）的流年列表
 */
export function computePreDayunLiunian(
  yearGanZhi: GanZhi,
  dayMaster: Gan,
  birthYear: number,
  startAge: number,
): readonly LiunianEntry[] {
  const result: LiunianEntry[] = []

  for (let age = 0; age < startAge; age++) {
    const gzIndex = (yearGanZhi.index as number) + age
    const gz = ganZhi(gzIndex)
    result.push({
      ganZhi: gz,
      year: birthYear + age,
      age,
      tenGod: tenGod(dayMaster, gz.gan),
    })
  }

  return result
}

/**
 * 五虎遁月干起始索引
 * 甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
 */
const TIGER_GAN_BASE = [2, 4, 6, 8, 0] as const

/**
 * 计算某年的 12 个流月干支（五虎遁）
 */
export function computeLiuyue(
  yearGan: Gan,
  dayMaster: Gan,
): readonly LiuyueEntry[] {
  const baseGanIdx = TIGER_GAN_BASE[yearGan.index % 5]
  const result: LiuyueEntry[] = []

  for (let i = 0; i < 12; i++) {
    // 月支: 从寅(2)开始
    const zhiIdx = (i + 2) % 12
    // 月干: baseGanIdx + i
    const ganIdx = (baseGanIdx + i) % 10
    // 用 ganZhi() with name lookup instead of index search
    // ganIdx -> gan name, zhiIdx -> zhi name, combine to lookup
    const ganNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    const zhiNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    const gz = ganZhi(ganNames[ganIdx] + zhiNames[zhiIdx])

    result.push({
      ganZhi: gz,
      monthIndex: i + 1,
      tenGod: tenGod(dayMaster, gz.gan),
    })
  }

  return result
}
