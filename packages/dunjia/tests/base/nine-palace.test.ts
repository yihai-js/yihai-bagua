import { describe, expect, it } from 'vitest'
import {
  CENTER_PALACE,
  EXTRA_PALACE,
  fixedIndex,
  getIndexByAfterNum,
  getOffsetPalaceNum,
  PALACE_AFTER_NUMS,
  PALACE_BAGUA_NAMES,
  traverseByAfterNum,
  traverseByClock,
} from '../../src/base/nine-palace'

describe('nine-palace', () => {
  it('九宫八卦名列表', () => {
    expect(PALACE_BAGUA_NAMES).toEqual(['巽', '离', '坤', '震', null, '兑', '艮', '坎', '乾'])
  })
  it('后天宫位数列表', () => {
    expect(PALACE_AFTER_NUMS).toEqual([4, 9, 2, 3, 5, 7, 8, 1, 6])
  })
  it('中宫索引为 4', () => {
    expect(CENTER_PALACE).toBe(4)
  })
  it('寄宫索引为 2（坤二宫）', () => {
    expect(EXTRA_PALACE).toBe(2)
  })
  it('后天宫位数转索引', () => {
    expect(getIndexByAfterNum(1)).toBe(7)
    expect(getIndexByAfterNum(9)).toBe(1)
    expect(getIndexByAfterNum(5)).toBe(4)
  })
  it('中宫寄坤修正', () => {
    expect(fixedIndex(4)).toBe(2)
    expect(fixedIndex(3)).toBe(3)
  })
  it('后天宫位数偏移', () => {
    expect(getOffsetPalaceNum(1, 1)).toBe(2)
    expect(getOffsetPalaceNum(9, 1)).toBe(1)
    expect(getOffsetPalaceNum(1, -1)).toBe(9)
  })
  it('顺时针遍历 8 宫', () => {
    const visited: number[] = []
    traverseByClock(0, 8, (index) => {
      visited.push(index)
    })
    expect(visited).toHaveLength(8)
    expect(visited).not.toContain(4)
  })
  it('按后天宫位数遍历 9 宫', () => {
    const visited: number[] = []
    traverseByAfterNum(0, 9, (index) => {
      visited.push(index)
    })
    expect(visited).toHaveLength(9)
  })
})
