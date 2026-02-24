import { describe, it, expect } from 'vitest'
import { BAGUAS, getBagua, compareBagua, BAGUA_LIST } from '../src/bagua'
import { Wuxing } from '../src/types'

describe('BAGUAS', () => {
  it('长度为 8', () => {
    expect(BAGUAS.length).toBe(8)
  })

  it('所有对象已冻结', () => {
    for (const bagua of BAGUAS) {
      expect(Object.isFrozen(bagua)).toBe(true)
    }
  })
})

describe('getBagua()', () => {
  it('getBagua(0) → 坎, wuxing=水(4)', () => {
    const b = getBagua(0)
    expect(b.name).toBe('坎')
    expect(b.wuxing).toBe(Wuxing.水)
    expect(b.index).toBe(0)
  })

  it('getBagua("坎") → index 0', () => {
    const b = getBagua('坎')
    expect(b.index).toBe(0)
  })

  it('getBagua("乾") → index 4, wuxing=金(3)', () => {
    const b = getBagua('乾')
    expect(b.index).toBe(4)
    expect(b.wuxing).toBe(Wuxing.金)
  })

  it('getBagua("离") → index 7, wuxing=火(1)', () => {
    const b = getBagua('离')
    expect(b.index).toBe(7)
    expect(b.wuxing).toBe(Wuxing.火)
  })

  it('未知名称抛出错误', () => {
    expect(() => getBagua('未知')).toThrow('未知八卦: 未知')
  })
})

describe('compareBagua()', () => {
  it('相同八卦比较结果为 000', () => {
    const kan = getBagua('坎')
    expect(compareBagua(kan, kan)).toBe('000')
  })

  it('坎(010) 与 坤(000) 比较 → 010', () => {
    const kan = getBagua('坎') // gua: '010'
    const kun = getBagua('坤') // gua: '000'
    expect(compareBagua(kan, kun)).toBe('010')
  })

  it('乾(111) 与 坤(000) 比较 → 111', () => {
    const qian = getBagua('乾') // gua: '111'
    const kun = getBagua('坤')  // gua: '000'
    expect(compareBagua(qian, kun)).toBe('111')
  })
})

describe('BAGUA_LIST', () => {
  it('包含8个卦名', () => {
    expect(BAGUA_LIST.length).toBe(8)
    expect(BAGUA_LIST[0]).toBe('坎')
    expect(BAGUA_LIST[4]).toBe('乾')
    expect(BAGUA_LIST[7]).toBe('离')
  })
})
