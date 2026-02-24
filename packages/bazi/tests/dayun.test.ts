import { describe, expect, it } from 'vitest'
import { computeDayun, findTargetJie, isDayunReverse } from '../src/dayun'
import { computeFourPillars, dateToJd } from '../src/pillar'
import { gan } from '@yhjs/bagua'

describe('dayun', () => {
  describe('isDayunReverse', () => {
    it('阳男顺', () => {
      expect(isDayunReverse(gan('甲'), '男')).toBe(false)
    })
    it('阴男逆', () => {
      expect(isDayunReverse(gan('乙'), '男')).toBe(true)
    })
    it('阳女逆', () => {
      expect(isDayunReverse(gan('甲'), '女')).toBe(true)
    })
    it('阴女顺', () => {
      expect(isDayunReverse(gan('乙'), '女')).toBe(false)
    })
  })

  describe('findTargetJie', () => {
    it('should find next jie for forward dayun', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const targetJd = findTargetJie(jd, false)
      expect(targetJd).toBeGreaterThan(jd)
    })

    it('should find prev jie for reverse dayun', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const targetJd = findTargetJie(jd, true)
      expect(targetJd).toBeLessThan(jd)
    })
  })

  describe('computeDayun', () => {
    it('should compute 9 steps of dayun', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const pillars = computeFourPillars(jd)
      const dayun = computeDayun(
        pillars.month,
        pillars.day.gan,
        pillars.year.gan,
        '男',
        jd,
        1990,
      )

      expect(dayun).toHaveLength(9)

      // 庚(阳)+男=顺, dayun should go forward from month pillar
      // Verify dayun ganZhi are consecutive (forward)
      for (let i = 1; i < dayun.length; i++) {
        const prevIdx = dayun[i - 1].ganZhi.index as number
        const curIdx = dayun[i].ganZhi.index as number
        expect((curIdx - prevIdx + 60) % 60).toBe(1)
      }

      // 每步间隔 10 年
      expect(dayun[1].startAge - dayun[0].startAge).toBe(10)

      // 十神应该有值
      expect(dayun[0].tenGod).toBeDefined()
      expect(dayun[0].tenGod.name).toBeTruthy()
    })

    it('should reverse for yin-male', () => {
      const jd = dateToJd(new Date(1985, 2, 15, 14, 0, 0))
      const pillars = computeFourPillars(jd)
      const dayun = computeDayun(
        pillars.month,
        pillars.day.gan,
        pillars.year.gan,
        '男',
        jd,
        1985,
      )

      expect(dayun).toHaveLength(9)
      // 乙(阴)+男=逆, dayun should go backward
      // Verify consecutive backward
      for (let i = 1; i < dayun.length; i++) {
        const prevIdx = dayun[i - 1].ganZhi.index as number
        const curIdx = dayun[i].ganZhi.index as number
        expect((prevIdx - curIdx + 60) % 60).toBe(1)
      }
    })

    it('should have increasing startAge and startYear', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const pillars = computeFourPillars(jd)
      const dayun = computeDayun(
        pillars.month,
        pillars.day.gan,
        pillars.year.gan,
        '男',
        jd,
        1990,
      )

      for (let i = 1; i < dayun.length; i++) {
        expect(dayun[i].startAge).toBe(dayun[i - 1].startAge + 10)
        expect(dayun[i].startYear).toBe(dayun[i - 1].startYear + 10)
      }
    })
  })
})
