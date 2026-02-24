import { describe, it, expect } from 'vitest'
import { gan } from '../src/gan'
import { tenGod } from '../src/ten-god'

describe('tenGod - 以甲为日主的经典十神', () => {
  const jia = gan('甲') // 阳木

  it('甲对己 → 正财（我木克他土，阴阳异）', () => {
    const result = tenGod(jia, gan('己'))
    expect(result.name).toBe('正财')
    expect(result.shortName).toBe('财')
    expect(result.wuxingRel).toBe('克')
    expect(result.sameYinYang).toBe(false)
  })

  it('甲对戊 → 偏财（我木克他土，阴阳同）', () => {
    const result = tenGod(jia, gan('戊'))
    expect(result.name).toBe('偏财')
    expect(result.shortName).toBe('才')
    expect(result.wuxingRel).toBe('克')
    expect(result.sameYinYang).toBe(true)
  })

  it('甲对辛 → 正官（他金克我木，阴阳异）', () => {
    const result = tenGod(jia, gan('辛'))
    expect(result.name).toBe('正官')
    expect(result.shortName).toBe('官')
    expect(result.wuxingRel).toBe('耗')
    expect(result.sameYinYang).toBe(false)
  })

  it('甲对庚 → 七煞（他金克我木，阴阳同）', () => {
    const result = tenGod(jia, gan('庚'))
    expect(result.name).toBe('七煞')
    expect(result.shortName).toBe('杀')
    expect(result.wuxingRel).toBe('耗')
    expect(result.sameYinYang).toBe(true)
  })

  it('甲对丁 → 伤官（我木生他火，阴阳异）', () => {
    const result = tenGod(jia, gan('丁'))
    expect(result.name).toBe('伤官')
    expect(result.shortName).toBe('伤')
    expect(result.wuxingRel).toBe('生')
    expect(result.sameYinYang).toBe(false)
  })

  it('甲对丙 → 食神（我木生他火，阴阳同）', () => {
    const result = tenGod(jia, gan('丙'))
    expect(result.name).toBe('食神')
    expect(result.shortName).toBe('食')
    expect(result.wuxingRel).toBe('生')
    expect(result.sameYinYang).toBe(true)
  })

  it('甲对癸 → 正印（他水生我木，阴阳异）', () => {
    const result = tenGod(jia, gan('癸'))
    expect(result.name).toBe('正印')
    expect(result.shortName).toBe('印')
    expect(result.wuxingRel).toBe('泄')
    expect(result.sameYinYang).toBe(false)
  })

  it('甲对壬 → 偏印（他水生我木，阴阳同）', () => {
    const result = tenGod(jia, gan('壬'))
    expect(result.name).toBe('偏印')
    expect(result.shortName).toBe('枭')
    expect(result.wuxingRel).toBe('泄')
    expect(result.sameYinYang).toBe(true)
  })

  it('甲对乙 → 劫财（同木，阴阳异）', () => {
    const result = tenGod(jia, gan('乙'))
    expect(result.name).toBe('劫财')
    expect(result.shortName).toBe('劫')
    expect(result.wuxingRel).toBe('比')
    expect(result.sameYinYang).toBe(false)
  })

  it('甲对甲 → 比肩（同木，阴阳同）', () => {
    const result = tenGod(jia, gan('甲'))
    expect(result.name).toBe('比肩')
    expect(result.shortName).toBe('比')
    expect(result.wuxingRel).toBe('比')
    expect(result.sameYinYang).toBe(true)
  })
})

describe('tenGod - 返回冻结对象', () => {
  it('返回的十神对象是冻结的', () => {
    const result = tenGod(gan('甲'), gan('己'))
    expect(Object.isFrozen(result)).toBe(true)
  })
})
