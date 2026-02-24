import type { GanZhi } from '@yhjs/bagua'
import {
  getDayGanZhi,
  getHourGanZhi,
  getMonthGanZhi,
  getYearGanZhi,
  gregorianToJD,
  J2000,
} from '@yhjs/lunar'

export interface FourPillars {
  readonly year: GanZhi
  readonly month: GanZhi
  readonly day: GanZhi
  readonly hour: GanZhi
}

export function dateToJd(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate() + date.getHours() / 24 + date.getMinutes() / 1440 + date.getSeconds() / 86400
  return gregorianToJD(y, m, d) - J2000
}

export function computeFourPillars(jd: number): FourPillars {
  return {
    year: getYearGanZhi(jd),
    month: getMonthGanZhi(jd),
    day: getDayGanZhi(jd),
    hour: getHourGanZhi(jd),
  }
}
