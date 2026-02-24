import type { GanZhi } from '@yhjs/bagua'
import {
  getDayGanZhi,
  getHourGanZhi,
  getMonthGanZhi,
  getYearGanZhi,
} from '@yhjs/lunar'

export interface FourPillars {
  readonly year: GanZhi
  readonly month: GanZhi
  readonly day: GanZhi
  readonly hour: GanZhi
}

/**
 * 根据 J2000 儒略日计算四柱干支
 */
export function computeFourPillars(jd: number): FourPillars {
  return {
    year: getYearGanZhi(jd),
    month: getMonthGanZhi(jd),
    day: getDayGanZhi(jd),
    hour: getHourGanZhi(jd),
  }
}
