import { describe, it, expect } from 'vitest'
import { Wuxing } from '../src/types'
import { wuxingRelation, wuxingName } from '../src/wuxing'

describe('wuxingRelation - 全 25 组合覆盖', () => {
  const table = [
    // 木(0)
    { a: Wuxing.木, b: Wuxing.木, rel: '比' },
    { a: Wuxing.木, b: Wuxing.火, rel: '生' },
    { a: Wuxing.木, b: Wuxing.土, rel: '克' },
    { a: Wuxing.木, b: Wuxing.金, rel: '耗' },
    { a: Wuxing.木, b: Wuxing.水, rel: '泄' },
    // 火(1)
    { a: Wuxing.火, b: Wuxing.木, rel: '泄' },
    { a: Wuxing.火, b: Wuxing.火, rel: '比' },
    { a: Wuxing.火, b: Wuxing.土, rel: '生' },
    { a: Wuxing.火, b: Wuxing.金, rel: '克' },
    { a: Wuxing.火, b: Wuxing.水, rel: '耗' },
    // 土(2)
    { a: Wuxing.土, b: Wuxing.木, rel: '耗' },
    { a: Wuxing.土, b: Wuxing.火, rel: '泄' },
    { a: Wuxing.土, b: Wuxing.土, rel: '比' },
    { a: Wuxing.土, b: Wuxing.金, rel: '生' },
    { a: Wuxing.土, b: Wuxing.水, rel: '克' },
    // 金(3)
    { a: Wuxing.金, b: Wuxing.木, rel: '克' },
    { a: Wuxing.金, b: Wuxing.火, rel: '耗' },
    { a: Wuxing.金, b: Wuxing.土, rel: '泄' },
    { a: Wuxing.金, b: Wuxing.金, rel: '比' },
    { a: Wuxing.金, b: Wuxing.水, rel: '生' },
    // 水(4)
    { a: Wuxing.水, b: Wuxing.木, rel: '生' },
    { a: Wuxing.水, b: Wuxing.火, rel: '克' },
    { a: Wuxing.水, b: Wuxing.土, rel: '耗' },
    { a: Wuxing.水, b: Wuxing.金, rel: '泄' },
    { a: Wuxing.水, b: Wuxing.水, rel: '比' },
  ] as const

  table.forEach(({ a, b, rel }) => {
    it(`${Wuxing[a]}→${Wuxing[b]} = ${rel}`, () => {
      expect(wuxingRelation(a, b)).toBe(rel)
    })
  })
})

describe('wuxingRelation - 关键语义验证', () => {
  it('木生火', () => {
    expect(wuxingRelation(Wuxing.木, Wuxing.火)).toBe('生')
  })

  it('木克土', () => {
    expect(wuxingRelation(Wuxing.木, Wuxing.土)).toBe('克')
  })

  it('火泄木（火视角：木泄火→木对火是泄；木视角：火是木生的，即生；这里测火对木=泄）', () => {
    expect(wuxingRelation(Wuxing.火, Wuxing.木)).toBe('泄')
  })

  it('金耗木（金克木，对木而言金是耗）', () => {
    expect(wuxingRelation(Wuxing.木, Wuxing.金)).toBe('耗')
  })

  it('木比木', () => {
    expect(wuxingRelation(Wuxing.木, Wuxing.木)).toBe('比')
  })
})

describe('wuxingName', () => {
  it('0 → 木', () => {
    expect(wuxingName(Wuxing.木)).toBe('木')
  })

  it('4 → 水', () => {
    expect(wuxingName(Wuxing.水)).toBe('水')
  })
})
