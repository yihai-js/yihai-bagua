import { describe, expect, it } from 'vitest'
import { buildLiurenBoard } from '../src/board'
import { ganZhi, zhi } from '@yhjs/bagua'

describe('liuren E2E', () => {
  describe('1985-03-15 14:00 癸丑 (非伏吟)', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1985, 2, 15, 14, 0, 0),
      keyGanZhi: ganZhi('癸丑'),
    })

    it('meta should be correct', () => {
      expect(board.meta.yuejiangZhi.name).toBe('亥')
      expect(board.meta.guiGodType).toMatch(/^(yang|yin)$/)
      expect(board.meta.isFuyin).toBe(false)
      expect(board.meta.fourPillars.year.name).toBe('乙丑')
      expect(board.meta.fourPillars.day.name).toBe('癸丑')
    })

    it('palaces should have 12 entries with all fields', () => {
      expect(board.palaces).toHaveLength(12)
      for (const p of board.palaces) {
        expect(p.zhi).toBeDefined()
        expect(p.tianpan).toBeDefined()
        expect(p.guiGod).not.toBeNull()
        expect(p.outerGan).not.toBeNull()
      }
    })

    it('tianpan should follow yuejiang=亥 hourZhi=未 mapping', () => {
      expect(board.palaces[7].tianpan.name).toBe('亥')
      expect(board.palaces[0].tianpan.name).toBe('辰')
    })

    it('legend should be 巳酉丑 / 巳酉丑', () => {
      expect(board.legend.ganLegend.map(z => z.name)).toEqual(['巳', '酉', '丑'])
      expect(board.legend.zhiLegend.map(z => z.name)).toEqual(['巳', '酉', '丑'])
    })

    it('destiny should have time=未 destiny=亥', () => {
      expect(board.destiny.time.name).toBe('未')
      expect(board.destiny.destiny.name).toBe('亥')
    })
  })

  describe('1990-10-08 08:00 乙巳 (伏吟)', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1990, 9, 8, 8, 0, 0),
      keyGanZhi: ganZhi('乙巳'),
    })

    it('should be 伏吟', () => {
      expect(board.meta.isFuyin).toBe(true)
    })

    it('tianpan should equal dipan for all palaces', () => {
      for (const p of board.palaces) {
        expect(p.tianpan.name).toBe(p.zhi.name)
      }
    })

    it('伏吟 legend should use 刑/冲 logic', () => {
      expect(board.legend.ganLegend[0].name).toBe('辰')
      expect(board.legend.ganLegend[1].name).toBe('戌')
      expect(board.legend.ganLegend[2].name).toBe('未')
    })
  })

  describe('custom options', () => {
    it('should respect guiGodType=yin', () => {
      const board = buildLiurenBoard({
        datetime: new Date(1985, 2, 15, 14, 0, 0),
        keyGanZhi: ganZhi('癸丑'),
        guiGodType: 'yin',
      })
      expect(board.meta.guiGodType).toBe('yin')
    })

    it('should respect shengXiao for destiny.live', () => {
      const board = buildLiurenBoard({
        datetime: new Date(1985, 2, 15, 14, 0, 0),
        keyGanZhi: ganZhi('癸丑'),
        shengXiao: zhi('午'),
      })
      expect(board.destiny.live.name).toBe('午')
    })
  })
})
