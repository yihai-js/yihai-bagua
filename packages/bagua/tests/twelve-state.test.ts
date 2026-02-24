import { describe, it, expect } from 'vitest'
import { gan } from '../src/gan'
import { zhi } from '../src/zhi'
import { twelveState } from '../src/twelve-state'

describe('twelveState - 甲(阳干, bornZhi=亥11) 顺推', () => {
  const jia = gan('甲') // 阳木, bornZhi=11(亥)

  it('甲在亥(11) → 长生 (offset=0)', () => {
    expect(twelveState(jia, zhi('亥'))).toBe('长生')
  })

  it('甲在子(0) → 沐浴 (offset=1, 0+12-11=1)', () => {
    expect(twelveState(jia, zhi('子'))).toBe('沐浴')
  })

  it('甲在丑(1) → 冠带 (offset=2)', () => {
    expect(twelveState(jia, zhi('丑'))).toBe('冠带')
  })

  it('甲在寅(2) → 临官 (offset=3)', () => {
    expect(twelveState(jia, zhi('寅'))).toBe('临官')
  })

  it('甲在卯(3) → 帝旺 (offset=4)', () => {
    expect(twelveState(jia, zhi('卯'))).toBe('帝旺')
  })

  it('甲在辰(4) → 衰 (offset=5)', () => {
    expect(twelveState(jia, zhi('辰'))).toBe('衰')
  })

  it('甲在巳(5) → 病 (offset=6)', () => {
    expect(twelveState(jia, zhi('巳'))).toBe('病')
  })

  it('甲在午(6) → 死 (offset=7, 6+12-11=7)', () => {
    expect(twelveState(jia, zhi('午'))).toBe('死')
  })

  it('甲在未(7) → 墓 (offset=8)', () => {
    expect(twelveState(jia, zhi('未'))).toBe('墓')
  })

  it('甲在申(8) → 绝 (offset=9)', () => {
    expect(twelveState(jia, zhi('申'))).toBe('绝')
  })

  it('甲在酉(9) → 胎 (offset=10)', () => {
    expect(twelveState(jia, zhi('酉'))).toBe('胎')
  })

  it('甲在戌(10) → 养 (offset=11)', () => {
    expect(twelveState(jia, zhi('戌'))).toBe('养')
  })
})

describe('twelveState - 乙(阴干, bornZhi=午6) 逆推', () => {
  const yi = gan('乙') // 阴木, bornZhi=6(午)

  it('乙在午(6) → 长生 (offset=0)', () => {
    expect(twelveState(yi, zhi('午'))).toBe('长生')
  })

  it('乙在巳(5) → 沐浴 (offset=1, 6-5=1)', () => {
    expect(twelveState(yi, zhi('巳'))).toBe('沐浴')
  })

  it('乙在辰(4) → 冠带 (offset=2)', () => {
    expect(twelveState(yi, zhi('辰'))).toBe('冠带')
  })

  it('乙在卯(3) → 临官 (offset=3)', () => {
    expect(twelveState(yi, zhi('卯'))).toBe('临官')
  })

  it('乙在寅(2) → 帝旺 (offset=4)', () => {
    expect(twelveState(yi, zhi('寅'))).toBe('帝旺')
  })

  it('乙在丑(1) → 衰 (offset=5)', () => {
    expect(twelveState(yi, zhi('丑'))).toBe('衰')
  })

  it('乙在子(0) → 病 (offset=6, 6-0=6)', () => {
    expect(twelveState(yi, zhi('子'))).toBe('病')
  })

  it('乙在亥(11) → 死 (offset=7, 6+12-11=7)', () => {
    expect(twelveState(yi, zhi('亥'))).toBe('死')
  })

  it('乙在戌(10) → 墓 (offset=8)', () => {
    expect(twelveState(yi, zhi('戌'))).toBe('墓')
  })

  it('乙在酉(9) → 绝 (offset=9)', () => {
    expect(twelveState(yi, zhi('酉'))).toBe('绝')
  })

  it('乙在申(8) → 胎 (offset=10)', () => {
    expect(twelveState(yi, zhi('申'))).toBe('胎')
  })

  it('乙在未(7) → 养 (offset=11)', () => {
    expect(twelveState(yi, zhi('未'))).toBe('养')
  })
})
