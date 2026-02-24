import { describe, expect, it } from 'vitest'
import { computeFourPillars, dateToJd } from '../src/pillar'

describe('pillar', () => {
  describe('dateToJd', () => {
    it('should convert 2000-01-01 12:00 to JD ~0', () => {
      const jd = dateToJd(new Date(2000, 0, 1, 12, 0, 0))
      expect(Math.abs(jd)).toBeLessThan(0.01)
    })
  })

  describe('computeFourPillars', () => {
    // 1990-10-08 08:00
    it('should compute 1990-10-08 08:00 correctly', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const pillars = computeFourPillars(jd)
      expect(pillars.year.name).toBe('庚午')
      expect(pillars.month.name).toBe('丙戌')
      expect(pillars.day.name).toBe('乙巳')
      expect(pillars.hour.name).toBe('庚辰')
    })

    // 1985-03-15 14:00
    it('should compute 1985-03-15 14:00 correctly', () => {
      const jd = dateToJd(new Date(1985, 2, 15, 14, 0, 0))
      const pillars = computeFourPillars(jd)
      expect(pillars.year.name).toBe('乙丑')
      expect(pillars.month.name).toBe('己卯')
      expect(pillars.day.name).toBe('癸丑')
      expect(pillars.hour.name).toBe('乙未')
    })

    // 2000-01-01 00:30 (子时)
    it('should compute 2000-01-01 00:30 correctly', () => {
      const jd = dateToJd(new Date(2000, 0, 1, 0, 30, 0))
      const pillars = computeFourPillars(jd)
      expect(pillars.year.name).toBe('己卯')
      expect(pillars.month.name).toBe('丙子')
      expect(pillars.day.name).toBe('丁巳')
      expect(pillars.hour.name).toBe('丙子')
    })

    // 立春前后: 2024-02-02 10:00 前=癸卯年, 12:00 后=甲辰年
    it('should handle lichun boundary for year pillar', () => {
      const jdBefore = dateToJd(new Date(2024, 1, 2, 10, 0, 0))
      const pillarsBefore = computeFourPillars(jdBefore)
      expect(pillarsBefore.year.name).toBe('癸卯')

      const jdAfter = dateToJd(new Date(2024, 1, 2, 12, 0, 0))
      const pillarsAfter = computeFourPillars(jdAfter)
      expect(pillarsAfter.year.name).toBe('甲辰')
    })

    // 23时后（子时）
    it('should handle 23:00+ (zi shi next day)', () => {
      const jd = dateToJd(new Date(2000, 0, 1, 23, 30, 0))
      const pillars = computeFourPillars(jd)
      expect(pillars.hour.zhi.name).toBe('子')
    })

    it('should return GanZhi objects with full properties', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const pillars = computeFourPillars(jd)
      expect(pillars.year.gan).toBeDefined()
      expect(pillars.year.zhi).toBeDefined()
      expect(pillars.year.nayin).toBeDefined()
      expect(pillars.year.kongWang).toBeDefined()
    })
  })
})
