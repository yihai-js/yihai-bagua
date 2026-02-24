import { ganZhi, zhi } from '@yhjs/bagua'
import { describe, expect, it } from 'vitest'
import { computeLegend, GAN_JIGONG, isFuyin, XING_TABLE } from '../src/legend'
import { initPalaces, setTianpan } from '../src/yuejiang'

describe('legend', () => {
  describe('data tables', () => {
    it('gAN_JIGONG should have 10 entries', () => {
      expect(GAN_JIGONG).toHaveLength(10)
      expect(GAN_JIGONG[0]).toBe(2) // 甲→寅
      expect(GAN_JIGONG[9]).toBe(1) // 癸→丑
    })
    it('xING_TABLE should have 12 entries', () => {
      expect(XING_TABLE).toHaveLength(12)
      expect(XING_TABLE[0]).toBe(3) // 子→卯
      expect(XING_TABLE[4]).toBe(4) // 辰→辰(自刑)
      expect(XING_TABLE[6]).toBe(6) // 午→午(自刑)
    })
  })

  describe('isFuyin', () => {
    it('should return true when tianpan equals dipan', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('辰'), zhi('辰'))
      expect(isFuyin(palaces)).toBe(true)
    })
    it('should return false when tianpan differs', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('亥'), zhi('未'))
      expect(isFuyin(palaces)).toBe(false)
    })
  })

  describe('computeLegend (non-伏吟)', () => {
    // 1985-03-15 14:00: keyGanZhi=癸丑, yuejiang=亥, hourZhi=未
    // Tianpan mapping: 子→辰, 丑→巳, 寅→午, 卯→未, 辰→申, 巳→酉, 午→戌, 未→亥, 申→子, 酉→丑, 戌→寅, 亥→卯
    //
    // 干传: 癸(9), GAN_JIGONG[9]=1(丑), tianpan[1]=巳(5)
    //   → 巳(5), tianpan[5]=酉(9)
    //   → 酉(9), tianpan[9]=丑(1)
    //   ganLegend = [巳, 酉, 丑]
    //
    // 支传: 丑(1), tianpan[1]=巳(5)
    //   → 巳(5), tianpan[5]=酉(9)
    //   → 酉(9), tianpan[9]=丑(1)
    //   zhiLegend = [巳, 酉, 丑]
    it('should compute legends for non-fuyin case', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('亥'), zhi('未'))
      const legend = computeLegend(palaces, ganZhi('癸丑'))
      expect(legend.ganLegend[0].name).toBe('巳')
      expect(legend.ganLegend[1].name).toBe('酉')
      expect(legend.ganLegend[2].name).toBe('丑')
      expect(legend.zhiLegend[0].name).toBe('巳')
      expect(legend.zhiLegend[1].name).toBe('酉')
      expect(legend.zhiLegend[2].name).toBe('丑')
    })
  })

  describe('computeLegend (伏吟)', () => {
    // yuejiang=辰, hourZhi=辰 → 伏吟 (天盘=地盘)
    // keyGanZhi=乙巳
    //
    // 干传: 乙(1), GAN_JIGONG[1]=4(辰)
    //   step 0: returns 4(辰) directly
    //   step 1: 辰(4), XING[4]=4(辰, 自刑!), chong = (4+6)%12=10(戌)
    //   step 2: 戌(10), XING[10]=7(未) → 未(7)
    //   ganLegend = [辰, 戌, 未]
    //
    // 支传: 巳(5)
    //   step 0: returns 5(巳) directly
    //   step 1: 巳(5), XING[5]=8(申)
    //   step 2: 申(8), XING[8]=2(寅)
    //   zhiLegend = [巳, 申, 寅]
    it('should handle 伏吟 with 自刑→相冲', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('辰'), zhi('辰'))
      const legend = computeLegend(palaces, ganZhi('乙巳'))
      expect(legend.ganLegend[0].name).toBe('辰')
      expect(legend.ganLegend[1].name).toBe('戌')
      expect(legend.ganLegend[2].name).toBe('未')
      expect(legend.zhiLegend[0].name).toBe('巳')
      expect(legend.zhiLegend[1].name).toBe('申')
      expect(legend.zhiLegend[2].name).toBe('寅')
    })
  })
})
