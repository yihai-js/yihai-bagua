import { describe, it, expect } from 'vitest'
import { gan } from '../src/gan'
import { zhi } from '../src/zhi'
import { ganRelation, zhiRelation, zhiTripleRelation } from '../src/relation'

describe('ganRelation - 天干关系', () => {
  it('甲己 → 五合', () => {
    const result = ganRelation(gan('甲'), gan('己'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('五合')
  })

  it('己甲 → 五合（对称性）', () => {
    const result = ganRelation(gan('己'), gan('甲'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('五合')
  })

  it('乙庚 → 五合', () => {
    const result = ganRelation(gan('乙'), gan('庚'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('五合')
  })

  it('丙辛 → 五合', () => {
    const result = ganRelation(gan('丙'), gan('辛'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('五合')
  })

  it('丁壬 → 五合', () => {
    const result = ganRelation(gan('丁'), gan('壬'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('五合')
  })

  it('戊癸 → 五合', () => {
    const result = ganRelation(gan('戊'), gan('癸'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('五合')
  })

  it('甲庚 → 相冲', () => {
    const result = ganRelation(gan('甲'), gan('庚'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相冲')
  })

  it('乙辛 → 相冲', () => {
    const result = ganRelation(gan('乙'), gan('辛'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相冲')
  })

  it('丙壬 → 相冲', () => {
    const result = ganRelation(gan('丙'), gan('壬'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相冲')
  })

  it('丁癸 → 相冲', () => {
    const result = ganRelation(gan('丁'), gan('癸'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相冲')
  })

  it('戊己 → null（戊己无冲）', () => {
    expect(ganRelation(gan('戊'), gan('己'))).toBeNull()
  })

  it('甲乙 → null（无关系）', () => {
    expect(ganRelation(gan('甲'), gan('乙'))).toBeNull()
  })

  it('甲甲 → null', () => {
    expect(ganRelation(gan('甲'), gan('甲'))).toBeNull()
  })
})

describe('zhiRelation - 地支关系', () => {
  it('子丑 → 六合', () => {
    const result = zhiRelation(zhi('子'), zhi('丑'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('六合')
  })

  it('丑子 → 六合（对称）', () => {
    const result = zhiRelation(zhi('丑'), zhi('子'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('六合')
  })

  it('寅亥 → 六合', () => {
    const result = zhiRelation(zhi('寅'), zhi('亥'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('六合')
  })

  it('午未 → 六合', () => {
    const result = zhiRelation(zhi('午'), zhi('未'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('六合')
  })

  it('子午 → 相冲', () => {
    const result = zhiRelation(zhi('子'), zhi('午'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相冲')
  })

  it('丑未 → 相冲', () => {
    const result = zhiRelation(zhi('丑'), zhi('未'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相冲')
  })

  it('寅申 → 相冲', () => {
    const result = zhiRelation(zhi('寅'), zhi('申'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相冲')
  })

  it('子卯 → 相刑(无礼)', () => {
    const result = zhiRelation(zhi('子'), zhi('卯'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相刑')
    expect(result!.xingType).toBe('无礼')
  })

  it('寅巳 → 相刑(无恩)', () => {
    const result = zhiRelation(zhi('寅'), zhi('巳'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相刑')
    expect(result!.xingType).toBe('无恩')
  })

  it('午午 → 相刑(自刑)', () => {
    const result = zhiRelation(zhi('午'), zhi('午'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相刑')
    expect(result!.xingType).toBe('自刑')
  })

  it('子未 → 相害', () => {
    const result = zhiRelation(zhi('子'), zhi('未'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相害')
  })

  it('丑午 → 相害', () => {
    const result = zhiRelation(zhi('丑'), zhi('午'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('相害')
  })

  it('子子 → null（无相害相刑以外的特殊）', () => {
    // 子与子：ZHI_XING[0]=卯，子不自刑，也没有其他关系
    expect(zhiRelation(zhi('子'), zhi('子'))).toBeNull()
  })

  it('子寅 → null（无特殊关系）', () => {
    expect(zhiRelation(zhi('子'), zhi('寅'))).toBeNull()
  })
})

describe('zhiTripleRelation - 三合三会', () => {
  it('寅午戌 → 三合', () => {
    const result = zhiTripleRelation(zhi('寅'), zhi('午'), zhi('戌'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三合')
  })

  it('亥卯未 → 三合', () => {
    const result = zhiTripleRelation(zhi('亥'), zhi('卯'), zhi('未'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三合')
  })

  it('巳酉丑 → 三合', () => {
    const result = zhiTripleRelation(zhi('巳'), zhi('酉'), zhi('丑'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三合')
  })

  it('申子辰 → 三合', () => {
    const result = zhiTripleRelation(zhi('申'), zhi('子'), zhi('辰'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三合')
  })

  it('顺序不同也识别三合：戌午寅', () => {
    const result = zhiTripleRelation(zhi('戌'), zhi('午'), zhi('寅'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三合')
  })

  it('寅卯辰 → 三会', () => {
    const result = zhiTripleRelation(zhi('寅'), zhi('卯'), zhi('辰'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三会')
  })

  it('巳午未 → 三会', () => {
    const result = zhiTripleRelation(zhi('巳'), zhi('午'), zhi('未'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三会')
  })

  it('申酉戌 → 三会', () => {
    const result = zhiTripleRelation(zhi('申'), zhi('酉'), zhi('戌'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三会')
  })

  it('亥子丑 → 三会', () => {
    const result = zhiTripleRelation(zhi('亥'), zhi('子'), zhi('丑'))
    expect(result).not.toBeNull()
    expect(result!.type).toBe('三会')
  })

  it('子丑寅 → null（不构成三合三会）', () => {
    expect(zhiTripleRelation(zhi('子'), zhi('丑'), zhi('寅'))).toBeNull()
  })

  it('子午戌 → null', () => {
    expect(zhiTripleRelation(zhi('子'), zhi('午'), zhi('戌'))).toBeNull()
  })
})
