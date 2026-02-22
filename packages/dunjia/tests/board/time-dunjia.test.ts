import { describe, expect, it } from 'vitest'
import { TimeDunjia } from '../../src/board/time-dunjia'

describe('board/time-dunjia', () => {
  const TEST_DATE = new Date(2026, 1, 22, 14, 0, 0)

  describe('timeDunjia.create', () => {
    it('应返回 TimeDunjia 实例', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      expect(board).toBeInstanceOf(TimeDunjia)
    })

    it('应有 9 个宫位', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      expect(board.palaces).toHaveLength(9)
    })

    it('meta.type 默认为 hour', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      expect(board.meta.type).toBe('hour')
    })

    it('meta.moveStarOffset 初始为 0', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      expect(board.meta.moveStarOffset).toBe(0)
    })

    it('meta 应包含完整字段', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      expect(board.meta.datetime).toBeInstanceOf(Date)
      expect(['阴', '阳']).toContain(board.meta.yinyang)
      expect(board.meta.juNumber).toBeGreaterThanOrEqual(1)
      expect(board.meta.juNumber).toBeLessThanOrEqual(9)
      expect(board.meta.xunHead).toBeTruthy()
      expect(board.meta.ganZhi).toHaveLength(2)
    })
  })

  describe('不可变性', () => {
    it('moveStar 返回新实例，原实例不变', () => {
      const original = TimeDunjia.create({ datetime: TEST_DATE })
      const originalPalaces = original.palaces
      const originalMeta = original.meta

      const moved = original.moveStar(1)

      // 新实例
      expect(moved).not.toBe(original)
      // 原实例不变
      expect(original.palaces).toBe(originalPalaces)
      expect(original.meta).toBe(originalMeta)
      expect(original.meta.moveStarOffset).toBe(0)
      // 新实例偏移更新
      expect(moved.meta.moveStarOffset).toBe(1)
    })

    it('meta 和 palaces 应为冻结对象', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      expect(Object.isFrozen(board.meta)).toBe(true)
      expect(Object.isFrozen(board.palaces)).toBe(true)
    })
  })

  describe('序列化', () => {
    it('toJSON 返回完整盘面数据', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const json = board.toJSON()

      expect(json.meta).toBeDefined()
      expect(json.palaces).toHaveLength(9)
      expect(json.meta.type).toBe('hour')
    })

    it('toJSON → from → toJSON 循环应一致', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const json1 = board.toJSON()

      const restored = TimeDunjia.from(json1)
      const json2 = restored.toJSON()

      // 比较 meta（datetime 需要特殊处理）
      expect(json2.meta.type).toBe(json1.meta.type)
      expect(json2.meta.yinyang).toBe(json1.meta.yinyang)
      expect(json2.meta.juNumber).toBe(json1.meta.juNumber)
      expect(json2.meta.xunHead).toBe(json1.meta.xunHead)
      expect(json2.meta.ganZhi).toBe(json1.meta.ganZhi)
      expect(json2.meta.moveStarOffset).toBe(json1.meta.moveStarOffset)

      // 比较 palaces（逐宫比较核心字段）
      for (let i = 0; i < 9; i++) {
        expect(json2.palaces[i].groundGan).toBe(json1.palaces[i].groundGan)
        expect(json2.palaces[i].skyGan).toBe(json1.palaces[i].skyGan)
        expect(json2.palaces[i].star?.name).toBe(json1.palaces[i].star?.name)
        expect(json2.palaces[i].door?.name).toBe(json1.palaces[i].door?.name)
        expect(json2.palaces[i].god?.name).toBe(json1.palaces[i].god?.name)
      }
    })

    it('from 恢复的实例应为有效 TimeDunjia', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const json = board.toJSON()
      const restored = TimeDunjia.from(json)

      expect(restored).toBeInstanceOf(TimeDunjia)
      expect(restored.palaces).toHaveLength(9)
      expect(Object.isFrozen(restored.meta)).toBe(true)
      expect(Object.isFrozen(restored.palaces)).toBe(true)
    })
  })

  describe('链式调用', () => {
    it('moveStar 可链式调用', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const result = board.moveStar(1).moveStar(2)

      expect(result).toBeInstanceOf(TimeDunjia)
      expect(result.meta.moveStarOffset).toBe(2)
      expect(result.palaces).toHaveLength(9)
    })
  })

  describe('palace 查询', () => {
    it('palace(0) 应返回巽宫', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const p = board.palace(0)

      expect(p.name).toBe('巽')
      expect(p.index).toBe(0)
    })

    it('palace(0) 应有非空 groundGan', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const p = board.palace(0)

      expect(p.groundGan).toBeTruthy()
    })
  })

  describe('applyOuterGod', () => {
    it('应返回带新外圈神煞层的新实例', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const mockPlugin = {
        name: '测试神煞',
        scope: ['time'] as ('time' | 'pos')[],
        apply: () => ({
          name: '测试神煞',
          data: { 0: { name: '测试' } },
        }),
      }

      const result = board.applyOuterGod(mockPlugin)

      expect(result).not.toBe(board)
      expect(result.palaces[0].outerGods).toHaveLength(1)
      expect(result.palaces[0].outerGods[0].name).toBe('测试神煞')
      // 原实例不变
      expect(board.palaces[0].outerGods).toHaveLength(0)
    })

    it('applyOuterGods 批量应用多个插件', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const plugins = [
        {
          name: '插件A',
          scope: ['time'] as ('time' | 'pos')[],
          apply: () => ({ name: '插件A', data: {} }),
        },
        {
          name: '插件B',
          scope: ['time'] as ('time' | 'pos')[],
          apply: () => ({ name: '插件B', data: {} }),
        },
      ]

      const result = board.applyOuterGods(plugins)

      expect(result.palaces[0].outerGods).toHaveLength(2)
      expect(result.palaces[0].outerGods[0].name).toBe('插件A')
      expect(result.palaces[0].outerGods[1].name).toBe('插件B')
    })
  })
})
