import { describe, expect, it } from 'vitest'
import { buildAllPillars, buildPillar } from '../src/analysis'
import { computeFourPillars, dateToJd } from '../src/pillar'
import { gan, ganZhi } from '@yhjs/bagua'

describe('analysis', () => {
  describe('buildPillar', () => {
    it('should compute tenGod for non-day pillar', () => {
      // 日主甲，年柱庚午 → 庚对甲=七煞
      const dayMaster = gan('甲')
      const pillar = buildPillar(ganZhi('庚午'), dayMaster)
      expect(pillar.tenGod).not.toBeNull()
      expect(pillar.tenGod!.name).toBe('七煞')
    })

    it('should return null tenGod for day pillar', () => {
      const dayMaster = gan('壬')
      const pillar = buildPillar(ganZhi('壬戌'), dayMaster, true)
      expect(pillar.tenGod).toBeNull()
    })

    it('should expand hidden gans with tenGod', () => {
      // 日主壬，地支寅 → 藏干: 戊(main)=七煞, 丙(middle)=偏财, 甲(minor)=食神
      const dayMaster = gan('壬')
      const pillar = buildPillar(ganZhi('甲寅'), dayMaster)

      expect(pillar.hiddenGods).toHaveLength(3)
      expect(pillar.hiddenGods[0].gan.name).toBe('戊')
      expect(pillar.hiddenGods[0].weight).toBe('main')
      expect(pillar.hiddenGods[0].tenGod.name).toBe('七煞')

      expect(pillar.hiddenGods[1].gan.name).toBe('丙')
      expect(pillar.hiddenGods[1].weight).toBe('middle')
      expect(pillar.hiddenGods[1].tenGod.name).toBe('偏财')

      expect(pillar.hiddenGods[2].gan.name).toBe('甲')
      expect(pillar.hiddenGods[2].weight).toBe('minor')
      expect(pillar.hiddenGods[2].tenGod.name).toBe('食神')
    })
  })

  describe('buildAllPillars', () => {
    it('should build all four pillars for 1990-10-08 08:00', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const fourPillars = computeFourPillars(jd)
      const built = buildAllPillars(fourPillars)

      // Verify day master
      const dayMasterName = fourPillars.day.gan.name

      // 日柱 tenGod = null
      expect(built.day.tenGod).toBeNull()

      // All other pillars should have non-null tenGod
      expect(built.year.tenGod).not.toBeNull()
      expect(built.month.tenGod).not.toBeNull()
      expect(built.hour.tenGod).not.toBeNull()

      // All pillars should have hiddenGods
      expect(built.year.hiddenGods.length).toBeGreaterThan(0)
      expect(built.month.hiddenGods.length).toBeGreaterThan(0)
      expect(built.day.hiddenGods.length).toBeGreaterThan(0)
      expect(built.hour.hiddenGods.length).toBeGreaterThan(0)

      // Each hidden god should have a tenGod
      for (const hg of built.year.hiddenGods) {
        expect(hg.tenGod).toBeDefined()
        expect(hg.weight).toMatch(/^(main|middle|minor)$/)
      }
    })
  })
})
