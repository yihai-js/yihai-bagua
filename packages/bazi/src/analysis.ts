import type { Gan, GanZhi, TenGod } from '@yhjs/bagua'
import { tenGod } from '@yhjs/bagua'
import type { HiddenGodEntry, Pillar } from './types'
import type { FourPillars } from './pillar'

/**
 * 构建单个柱（计算十神 + 展开藏干）
 * @param ganZhi 柱干支
 * @param dayMaster 日主天干
 * @param isDayPillar 是否为日柱（日柱自身 tenGod = null）
 */
export function buildPillar(ganZhi: GanZhi, dayMaster: Gan, isDayPillar: boolean = false): Pillar {
  const ganTenGod: TenGod | null = isDayPillar ? null : tenGod(dayMaster, ganZhi.gan)

  const hiddenGods: HiddenGodEntry[] = ganZhi.zhi.hiddenGans.map(hg => ({
    gan: hg.gan,
    tenGod: tenGod(dayMaster, hg.gan),
    weight: hg.weight,
  }))

  return {
    ganZhi,
    tenGod: ganTenGod,
    hiddenGods,
  }
}

/**
 * 四柱结果（含十神和藏干展开）
 */
export interface BuiltPillars {
  readonly year: Pillar
  readonly month: Pillar
  readonly day: Pillar
  readonly hour: Pillar
}

/**
 * 从四柱干支构建完整的四柱信息
 * @param fourPillars 四柱干支
 */
export function buildAllPillars(fourPillars: FourPillars): BuiltPillars {
  const dayMaster = fourPillars.day.gan
  return {
    year: buildPillar(fourPillars.year, dayMaster),
    month: buildPillar(fourPillars.month, dayMaster),
    day: buildPillar(fourPillars.day, dayMaster, true),
    hour: buildPillar(fourPillars.hour, dayMaster),
  }
}
