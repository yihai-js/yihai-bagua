import { zhi } from '@yhjs/bagua'
import { describe, expect, it } from 'vitest'
import { dateToJd, initPalaces, resolveYuejiang, setTianpan } from '../src/yuejiang'

describe('yuejiang', () => {
  describe('dateToJd', () => {
    it('should convert 2000-01-01 12:00 to JD ~0', () => {
      const jd = dateToJd(new Date(2000, 0, 1, 12, 0, 0))
      expect(Math.abs(jd)).toBeLessThan(0.01)
    })
  })

  describe('resolveYuejiang', () => {
    it('should return 辰(天罡) for 1990-10-08 (after 秋分, before 霜降)', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const yj = resolveYuejiang(jd)
      expect(yj.name).toBe('辰')
    })

    it('should return 亥(登明) for 1985-03-15 (after 雨水, before 春分)', () => {
      const jd = dateToJd(new Date(1985, 2, 15, 14, 0, 0))
      const yj = resolveYuejiang(jd)
      expect(yj.name).toBe('亥')
    })

    it('should return 丑(大吉) for 2024-01-01 (after 冬至, before 大寒)', () => {
      const jd = dateToJd(new Date(2024, 0, 1, 12, 0, 0))
      const yj = resolveYuejiang(jd)
      expect(yj.name).toBe('丑')
    })
  })

  describe('initPalaces', () => {
    it('should create 12 palaces with ground zhi 子~亥', () => {
      const palaces = initPalaces()
      expect(palaces).toHaveLength(12)
      expect(palaces[0].zhi.name).toBe('子')
      expect(palaces[11].zhi.name).toBe('亥')
    })
  })

  describe('setTianpan', () => {
    it('should place tianpan for yuejiang=亥 hourZhi=未', () => {
      const palaces = initPalaces()
      const result = setTianpan(palaces, zhi('亥'), zhi('未'))
      expect(result[7].tianpan.name).toBe('亥')
      expect(result[8].tianpan.name).toBe('子')
      expect(result[0].tianpan.name).toBe('辰')
    })

    it('should produce 伏吟 when yuejiang equals hourZhi', () => {
      const palaces = initPalaces()
      const result = setTianpan(palaces, zhi('辰'), zhi('辰'))
      for (let i = 0; i < 12; i++) {
        expect(result[i].tianpan.name).toBe(result[i].zhi.name)
      }
    })
  })
})
