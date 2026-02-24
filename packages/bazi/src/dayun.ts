import type { Gan, GanZhi } from '@yhjs/bagua'
import { ganZhi, tenGod } from '@yhjs/bagua'
import {
  calculateLunarYear,
  J2000,
  jdToGregorian,
} from '@yhjs/lunar'
import type { DayunEntry, Gender } from './types'

const DAYUN_STEPS = 9
const DAYUN_SPAN = 10
const DESTINY_DAY_VALUE = 121.7474

export function isDayunReverse(yearGan: Gan, gender: Gender): boolean {
  const isYangGan = yearGan.yinyang === '阳'
  const isMale = gender === '男'
  return (isMale && !isYangGan) || (!isMale && isYangGan)
}

export function findTargetJie(jd: number, reverse: boolean): number {
  const yearData = calculateLunarYear(jd)
  const zhongQi = yearData.zhongQi

  if (reverse) {
    for (let i = 23; i >= 1; i -= 2) {
      if (zhongQi[i] <= jd) {
        return zhongQi[i]
      }
    }
    const prevYearData = calculateLunarYear(jd - 365)
    const prevZhongQi = prevYearData.zhongQi
    for (let i = 23; i >= 1; i -= 2) {
      if (prevZhongQi[i] <= jd) {
        return prevZhongQi[i]
      }
    }
    return prevZhongQi[23]
  }
  else {
    for (let i = 1; i <= 23; i += 2) {
      if (zhongQi[i] > jd) {
        return zhongQi[i]
      }
    }
    const nextYearData = calculateLunarYear(jd + 365)
    const nextZhongQi = nextYearData.zhongQi
    for (let i = 1; i <= 23; i += 2) {
      if (nextZhongQi[i] > jd) {
        return nextZhongQi[i]
      }
    }
    return nextZhongQi[1]
  }
}

export function computeStartAge(
  birthJd: number,
  targetJieJd: number,
  reverse: boolean,
  birthYear: number,
): number {
  const dayDelta = reverse ? birthJd - targetJieJd : targetJieJd - birthJd
  const dayOffset = dayDelta * DESTINY_DAY_VALUE
  const startAbsJd = (birthJd + J2000) + dayOffset
  const startDate = jdToGregorian(startAbsJd)
  let age = startDate.year - birthYear
  if (age < 0)
    age = 0
  return age
}

export function computeDayun(
  monthGanZhi: GanZhi,
  dayMaster: Gan,
  yearGan: Gan,
  gender: Gender,
  birthJd: number,
  birthYear: number,
): readonly DayunEntry[] {
  const reverse = isDayunReverse(yearGan, gender)
  const targetJieJd = findTargetJie(birthJd, reverse)
  const startAge = computeStartAge(birthJd, targetJieJd, reverse, birthYear)

  const offset = reverse ? -1 : 1
  const result: DayunEntry[] = []

  // IMPORTANT: Use ganZhi() with modular index arithmetic
  // ganZhi() supports modular arithmetic (negative numbers OK, wraps around 60)
  // monthGanZhi.index is GanZhiIndex (0-59), cast to number for arithmetic
  let curIndex = monthGanZhi.index as number

  for (let i = 0; i < DAYUN_STEPS; i++) {
    curIndex += offset
    const dayunGz = ganZhi(curIndex)

    result.push({
      ganZhi: dayunGz,
      startAge: startAge + i * DAYUN_SPAN,
      startYear: birthYear + startAge + i * DAYUN_SPAN,
      tenGod: tenGod(dayMaster, dayunGz.gan),
    })
  }

  return result
}
