import { describe, expect, it } from 'vitest'
import {
  getMountainDetailFromAngle,
  getMountainIndexFromAngle,
  getMountainInfo,
  getNumData,
  getOppositeAngle,
  getOppositeMountain,
  getZhiMountain,
  MOUNTAIN_NAJIA,
  MOUNTAIN_NAMES,
  MOUNTAIN_WUXING,
  MOUNTAIN_YINYANG,
} from '../../src/mountain/mountain'

describe('mountain/mountain', () => {
  describe('数据完整性', () => {
    it('mOUNTAIN_NAMES 应有 24 个条目', () => {
      expect(MOUNTAIN_NAMES).toHaveLength(24)
    })

    it('mOUNTAIN_WUXING 应有 24 个条目', () => {
      expect(MOUNTAIN_WUXING).toHaveLength(24)
    })

    it('mOUNTAIN_YINYANG 应有 24 个条目', () => {
      expect(MOUNTAIN_YINYANG).toHaveLength(24)
    })

    it('mOUNTAIN_NAJIA 应有 24 个条目', () => {
      expect(MOUNTAIN_NAJIA).toHaveLength(24)
    })

    it('mOUNTAIN_WUXING 值范围为 0-4', () => {
      for (const wx of MOUNTAIN_WUXING) {
        expect(wx).toBeGreaterThanOrEqual(0)
        expect(wx).toBeLessThanOrEqual(4)
      }
    })

    it('mOUNTAIN_YINYANG 值为 0 或 1', () => {
      for (const yy of MOUNTAIN_YINYANG) {
        expect([0, 1]).toContain(yy)
      }
    })
  })

  describe('getMountainIndexFromAngle', () => {
    it('0 度 -> 索引 0（癸）', () => {
      expect(getMountainIndexFromAngle(0)).toBe(0)
    })

    it('15 度 -> 索引 1（丑）', () => {
      expect(getMountainIndexFromAngle(15)).toBe(1)
    })

    it('352.5 度 -> 索引 23（子）', () => {
      expect(getMountainIndexFromAngle(352.5)).toBe(23)
    })

    it('14.9 度 -> 索引 0（癸）', () => {
      expect(getMountainIndexFromAngle(14.9)).toBe(0)
    })

    it('359.9 度 -> 索引 23（子）', () => {
      expect(getMountainIndexFromAngle(359.9)).toBe(23)
    })

    it('负角度应正确处理', () => {
      expect(getMountainIndexFromAngle(-15)).toBe(23)
    })

    it('超过 360 度应取模', () => {
      expect(getMountainIndexFromAngle(375)).toBe(1)
    })
  })

  describe('getMountainInfo', () => {
    it('索引 0 应返回癸山信息', () => {
      const info = getMountainInfo(0)
      expect(info.index).toBe(0)
      expect(info.name).toBe('癸')
      expect(info.angle).toBe(0)
      expect(info.yinyang).toBe(1)
      expect(info.najia).toBe('坎')
    })

    it('索引 5 应返回卯山信息', () => {
      const info = getMountainInfo(5)
      expect(info.index).toBe(5)
      expect(info.name).toBe('卯')
      expect(info.angle).toBe(75)
    })

    it('索引 11 应返回午山信息', () => {
      const info = getMountainInfo(11)
      expect(info.index).toBe(11)
      expect(info.name).toBe('午')
      expect(info.angle).toBe(165)
    })
  })

  describe('getMountainDetailFromAngle', () => {
    it('human 盘无偏移', () => {
      const detail = getMountainDetailFromAngle(10, 'human')
      expect(detail.index).toBe(0) // 0-15 度为癸
      expect(detail.start).toBe(0)
      expect(detail.end).toBeCloseTo(14.99, 1)
    })

    it('ground 盘偏移 7.5 度', () => {
      const detail = getMountainDetailFromAngle(10, 'ground')
      // 10 - 7.5 = 2.5, 在 0-15 范围内
      expect(detail.index).toBe(0)
      expect(detail.start).toBe(7.5)
      expect(detail.end).toBeCloseTo(22.49, 1)
    })

    it('sky 盘偏移 15 度', () => {
      const detail = getMountainDetailFromAngle(20, 'sky')
      // 20 - 15 = 5, 在 0-15 范围内
      expect(detail.index).toBe(0)
      expect(detail.start).toBe(15)
      expect(detail.end).toBeCloseTo(29.99, 1)
    })

    it('默认为 human 盘', () => {
      const detail = getMountainDetailFromAngle(10)
      expect(detail.index).toBe(0)
      expect(detail.start).toBe(0)
    })

    it('不同盘类型对同一角度可能返回不同山向', () => {
      // 8 度在 human 盘为索引 0，但在 ground 盘中 8-7.5=0.5 也是索引 0
      // 用 7 度测试：human 为 0，ground 中 7-7.5=-0.5 -> 359.5 为索引 23
      const humanDetail = getMountainDetailFromAngle(7, 'human')
      const groundDetail = getMountainDetailFromAngle(7, 'ground')
      expect(humanDetail.index).toBe(0)
      expect(groundDetail.index).toBe(23) // 359.5 / 15 = 23
    })
  })

  describe('getOppositeAngle', () => {
    it('0 度 -> 180 度', () => {
      expect(getOppositeAngle(0)).toBe(180)
    })

    it('90 度 -> 270 度', () => {
      expect(getOppositeAngle(90)).toBe(270)
    })

    it('180 度 -> 0 度', () => {
      expect(getOppositeAngle(180)).toBe(0)
    })

    it('270 度 -> 90 度', () => {
      expect(getOppositeAngle(270)).toBe(90)
    })
  })

  describe('getOppositeMountain', () => {
    it('索引 0 -> 索引 12', () => {
      expect(getOppositeMountain(0)).toBe(12)
    })

    it('索引 6 -> 索引 18', () => {
      expect(getOppositeMountain(6)).toBe(18)
    })

    it('索引 12 -> 索引 0', () => {
      expect(getOppositeMountain(12)).toBe(0)
    })

    it('索引 23 -> 索引 11', () => {
      expect(getOppositeMountain(23)).toBe(11)
    })

    it('对面的对面应回到原处', () => {
      for (let i = 0; i < 24; i++) {
        expect(getOppositeMountain(getOppositeMountain(i))).toBe(i)
      }
    })
  })

  describe('getZhiMountain', () => {
    it('偶数索引返回下一个（奇数索引）的山名', () => {
      expect(getZhiMountain(0)).toBe('丑') // index 1
      expect(getZhiMountain(2)).toBe('寅') // index 3
    })

    it('奇数索引返回自身的山名', () => {
      expect(getZhiMountain(1)).toBe('丑') // index 1
      expect(getZhiMountain(3)).toBe('寅') // index 3
    })
  })

  describe('getNumData', () => {
    it('应返回有效的 isSolar 布尔值', () => {
      const humanMtn = getMountainDetailFromAngle(0, 'human')
      const result = getNumData(0, humanMtn)
      expect(typeof result.isSolar).toBe('boolean')
    })

    it('局数应在 1-9 范围内', () => {
      // 测试多个角度
      for (let angle = 0; angle < 360; angle += 15) {
        const humanMtn = getMountainDetailFromAngle(angle, 'human')
        const result = getNumData(angle, humanMtn)
        expect(result.num).toBeGreaterThanOrEqual(1)
        expect(result.num).toBeLessThanOrEqual(9)
      }
    })

    it('numOffset 应为非负整数', () => {
      const humanMtn = getMountainDetailFromAngle(0, 'human')
      const result = getNumData(0, humanMtn)
      expect(result.numOffset).toBeGreaterThanOrEqual(0)
    })

    it('巳(9)到乾(20)为阴遁', () => {
      // 巳山起始角度为 9*15=135
      const humanMtn = getMountainDetailFromAngle(135, 'human')
      expect(humanMtn.index).toBe(9)
      const result = getNumData(135, humanMtn)
      expect(result.isSolar).toBe(false)
    })

    it('癸(0)为阳遁', () => {
      const humanMtn = getMountainDetailFromAngle(0, 'human')
      expect(humanMtn.index).toBe(0)
      const result = getNumData(0, humanMtn)
      expect(result.isSolar).toBe(true)
    })
  })
})
