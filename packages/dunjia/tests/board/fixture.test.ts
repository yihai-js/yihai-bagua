import { describe, expect, it } from 'vitest'
import { CENTER_PALACE } from '../../src/base/nine-palace'
import { LIUYI_LIST } from '../../src/base/xun'
import { buildBoard } from '../../src/board/common'
import { FIXTURE_CASES } from '../fixtures/fixture-data'

describe('board/fixture', () => {
  describe('buildBoard 结构验证', () => {
    for (const fixture of FIXTURE_CASES) {
      describe(fixture.description, () => {
        const { palaces, meta } = buildBoard({
          datetime: fixture.datetime,
          type: 'hour',
        })

        it('应产生 9 个宫位', () => {
          expect(palaces).toHaveLength(9)
        })

        it('meta.type 应为 hour', () => {
          expect(meta.type).toBe(fixture.expectedMeta.type)
        })

        it(`阴阳遁应为 ${fixture.expectedMeta.yinyang}`, () => {
          expect(meta.yinyang).toBe(fixture.expectedMeta.yinyang)
        })

        it('局数应在 1-9 范围内', () => {
          expect(meta.juNumber).toBeGreaterThanOrEqual(1)
          expect(meta.juNumber).toBeLessThanOrEqual(9)
        })

        it('moveStarOffset 初始值应为 0', () => {
          expect(meta.moveStarOffset).toBe(0)
        })

        it('外 8 宫地盘天干应为有效六仪三奇', () => {
          for (let i = 0; i < 9; i++) {
            if (i === CENTER_PALACE)
              continue
            expect(palaces[i].groundGan).toBeTruthy()
            expect(LIUYI_LIST).toContain(palaces[i].groundGan)
          }
        })

        it('外 8 宫天盘天干应为有效六仪三奇', () => {
          for (let i = 0; i < 9; i++) {
            if (i === CENTER_PALACE)
              continue
            expect(palaces[i].skyGan).toBeTruthy()
            expect(LIUYI_LIST).toContain(palaces[i].skyGan)
          }
        })

        it('外 8 宫九星应全部填充且互不重复', () => {
          const starNames: string[] = []
          for (let i = 0; i < 9; i++) {
            if (i === CENTER_PALACE)
              continue
            expect(palaces[i].star).not.toBeNull()
            starNames.push(palaces[i].star!.name)
          }
          expect(new Set(starNames).size).toBe(8)
        })

        it('外 8 宫八门应全部填充且互不重复', () => {
          const doorNames: string[] = []
          for (let i = 0; i < 9; i++) {
            if (i === CENTER_PALACE)
              continue
            expect(palaces[i].door).not.toBeNull()
            doorNames.push(palaces[i].door!.name)
          }
          expect(new Set(doorNames).size).toBe(8)
        })

        it('外 8 宫八神应全部填充且互不重复', () => {
          const godNames: string[] = []
          for (let i = 0; i < 9; i++) {
            if (i === CENTER_PALACE)
              continue
            expect(palaces[i].god).not.toBeNull()
            godNames.push(palaces[i].god!.name)
          }
          expect(new Set(godNames).size).toBe(8)
        })

        it('中宫应为空（星门神清空）', () => {
          expect(palaces[CENTER_PALACE].groundGan).toBe('')
          expect(palaces[CENTER_PALACE].star).toBeNull()
          expect(palaces[CENTER_PALACE].door).toBeNull()
          expect(palaces[CENTER_PALACE].god).toBeNull()
        })

        it('坤宫应有寄宫天干', () => {
          const kunPalace = palaces[2] // EXTRA_PALACE = 2
          expect(kunPalace.groundExtraGan).toBeTruthy()
        })

        it('外 8 宫隐干应全部填充', () => {
          let outGanCount = 0
          for (let i = 0; i < 9; i++) {
            if (i === CENTER_PALACE)
              continue
            if (palaces[i].outGan)
              outGanCount++
          }
          expect(outGanCount).toBe(8)
        })

        it('干支应为两个字符', () => {
          expect(meta.ganZhi).toHaveLength(2)
        })

        it('节气应为非空字符串', () => {
          expect(meta.solarTerm).toBeTruthy()
          expect(typeof meta.solarTerm).toBe('string')
        })

        it('旬首应为非空字符串', () => {
          expect(meta.xunHead).toBeTruthy()
          expect(meta.xunHeadGan).toBeTruthy()
        })
      })
    }
  })

  describe('buildBoard 精确值回归验证', () => {
    for (const fixture of FIXTURE_CASES) {
      describe(fixture.description, () => {
        const { palaces, meta } = buildBoard({
          datetime: fixture.datetime,
          type: 'hour',
        })

        it('meta 精确值', () => {
          expect(meta.juNumber).toBe(fixture.expectedMeta.juNumber)
          expect(meta.xunHead).toBe(fixture.expectedMeta.xunHead)
          expect(meta.xunHeadGan).toBe(fixture.expectedMeta.xunHeadGan)
          expect(meta.ganZhi).toBe(fixture.expectedMeta.ganZhi)
          expect(meta.solarTerm).toBe(fixture.expectedMeta.solarTerm)
          expect(meta.yinyang).toBe(fixture.expectedMeta.yinyang)
        })

        it('每宫精确值', () => {
          expect(fixture.expectedPalaces).toHaveLength(9)
          for (let i = 0; i < 9; i++) {
            const actual = palaces[i]
            const expected = fixture.expectedPalaces[i]
            expect(actual.groundGan, `宫 ${i} groundGan`).toBe(expected.groundGan)
            expect(actual.groundExtraGan, `宫 ${i} groundExtraGan`).toBe(expected.groundExtraGan)
            expect(actual.skyGan, `宫 ${i} skyGan`).toBe(expected.skyGan)
            expect(actual.skyExtraGan, `宫 ${i} skyExtraGan`).toBe(expected.skyExtraGan)
            expect(actual.star?.name ?? null, `宫 ${i} star`).toBe(expected.star)
            expect(actual.door?.name ?? null, `宫 ${i} door`).toBe(expected.door)
            expect(actual.god?.name ?? null, `宫 ${i} god`).toBe(expected.god)
            expect(actual.outGan, `宫 ${i} outGan`).toBe(expected.outGan)
            expect(actual.outExtraGan, `宫 ${i} outExtraGan`).toBe(expected.outExtraGan)
          }
        })
      })
    }
  })

  describe('buildBoard 快照一致性', () => {
    it('相同时间的两次排盘应产生相同结果', () => {
      const dt = new Date(2026, 1, 22, 14, 0, 0)
      const board1 = buildBoard({ datetime: dt })
      const board2 = buildBoard({ datetime: dt })

      expect(board1.palaces).toEqual(board2.palaces)
      expect(board1.meta).toEqual(board2.meta)
    })

    it('相同时间排盘的宫位引用应不同（不可变）', () => {
      const dt = new Date(2026, 1, 22, 14, 0, 0)
      const board1 = buildBoard({ datetime: dt })
      const board2 = buildBoard({ datetime: dt })

      expect(board1.palaces).not.toBe(board2.palaces)
      for (let i = 0; i < 9; i++) {
        expect(board1.palaces[i]).not.toBe(board2.palaces[i])
      }
    })

    it('不同时间应产生不同排盘', () => {
      const board1 = buildBoard({ datetime: new Date(2026, 1, 22, 14, 0, 0) })
      const board2 = buildBoard({ datetime: new Date(2026, 5, 21, 12, 0, 0) })

      // 阴阳应不同
      expect(board1.meta.yinyang).not.toBe(board2.meta.yinyang)
    })
  })
})
