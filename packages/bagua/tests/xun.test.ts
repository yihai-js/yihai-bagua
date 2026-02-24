import { describe, it, expect } from 'vitest'
import { XUNS, getXun, getXunFromGanZhiIndex, XUN_LIST, LIUYI_LIST } from '../src/xun'

describe('XUNS', () => {
  it('长度为 6', () => {
    expect(XUNS.length).toBe(6)
  })

  it('所有对象已冻结', () => {
    for (const xun of XUNS) {
      expect(Object.isFrozen(xun)).toBe(true)
    }
  })
})

describe('getXun()', () => {
  it('getXun(0) → { name: 甲子, head: 戊 }', () => {
    const xun = getXun(0)
    expect(xun.name).toBe('甲子')
    expect(xun.head).toBe('戊')
    expect(xun.index).toBe(0)
  })

  it('getXun(5) → { name: 甲寅, head: 癸 }', () => {
    const xun = getXun(5)
    expect(xun.name).toBe('甲寅')
    expect(xun.head).toBe('癸')
    expect(xun.index).toBe(5)
  })
})

describe('getXunFromGanZhiIndex()', () => {
  it('getXunFromGanZhiIndex(0) → index 0 (甲子旬)', () => {
    const xun = getXunFromGanZhiIndex(0)
    expect(xun.index).toBe(0)
    expect(xun.name).toBe('甲子')
  })

  it('getXunFromGanZhiIndex(10) → index 1 (甲戌旬)', () => {
    const xun = getXunFromGanZhiIndex(10)
    expect(xun.index).toBe(1)
    expect(xun.name).toBe('甲戌')
  })

  it('getXunFromGanZhiIndex(59) → index 5 (甲寅旬)', () => {
    const xun = getXunFromGanZhiIndex(59)
    expect(xun.index).toBe(5)
    expect(xun.name).toBe('甲寅')
  })
})

describe('XUN_LIST', () => {
  it('包含6个旬名', () => {
    expect(XUN_LIST.length).toBe(6)
    expect(XUN_LIST[0]).toBe('甲子')
    expect(XUN_LIST[5]).toBe('甲寅')
  })
})

describe('LIUYI_LIST', () => {
  it('包含9个六仪三奇', () => {
    expect(LIUYI_LIST.length).toBe(9)
    expect(LIUYI_LIST[0]).toBe('戊')
    expect(LIUYI_LIST[8]).toBe('乙')
  })
})
