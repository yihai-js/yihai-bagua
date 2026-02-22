import { describe, expect, it } from 'vitest'
import { getXun, getXunFromGanZhiIndex, LIUYI_LIST, XUN_LIST } from '../../src/base/xun'

describe('xun', () => {
  it('六旬列表长度为 6', () => {
    expect(XUN_LIST).toHaveLength(6)
  })
  it('甲子旬', () => {
    const xun = getXun(0)
    expect(xun.name).toBe('甲子')
    expect(xun.head).toBe('戊')
    expect(xun.index).toBe(0)
  })
  it('甲戌旬', () => {
    const xun = getXun(1)
    expect(xun.name).toBe('甲戌')
    expect(xun.head).toBe('己')
  })
  it('六仪列表正确', () => {
    expect(LIUYI_LIST).toEqual(['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'])
  })
  it('从六十甲子索引推算旬', () => {
    expect(getXunFromGanZhiIndex(0).index).toBe(0)
    expect(getXunFromGanZhiIndex(10).index).toBe(1)
    expect(getXunFromGanZhiIndex(50).index).toBe(5)
  })
})
