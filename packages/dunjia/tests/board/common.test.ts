import { describe, expect, it } from 'vitest'
import { CENTER_PALACE, EXTRA_PALACE } from '../../src/base/nine-palace'
import { LIUYI_LIST } from '../../src/base/xun'
import {
  buildBoard,
  createEmptyPalaceData,
  initDoors,
  initGods,
  initGroundGan,
  initOutGan,
  initSkyGan,
  initStars,
  resolveMeta,
} from '../../src/board/common'

describe('board/common', () => {
  describe('createEmptyPalaceData', () => {
    it('应创建 9 个空宫位', () => {
      const palaces = createEmptyPalaceData()
      expect(palaces).toHaveLength(9)
    })

    it('每个宫位应有正确的索引和后天宫位数', () => {
      const palaces = createEmptyPalaceData()
      const expectedPositions = [4, 9, 2, 3, 5, 7, 8, 1, 6]
      palaces.forEach((p, i) => {
        expect(p.index).toBe(i)
        expect(p.position).toBe(expectedPositions[i])
      })
    })

    it('中宫名称为"中"', () => {
      const palaces = createEmptyPalaceData()
      expect(palaces[CENTER_PALACE].name).toBe('中')
    })

    it('初始地盘天干为空字符串', () => {
      const palaces = createEmptyPalaceData()
      palaces.forEach((p) => {
        expect(p.groundGan).toBe('')
        expect(p.skyGan).toBe('')
      })
    })
  })

  describe('resolveMeta', () => {
    it('应返回有效的元数据', () => {
      // 2024-02-10 14:00 (甲辰年丙寅月甲子日辛未时)
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })

      expect(meta.type).toBe('hour')
      expect(meta.datetime).toBeInstanceOf(Date)
      expect(['阴', '阳']).toContain(meta.yinyang)
      expect(meta.juNumber).toBeGreaterThanOrEqual(1)
      expect(meta.juNumber).toBeLessThanOrEqual(9)
      expect(meta.xunHead).toBeTruthy()
      expect(meta.xunHeadGan).toBeTruthy()
      expect(meta.ganZhi).toHaveLength(2)
      expect(meta.solarTerm).toBeTruthy()
      expect(meta.moveStarOffset).toBe(0)
    })

    it('冬至后应为阳遁', () => {
      // 2024-01-15，冬至之后夏至之前
      const meta = resolveMeta({
        datetime: new Date(2024, 0, 15, 10, 0, 0),
      })
      expect(meta.yinyang).toBe('阳')
    })

    it('夏至后应为阴遁', () => {
      // 2024-07-15，夏至之后冬至之前
      const meta = resolveMeta({
        datetime: new Date(2024, 6, 15, 10, 0, 0),
      })
      expect(meta.yinyang).toBe('阴')
    })

    it('局数范围在 1-9 之间', () => {
      // 测试多个日期
      const dates = [
        new Date(2024, 0, 1, 10, 0, 0),
        new Date(2024, 3, 15, 8, 0, 0),
        new Date(2024, 6, 20, 14, 0, 0),
        new Date(2024, 9, 5, 22, 0, 0),
      ]
      for (const dt of dates) {
        const meta = resolveMeta({ datetime: dt })
        expect(meta.juNumber).toBeGreaterThanOrEqual(1)
        expect(meta.juNumber).toBeLessThanOrEqual(9)
      }
    })
  })

  describe('initGroundGan', () => {
    it('应为外8宫设置地盘天干', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const result = initGroundGan(palaces, meta)

      // 外 8 宫应都有地盘天干
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        expect(result.palaces[i].groundGan).toBeTruthy()
        expect(LIUYI_LIST).toContain(result.palaces[i].groundGan)
      }
    })

    it('中宫地盘天干应为空', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const result = initGroundGan(palaces, meta)
      expect(result.palaces[CENTER_PALACE].groundGan).toBe('')
    })

    it('坤宫应有寄宫天干', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const result = initGroundGan(palaces, meta)
      expect(result.palaces[EXTRA_PALACE].groundExtraGan).toBeTruthy()
    })

    it('地盘三奇六仪应都出现', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const result = initGroundGan(palaces, meta)

      // 收集所有地盘干（含坤宫寄宫）
      const allGan: string[] = []
      for (let i = 0; i < 9; i++) {
        if (result.palaces[i].groundGan) {
          allGan.push(result.palaces[i].groundGan)
        }
        if (result.palaces[i].groundExtraGan) {
          allGan.push(result.palaces[i].groundExtraGan!)
        }
      }
      // 9 个六仪三奇应该全部出现
      expect(allGan).toHaveLength(9)
      for (const liuyi of LIUYI_LIST) {
        expect(allGan).toContain(liuyi)
      }
    })
  })

  describe('initSkyGan', () => {
    it('应为外8宫设置天盘天干', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const ground = initGroundGan(palaces, meta)
      const skyPalaces = initSkyGan(
        ground.palaces,
        ground.headStarIndex,
        ground.xunHeadGroundIndex,
      )

      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        expect(skyPalaces[i].skyGan).toBeTruthy()
        expect(LIUYI_LIST).toContain(skyPalaces[i].skyGan)
      }
    })
  })

  describe('initGods', () => {
    it('应为外8宫设置八神', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const ground = initGroundGan(palaces, meta)
      const sky = initSkyGan(
        ground.palaces,
        ground.headStarIndex,
        ground.xunHeadGroundIndex,
      )
      const godPalaces = initGods(sky, meta, ground.headStarIndex)

      const godNames: string[] = []
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        expect(godPalaces[i].god).not.toBeNull()
        godNames.push(godPalaces[i].god!.name)
      }
      // 8 个不同的神
      expect(new Set(godNames).size).toBe(8)
    })
  })

  describe('initStars', () => {
    it('应为外8宫设置九星', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const ground = initGroundGan(palaces, meta)
      const sky = initSkyGan(
        ground.palaces,
        ground.headStarIndex,
        ground.xunHeadGroundIndex,
      )
      const starPalaces = initStars(
        sky,
        ground.headStarIndex,
        ground.headStarDoorStarIndex,
        ground.isSpecialStar,
      )

      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        expect(starPalaces[i].star).not.toBeNull()
        expect(starPalaces[i].star!.name).toBeTruthy()
      }
    })
  })

  describe('initDoors', () => {
    it('应为外8宫设置八门', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const ground = initGroundGan(palaces, meta)
      const sky = initSkyGan(
        ground.palaces,
        ground.headStarIndex,
        ground.xunHeadGroundIndex,
      )
      const doorResult = initDoors(
        sky,
        meta,
        ground.headStarDoorDoorIndex,
        ground.isSpecialStar,
      )

      const doorNames: string[] = []
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        expect(doorResult.palaces[i].door).not.toBeNull()
        doorNames.push(doorResult.palaces[i].door!.name)
      }
      // 8 个不同的门
      expect(new Set(doorNames).size).toBe(8)
    })
  })

  describe('initOutGan', () => {
    it('应为外8宫设置隐干', () => {
      const palaces = createEmptyPalaceData()
      const meta = resolveMeta({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const ground = initGroundGan(palaces, meta)
      const sky = initSkyGan(
        ground.palaces,
        ground.headStarIndex,
        ground.xunHeadGroundIndex,
      )
      const gods = initGods(sky, meta, ground.headStarIndex)
      const stars = initStars(
        gods,
        ground.headStarIndex,
        ground.headStarDoorStarIndex,
        ground.isSpecialStar,
      )
      const doorResult = initDoors(
        stars,
        meta,
        ground.headStarDoorDoorIndex,
        ground.isSpecialStar,
      )
      const outGanPalaces = initOutGan(
        doorResult.palaces,
        meta,
        ground.headStarIndex,
        doorResult.headDoorIndex,
      )

      // 至少外8宫中应有隐干
      let outGanCount = 0
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        if (outGanPalaces[i].outGan) {
          outGanCount++
        }
      }
      expect(outGanCount).toBe(8)
    })
  })

  describe('buildBoard', () => {
    it('应完整排盘', () => {
      const { palaces, meta } = buildBoard({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })

      expect(palaces).toHaveLength(9)
      expect(meta).toBeTruthy()

      // 外8宫应全部填充
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE) {
          // 中宫应为空
          expect(palaces[i].groundGan).toBe('')
          expect(palaces[i].star).toBeNull()
          expect(palaces[i].door).toBeNull()
          expect(palaces[i].god).toBeNull()
          continue
        }
        expect(palaces[i].groundGan).toBeTruthy()
        expect(palaces[i].skyGan).toBeTruthy()
        expect(palaces[i].star).not.toBeNull()
        expect(palaces[i].door).not.toBeNull()
        expect(palaces[i].god).not.toBeNull()
      }
    })

    it('不同时间应产生不同排盘', () => {
      const board1 = buildBoard({
        datetime: new Date(2024, 0, 1, 8, 0, 0),
      })
      const board2 = buildBoard({
        datetime: new Date(2024, 6, 15, 14, 0, 0),
      })

      // 至少阴阳应不同
      expect(board1.meta.yinyang).not.toBe(board2.meta.yinyang)
    })

    it('应返回不可变的宫位数据', () => {
      const board1 = buildBoard({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })
      const board2 = buildBoard({
        datetime: new Date(2024, 1, 10, 14, 0, 0),
      })

      // 两次调用的数据应相等但不是同一引用
      expect(board1.palaces).toEqual(board2.palaces)
      expect(board1.palaces).not.toBe(board2.palaces)
    })
  })
})
