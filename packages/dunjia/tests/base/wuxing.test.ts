import { describe, expect, it } from 'vitest'
import { getWuxingRelation, Wuxing } from '../../src/base/wuxing'

describe('wuxing', () => {
  it('相生关系：木生火', () => {
    expect(getWuxingRelation(Wuxing.木, Wuxing.火)).toBe('生')
  })
  it('被生关系：火被木生', () => {
    expect(getWuxingRelation(Wuxing.火, Wuxing.木)).toBe('泄')
  })
  it('相克关系：木克土', () => {
    expect(getWuxingRelation(Wuxing.木, Wuxing.土)).toBe('克')
  })
  it('被克关系：土被木克', () => {
    expect(getWuxingRelation(Wuxing.土, Wuxing.木)).toBe('耗')
  })
  it('同类关系：木比木', () => {
    expect(getWuxingRelation(Wuxing.木, Wuxing.木)).toBe('比')
  })
  it('全部 25 种组合都有结果', () => {
    const values = [Wuxing.木, Wuxing.火, Wuxing.土, Wuxing.金, Wuxing.水]
    for (const a of values) {
      for (const b of values) {
        const r = getWuxingRelation(a, b)
        expect(['生', '克', '泄', '耗', '比']).toContain(r)
      }
    }
  })
})
