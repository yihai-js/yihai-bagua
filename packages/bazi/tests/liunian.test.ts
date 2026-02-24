import { describe, expect, it } from 'vitest'
import { computeLiunian, computeLiuyue, computePreDayunLiunian } from '../src/liunian'
import { computeDayun } from '../src/dayun'
import { computeFourPillars, dateToJd } from '../src/pillar'
import { gan } from '@yhjs/bagua'

describe('liunian', () => {
  describe('computeLiunian', () => {
    it('should compute liunian for one dayun step', () => {
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

      const liunian = computeLiunian(
        dayun[0],
        pillars.year,
        pillars.day.gan,
        1990,
        dayun[1].startAge,
      )

      expect(liunian).toHaveLength(10)

      for (const entry of liunian) {
        expect(entry.ganZhi).toBeDefined()
        expect(entry.year).toBeGreaterThan(0)
        expect(entry.tenGod).toBeDefined()
      }

      // 流年干支应该连续递增
      for (let i = 1; i < liunian.length; i++) {
        const prevIdx = liunian[i - 1].ganZhi.index as number
        const curIdx = liunian[i].ganZhi.index as number
        expect((curIdx - prevIdx + 60) % 60).toBe(1)
      }
    })
  })

  describe('computePreDayunLiunian', () => {
    it('should compute liunian before dayun starts', () => {
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

      const result = computePreDayunLiunian(
        pillars.year,
        pillars.day.gan,
        1990,
        dayun[0].startAge,
      )

      expect(result).toHaveLength(dayun[0].startAge)
      if (result.length > 0) {
        expect(result[0].age).toBe(0)
        expect(result[0].year).toBe(1990)
      }
    })
  })

  describe('computeLiuyue', () => {
    it('should compute 12 months starting from 寅 for 甲 year', () => {
      // 甲年: 丙寅, 丁卯, 戊辰, 己巳, 庚午, 辛未, 壬申, 癸酉, 甲戌, 乙亥, 丙子, 丁丑
      const result = computeLiuyue(gan('甲'), gan('壬'))

      expect(result).toHaveLength(12)
      expect(result[0].ganZhi.name).toBe('丙寅')
      expect(result[0].monthIndex).toBe(1)
      expect(result[1].ganZhi.name).toBe('丁卯')
      expect(result[2].ganZhi.name).toBe('戊辰')
      expect(result[11].ganZhi.name).toBe('丁丑')
      expect(result[11].monthIndex).toBe(12)
    })

    it('should follow five-tiger rule for 乙 year', () => {
      const result = computeLiuyue(gan('乙'), gan('壬'))
      expect(result[0].ganZhi.name).toBe('戊寅')
      expect(result[1].ganZhi.name).toBe('己卯')
    })

    it('should follow five-tiger rule for 丙 year', () => {
      const result = computeLiuyue(gan('丙'), gan('壬'))
      expect(result[0].ganZhi.name).toBe('庚寅')
    })

    it('should follow five-tiger rule for 丁 year', () => {
      const result = computeLiuyue(gan('丁'), gan('壬'))
      expect(result[0].ganZhi.name).toBe('壬寅')
    })

    it('should follow five-tiger rule for 戊 year', () => {
      const result = computeLiuyue(gan('戊'), gan('壬'))
      expect(result[0].ganZhi.name).toBe('甲寅')
    })

    it('should compute tenGod for each month', () => {
      const result = computeLiuyue(gan('甲'), gan('壬'))
      // 丙对壬=偏财
      expect(result[0].tenGod.name).toBe('偏财')
    })
  })
})
