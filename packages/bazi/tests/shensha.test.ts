import { describe, expect, it } from 'vitest'
import { computeGuiren, computeHorse, computeSeasonPower, computeShensha } from '../src/shensha'
import { ganZhi, zhi, Wuxing } from '@yhjs/bagua'

describe('shensha', () => {
  describe('computeHorse', () => {
    it('寅午戌马在申', () => {
      expect(computeHorse(ganZhi('甲寅')).name).toBe('申')
      expect(computeHorse(ganZhi('庚午')).name).toBe('申')
      expect(computeHorse(ganZhi('甲戌')).name).toBe('申')
    })

    it('亥卯未马在巳', () => {
      expect(computeHorse(ganZhi('乙亥')).name).toBe('巳')
      expect(computeHorse(ganZhi('乙卯')).name).toBe('巳')
      expect(computeHorse(ganZhi('乙未')).name).toBe('巳')
    })

    it('申子辰马在寅', () => {
      expect(computeHorse(ganZhi('壬申')).name).toBe('寅')
      expect(computeHorse(ganZhi('甲子')).name).toBe('寅')
      expect(computeHorse(ganZhi('甲辰')).name).toBe('寅')
    })

    it('巳酉丑马在亥', () => {
      expect(computeHorse(ganZhi('己巳')).name).toBe('亥')
      expect(computeHorse(ganZhi('辛酉')).name).toBe('亥')
      expect(computeHorse(ganZhi('乙丑')).name).toBe('亥')
    })
  })

  describe('computeGuiren', () => {
    it('甲→丑未', () => {
      const [yang, yin] = computeGuiren(ganZhi('甲子'))
      expect(yang.name).toBe('丑')
      expect(yin.name).toBe('未')
    })

    it('乙→子申', () => {
      const [yang, yin] = computeGuiren(ganZhi('乙丑'))
      expect(yang.name).toBe('子')
      expect(yin.name).toBe('申')
    })

    it('丙→亥酉', () => {
      const [yang, yin] = computeGuiren(ganZhi('丙寅'))
      expect(yang.name).toBe('亥')
      expect(yin.name).toBe('酉')
    })

    it('辛→午寅', () => {
      const [yang, yin] = computeGuiren(ganZhi('辛酉'))
      expect(yang.name).toBe('午')
      expect(yin.name).toBe('寅')
    })

    it('壬→巳卯', () => {
      const [yang, yin] = computeGuiren(ganZhi('壬戌'))
      expect(yang.name).toBe('巳')
      expect(yin.name).toBe('卯')
    })
  })

  describe('computeSeasonPower', () => {
    it('木月(春): 木旺火相土死金囚水休', () => {
      const power = computeSeasonPower(zhi('寅'))
      expect(power[Wuxing.木]).toBe('旺')
      expect(power[Wuxing.火]).toBe('相')
      expect(power[Wuxing.土]).toBe('死')
      expect(power[Wuxing.金]).toBe('囚')
      expect(power[Wuxing.水]).toBe('休')
    })

    it('金月(秋): 金旺水相木死火囚土休', () => {
      const power = computeSeasonPower(zhi('酉'))
      expect(power[Wuxing.金]).toBe('旺')
      expect(power[Wuxing.水]).toBe('相')
      expect(power[Wuxing.木]).toBe('死')
      expect(power[Wuxing.火]).toBe('囚')
      expect(power[Wuxing.土]).toBe('休')
    })
  })

  describe('computeShensha', () => {
    it('should compute shensha for all four pillars', () => {
      const result = computeShensha(
        ganZhi('庚午'),
        ganZhi('乙酉'),
        ganZhi('壬戌'),
        ganZhi('甲辰'),
      )

      expect(result.horses).toHaveLength(4)
      expect(result.horses[0]!.name).toBe('申') // 午→寅午戌马在申
      expect(result.horses[1]!.name).toBe('亥') // 酉→巳酉丑马在亥

      expect(result.kongWang).toHaveLength(4)
      expect(result.kongWang[0]).toHaveLength(2)

      expect(result.guiren).toHaveLength(4)
      expect(result.guiren[0][0].name).toBe('丑') // 庚→丑未
      expect(result.guiren[0][1].name).toBe('未')

      expect(result.seasonPower[Wuxing.金]).toBe('旺') // 酉月=金月
    })
  })
})
