import { describe, expect, it } from 'vitest'
import { CENTER_PALACE } from '../../src/base/nine-palace'
import { applyMoveStar, buildBoard } from '../../src/board/common'
import { TimeDunjia } from '../../src/board/time-dunjia'

describe('board/move-star', () => {
  const TEST_DATE = new Date(2026, 1, 22, 14, 0, 0)

  function getBoard() {
    return buildBoard({ datetime: TEST_DATE })
  }

  describe('applyMoveStar', () => {
    it('偏移量为 0 时应返回相同状态', () => {
      const { palaces } = getBoard()
      const result = applyMoveStar(palaces, 0, 0)

      // 数据应与原始相同
      for (let i = 0; i < 9; i++) {
        expect(result[i].groundGan).toBe(palaces[i].groundGan)
        expect(result[i].skyGan).toBe(palaces[i].skyGan)
        expect(result[i].star?.name).toBe(palaces[i].star?.name)
        expect(result[i].door?.name).toBe(palaces[i].door?.name)
        expect(result[i].god?.name).toBe(palaces[i].god?.name)
      }
    })

    it('偏移量不为 0 时应旋转宫位数据', () => {
      const { palaces } = getBoard()
      const result = applyMoveStar(palaces, 1, 0)

      // 至少部分外宫数据应发生变化
      let changedCount = 0
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        if (result[i].groundGan !== palaces[i].groundGan)
          changedCount++
      }
      expect(changedCount).toBeGreaterThan(0)
    })

    it('应保持不可变性（原数组不变）', () => {
      const { palaces } = getBoard()
      const originalGan = palaces.map(p => p.groundGan)
      const originalStars = palaces.map(p => p.star?.name)

      applyMoveStar(palaces, 3, 0)

      // 原数组不应被修改
      for (let i = 0; i < 9; i++) {
        expect(palaces[i].groundGan).toBe(originalGan[i])
        expect(palaces[i].star?.name).toBe(originalStars[i])
      }
    })

    it('中宫数据不应被移动', () => {
      const { palaces } = getBoard()
      const result = applyMoveStar(palaces, 2, 0)

      // 中宫应保持空
      expect(result[CENTER_PALACE].groundGan).toBe('')
      expect(result[CENTER_PALACE].star).toBeNull()
      expect(result[CENTER_PALACE].door).toBeNull()
      expect(result[CENTER_PALACE].god).toBeNull()
    })

    it('移动后外 8 宫元素总集合应不变', () => {
      const { palaces } = getBoard()
      const result = applyMoveStar(palaces, 4, 0)

      // 收集原始和移动后的所有地盘干
      const originalGan = new Set<string>()
      const resultGan = new Set<string>()
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        if (palaces[i].groundGan)
          originalGan.add(palaces[i].groundGan)
        if (result[i].groundGan)
          resultGan.add(result[i].groundGan)
      }

      // 元素集合应相同（只是位置不同）
      expect(resultGan).toEqual(originalGan)
    })

    it('移动后外 8 宫星名集合应不变', () => {
      const { palaces } = getBoard()
      const result = applyMoveStar(palaces, 5, 0)

      const originalStars = new Set<string>()
      const resultStars = new Set<string>()
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        if (palaces[i].star)
          originalStars.add(palaces[i].star!.name)
        if (result[i].star)
          resultStars.add(result[i].star!.name)
      }

      expect(resultStars).toEqual(originalStars)
    })

    it('prevOffset 不为 0 时的增量移动', () => {
      const { palaces } = getBoard()

      // 先移 2 步
      const step1 = applyMoveStar(palaces, 2, 0)
      // 再移到 5（增量 3 步）
      const step2 = applyMoveStar(step1, 5, 2)

      // 等价于直接移 5 步
      const direct = applyMoveStar(palaces, 5, 0)

      for (let i = 0; i < 9; i++) {
        expect(step2[i].groundGan).toBe(direct[i].groundGan)
        expect(step2[i].skyGan).toBe(direct[i].skyGan)
        expect(step2[i].star?.name).toBe(direct[i].star?.name)
        expect(step2[i].door?.name).toBe(direct[i].door?.name)
        expect(step2[i].god?.name).toBe(direct[i].god?.name)
      }
    })

    it('prevOffset > newOffset 时的环绕移动', () => {
      const { palaces } = getBoard()

      // 先移 6 步
      const step1 = applyMoveStar(palaces, 6, 0)
      // 再移到 2（环绕：(2+8)-6=4 步）
      const step2 = applyMoveStar(step1, 2, 6)

      // 等价于直接从 0 移到 (6+4)%8=2，但由于非线性需要验证一致性
      // 这里验证移后的元素集合仍然完整
      const resultGan = new Set<string>()
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        if (step2[i].groundGan)
          resultGan.add(step2[i].groundGan)
      }

      const originalGan = new Set<string>()
      for (let i = 0; i < 9; i++) {
        if (i === CENTER_PALACE)
          continue
        if (palaces[i].groundGan)
          originalGan.add(palaces[i].groundGan)
      }

      expect(resultGan).toEqual(originalGan)
    })

    it('完整轮转（8步）应回到原始状态', () => {
      const { palaces } = getBoard()

      // 逐步移动 8 次，每次 1 步
      let current = palaces
      for (let i = 0; i < 8; i++) {
        current = applyMoveStar(current, (i + 1) % 8, i % 8)
      }

      // 移 8 步后应回到原始状态
      for (let i = 0; i < 9; i++) {
        expect(current[i].groundGan).toBe(palaces[i].groundGan)
        expect(current[i].skyGan).toBe(palaces[i].skyGan)
        expect(current[i].star?.name).toBe(palaces[i].star?.name)
        expect(current[i].door?.name).toBe(palaces[i].door?.name)
        expect(current[i].god?.name).toBe(palaces[i].god?.name)
      }
    })
  })

  describe('通过 TimeDunjia 的 moveStar', () => {
    it('timeDunjia.moveStar 应更新 moveStarOffset', () => {
      const board = TimeDunjia.create({ datetime: TEST_DATE })
      const moved = board.moveStar(3)

      expect(moved.meta.moveStarOffset).toBe(3)
      expect(board.meta.moveStarOffset).toBe(0)
    })
  })
})
