import { describe, expect, it } from 'vitest'
import { PosDunjia } from '../../src/board/pos-dunjia'
import { getOppositeMountain } from '../../src/mountain/mountain'

describe('board/pos-dunjia', () => {
  const TEST_DATE = new Date(2026, 1, 22, 14, 0, 0)
  const TEST_ANGLE = 180 // 丙山（向南）

  describe('posDunjia.create', () => {
    it('应返回 PosDunjia 实例', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board).toBeInstanceOf(PosDunjia)
    })

    it('应有 9 个宫位', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board.palaces).toHaveLength(9)
    })

    it('应包含 mountain 和 direction 信息', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board.mountain).toBeDefined()
      expect(board.mountain.name).toBeTruthy()
      expect(board.direction).toBeDefined()
      expect(board.direction.name).toBeTruthy()
    })

    it('mountain 和 direction 应为对面关系', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board.mountain.index).toBe(getOppositeMountain(board.direction.index))
      expect(board.direction.index).toBe(getOppositeMountain(board.mountain.index))
    })

    it('应包含 numData', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board.numData).toBeDefined()
      expect(typeof board.numData.isSolar).toBe('boolean')
      expect(board.numData.num).toBeGreaterThanOrEqual(1)
      expect(board.numData.num).toBeLessThanOrEqual(9)
    })

    it('默认 trans 为正盘', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board.trans).toBe('正盘')
    })

    it('meta 应包含完整字段', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board.meta.datetime).toBeInstanceOf(Date)
      expect(['阴', '阳']).toContain(board.meta.yinyang)
      expect(board.meta.juNumber).toBeGreaterThanOrEqual(1)
      expect(board.meta.juNumber).toBeLessThanOrEqual(9)
      expect(board.meta.xunHead).toBeTruthy()
      expect(board.meta.ganZhi).toHaveLength(2)
    })

    it('meta.type 默认为 year', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board.meta.type).toBe('year')
    })

    it('meta.moveStarOffset 初始为 0', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(board.meta.moveStarOffset).toBe(0)
    })
  })

  describe('不同角度', () => {
    it('不同角度应产生不同的山向', () => {
      const board1 = PosDunjia.create({ datetime: TEST_DATE, angle: 0 })
      const board2 = PosDunjia.create({ datetime: TEST_DATE, angle: 90 })
      expect(board1.direction.name).not.toBe(board2.direction.name)
      expect(board1.mountain.name).not.toBe(board2.mountain.name)
    })

    it('对面角度应互换山向', () => {
      const board1 = PosDunjia.create({ datetime: TEST_DATE, angle: 0 })
      const board2 = PosDunjia.create({ datetime: TEST_DATE, angle: 180 })
      expect(board1.direction.name).toBe(board2.mountain.name)
      expect(board1.mountain.name).toBe(board2.direction.name)
    })
  })

  describe('变盘方式', () => {
    it('正盘使用原始阴阳和局数', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, trans: '正盘' })
      expect(board.trans).toBe('正盘')
      // numData 的 isSolar 决定正盘阴阳
      const expectedYinYang = board.numData.isSolar ? '阳' : '阴'
      expect(board.meta.yinyang).toBe(expectedYinYang)
    })

    it('归一翻转阴阳，局数 + 原始局数 = 9（或特殊情况）', () => {
      const zhengpan = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, trans: '正盘' })
      const guiyi = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, trans: '归一' })

      // 阴阳翻转
      expect(guiyi.meta.yinyang).not.toBe(zhengpan.meta.yinyang)

      // 归一局数规则：9 - 原始局数（为 0 时取 9）
      const originalNum = zhengpan.numData.num
      const expectedNum = 9 - originalNum <= 0 ? 9 : 9 - originalNum
      expect(guiyi.meta.juNumber).toBe(expectedNum)
    })

    it('合十翻转阴阳，局数 + 原始局数 = 10', () => {
      const zhengpan = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, trans: '正盘' })
      const heshi = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, trans: '合十' })

      // 阴阳翻转
      expect(heshi.meta.yinyang).not.toBe(zhengpan.meta.yinyang)

      // 合十局数规则
      const originalNum = zhengpan.numData.num
      expect(heshi.meta.juNumber).toBe(10 - originalNum)
    })

    it('反转翻转阴阳，局数不变', () => {
      const zhengpan = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, trans: '正盘' })
      const fanzhuan = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, trans: '反转' })

      // 阴阳翻转
      expect(fanzhuan.meta.yinyang).not.toBe(zhengpan.meta.yinyang)

      // 局数相同
      expect(fanzhuan.meta.juNumber).toBe(zhengpan.numData.num)
    })
  })

  describe('不可变性', () => {
    it('meta 和 palaces 应为冻结对象', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(Object.isFrozen(board.meta)).toBe(true)
      expect(Object.isFrozen(board.palaces)).toBe(true)
    })

    it('mountain 和 direction 应为冻结对象', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(Object.isFrozen(board.mountain)).toBe(true)
      expect(Object.isFrozen(board.direction)).toBe(true)
    })

    it('numData 应为冻结对象', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      expect(Object.isFrozen(board.numData)).toBe(true)
    })

    it('moveStar 返回新实例，原实例不变', () => {
      const original = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      const originalMeta = original.meta
      const originalPalaces = original.palaces

      const moved = original.moveStar(1)

      expect(moved).not.toBe(original)
      expect(original.palaces).toBe(originalPalaces)
      expect(original.meta).toBe(originalMeta)
      expect(original.meta.moveStarOffset).toBe(0)
      expect(moved.meta.moveStarOffset).toBe(1)
    })
  })

  describe('九宫结构', () => {
    it('外八宫应有非空 groundGan', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      for (let i = 0; i < 9; i++) {
        if (i === 4)
          continue // 中宫
        expect(board.palaces[i].groundGan).toBeTruthy()
      }
    })

    it('中宫（索引 4）应为空', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      const center = board.palaces[4]
      expect(center.groundGan).toBe('')
      expect(center.skyGan).toBe('')
      expect(center.star).toBeNull()
      expect(center.door).toBeNull()
      expect(center.god).toBeNull()
    })

    it('外八宫应有 star、door、god', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      for (let i = 0; i < 9; i++) {
        if (i === 4)
          continue
        expect(board.palaces[i].star).not.toBeNull()
        expect(board.palaces[i].door).not.toBeNull()
        expect(board.palaces[i].god).not.toBeNull()
      }
    })
  })

  describe('palace 查询', () => {
    it('palace(0) 应返回巽宫', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      const p = board.palace(0)
      expect(p.name).toBe('巽')
      expect(p.index).toBe(0)
    })
  })

  describe('序列化', () => {
    it('toJSON 返回完整盘面数据', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      const json = board.toJSON()

      expect(json.meta).toBeDefined()
      expect(json.palaces).toHaveLength(9)
      expect(json.mountain).toBeDefined()
      expect(json.direction).toBeDefined()
      expect(json.trans).toBe('正盘')
      expect(json.numData).toBeDefined()
    })

    it('toJSON -> from -> toJSON 循环应一致', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      const json1 = board.toJSON()

      const restored = PosDunjia.from(json1)
      const json2 = restored.toJSON()

      expect(json2.meta.type).toBe(json1.meta.type)
      expect(json2.meta.yinyang).toBe(json1.meta.yinyang)
      expect(json2.meta.juNumber).toBe(json1.meta.juNumber)
      expect(json2.mountain.name).toBe(json1.mountain.name)
      expect(json2.direction.name).toBe(json1.direction.name)
      expect(json2.trans).toBe(json1.trans)
      expect(json2.numData.num).toBe(json1.numData.num)

      for (let i = 0; i < 9; i++) {
        expect(json2.palaces[i].groundGan).toBe(json1.palaces[i].groundGan)
        expect(json2.palaces[i].skyGan).toBe(json1.palaces[i].skyGan)
        expect(json2.palaces[i].star?.name).toBe(json1.palaces[i].star?.name)
        expect(json2.palaces[i].door?.name).toBe(json1.palaces[i].door?.name)
        expect(json2.palaces[i].god?.name).toBe(json1.palaces[i].god?.name)
      }
    })
  })

  describe('posType 选项', () => {
    it('posType month 应使用 month 类型', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, posType: 'month' })
      expect(board.meta.type).toBe('month')
    })

    it('posType day 应使用 day 类型', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, posType: 'day' })
      expect(board.meta.type).toBe('day')
    })

    it('posType dragon 应映射为 year 类型', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE, posType: 'dragon' })
      expect(board.meta.type).toBe('year')
    })
  })

  describe('applyOuterGod', () => {
    it('应返回带新外圈神煞层的新实例', () => {
      const board = PosDunjia.create({ datetime: TEST_DATE, angle: TEST_ANGLE })
      const mockPlugin = {
        name: '测试神煞',
        scope: ['pos'] as ('time' | 'pos')[],
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
  })
})
