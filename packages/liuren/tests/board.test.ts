import { ganZhi, zhi } from '@yhjs/bagua'
import { describe, expect, it } from 'vitest'
import { buildLiurenBoard } from '../src/board'
import { computeDestiny } from '../src/destiny'

describe('destiny', () => {
  it('should compute time/destiny/live', () => {
    const result = computeDestiny(zhi('未'), zhi('亥'), zhi('酉'))
    expect(result.time.name).toBe('未')
    expect(result.destiny.name).toBe('亥')
    expect(result.live.name).toBe('酉')
  })

  it('should default live to hourZhi when not specified', () => {
    const result = computeDestiny(zhi('未'), zhi('亥'))
    expect(result.live.name).toBe('未')
  })
})

describe('buildLiurenBoard', () => {
  // 1985-03-15 14:00, keyGanZhi=癸丑 (日柱)
  // 四柱: 乙丑/己卯/癸丑/乙未
  // 月将: 亥(登明), 时支: 未(7)
  it('should build a complete board for 1985-03-15 14:00', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1985, 2, 15, 14, 0, 0),
      keyGanZhi: ganZhi('癸丑'),
    })

    expect(board.meta.yuejiangZhi.name).toBe('亥')
    expect(board.meta.isFuyin).toBe(false)
    expect(board.palaces).toHaveLength(12)
    expect(board.palaces[0].tianpan.name).toBe('辰')
    expect(board.palaces.every(p => p.guiGod !== null)).toBe(true)
    expect(board.palaces.every(p => p.outerGan !== null)).toBe(true)
    expect(board.palaces.every(p => p.jianChu !== null)).toBe(true)
    expect(board.palaces.every(p => p.twelvePalace !== null)).toBe(true)
    expect(board.palaces.filter(p => p.taiyin).length).toBe(1)
    expect(board.legend.ganLegend[0].name).toBe('巳')
    expect(board.legend.ganLegend[1].name).toBe('酉')
    expect(board.legend.ganLegend[2].name).toBe('丑')
    expect(board.destiny.time.name).toBe('未')
    expect(board.destiny.destiny.name).toBe('亥')
  })

  // 伏吟: 1990-10-08 08:00, keyGanZhi=乙巳 (日柱)
  // 月将=辰, 时支=辰 → 伏吟
  it('should handle 伏吟 for 1990-10-08 08:00', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1990, 9, 8, 8, 0, 0),
      keyGanZhi: ganZhi('乙巳'),
    })
    expect(board.meta.isFuyin).toBe(true)
    for (let i = 0; i < 12; i++) {
      expect(board.palaces[i].tianpan.name).toBe(board.palaces[i].zhi.name)
    }
  })

  it('should use specified guiGodType', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1985, 2, 15, 14, 0, 0),
      keyGanZhi: ganZhi('癸丑'),
      guiGodType: 'yin',
    })
    expect(board.meta.guiGodType).toBe('yin')
  })

  it('should use specified shengXiao for destiny.live', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1985, 2, 15, 14, 0, 0),
      keyGanZhi: ganZhi('癸丑'),
      shengXiao: zhi('午'),
    })
    expect(board.destiny.live.name).toBe('午')
  })
})
