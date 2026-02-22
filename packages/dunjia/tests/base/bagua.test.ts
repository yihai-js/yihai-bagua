import { describe, expect, it } from 'vitest'
import { BAGUA_LIST, compareBagua, getBagua, Wuxing } from '../../src/base'

describe('bagua', () => {
  it('后天八卦列表长度为 8', () => {
    expect(BAGUA_LIST).toHaveLength(8)
  })
  it('坎卦属性正确', () => {
    const kan = getBagua(0)
    expect(kan.name).toBe('坎')
    expect(kan.wuxing).toBe(Wuxing.水)
  })
  it('通过名称查找八卦', () => {
    const li = getBagua('离')
    expect(li.index).toBe(7)
    expect(li.wuxing).toBe(Wuxing.火)
  })
  it('卦象比较', () => {
    const kan = getBagua('坎')
    const li = getBagua('离')
    expect(compareBagua(kan, li)).toBe('111')
  })
})
