import { describe, it, expect } from 'vitest'
import { ganZhi, ganZhiFromNames, JIA_ZI_TABLE } from '../src/ganzhi'
import { Wuxing } from '../src/types'

describe('JIA_ZI_TABLE', () => {
  it('长度为 60', () => {
    expect(JIA_ZI_TABLE.length).toBe(60)
  })

  it('甲子(0): gan=甲, zhi=子, name=甲子, xunIndex=0', () => {
    const gz = JIA_ZI_TABLE[0]
    expect(gz.gan.name).toBe('甲')
    expect(gz.zhi.name).toBe('子')
    expect(gz.name).toBe('甲子')
    expect(gz.xunIndex).toBe(0)
    expect(gz.index).toBe(0)
  })

  it('乙丑(1): gan=乙, zhi=丑, name=乙丑, xunIndex=0', () => {
    const gz = JIA_ZI_TABLE[1]
    expect(gz.gan.name).toBe('乙')
    expect(gz.zhi.name).toBe('丑')
    expect(gz.name).toBe('乙丑')
    expect(gz.xunIndex).toBe(0)
  })

  it('癸亥(59): gan=癸, zhi=亥, name=癸亥, xunIndex=5', () => {
    const gz = JIA_ZI_TABLE[59]
    expect(gz.gan.name).toBe('癸')
    expect(gz.zhi.name).toBe('亥')
    expect(gz.name).toBe('癸亥')
    expect(gz.xunIndex).toBe(5)
    expect(gz.index).toBe(59)
  })

  it('甲戌(10): xunIndex=1', () => {
    const gz = JIA_ZI_TABLE[10]
    expect(gz.name).toBe('甲戌')
    expect(gz.xunIndex).toBe(1)
  })
})

describe('纳音', () => {
  it('甲子(0)/乙丑(1) = 海中金(wuxing=金3)', () => {
    expect(JIA_ZI_TABLE[0].nayin.name).toBe('海中金')
    expect(JIA_ZI_TABLE[0].nayin.wuxing).toBe(Wuxing.金)
    expect(JIA_ZI_TABLE[1].nayin.name).toBe('海中金')
    expect(JIA_ZI_TABLE[1].nayin.wuxing).toBe(Wuxing.金)
  })

  it('丙寅(2)/丁卯(3) = 炉中火(wuxing=火1)', () => {
    expect(JIA_ZI_TABLE[2].nayin.name).toBe('炉中火')
    expect(JIA_ZI_TABLE[2].nayin.wuxing).toBe(Wuxing.火)
    expect(JIA_ZI_TABLE[3].nayin.name).toBe('炉中火')
    expect(JIA_ZI_TABLE[3].nayin.wuxing).toBe(Wuxing.火)
  })
})

describe('旬空', () => {
  it('甲子旬(xunIndex=0) 空戌亥', () => {
    const gz = JIA_ZI_TABLE[0]
    expect(gz.kongWang[0].name).toBe('戌')
    expect(gz.kongWang[1].name).toBe('亥')
  })

  it('甲寅旬(xunIndex=5) 空子丑', () => {
    const gz = JIA_ZI_TABLE[50]
    expect(gz.xunIndex).toBe(5)
    expect(gz.kongWang[0].name).toBe('子')
    expect(gz.kongWang[1].name).toBe('丑')
  })

  it('甲戌旬(xunIndex=1) 空申酉', () => {
    const gz = JIA_ZI_TABLE[10]
    expect(gz.xunIndex).toBe(1)
    expect(gz.kongWang[0].name).toBe('申')
    expect(gz.kongWang[1].name).toBe('酉')
  })
})

describe('ganZhi()', () => {
  it('按名称查找甲子', () => {
    const gz = ganZhi('甲子')
    expect(gz.name).toBe('甲子')
    expect(gz.index).toBe(0)
  })

  it('ganZhi(60) 取模 → 甲子', () => {
    const gz = ganZhi(60)
    expect(gz.name).toBe('甲子')
    expect(gz.index).toBe(0)
  })

  it('ganZhi(-1) 取模 → 癸亥', () => {
    const gz = ganZhi(-1)
    expect(gz.name).toBe('癸亥')
    expect(gz.index).toBe(59)
  })

  it('未知名称抛出错误', () => {
    expect(() => ganZhi('未知')).toThrow('未知干支: 未知')
  })
})

describe('ganZhiFromNames()', () => {
  it('从干支名称组合查找甲子', () => {
    const gz = ganZhiFromNames('甲', '子')
    expect(gz.name).toBe('甲子')
    expect(gz.index).toBe(0)
  })

  it('未知组合抛出错误', () => {
    // 甲+午不是有效的60甲子组合（甲对应偶数索引，午对应奇数索引，无法配对）
    // 甲(0)只能配子(0)/戌(10)/申(20)/午(30)/辰(40)/寅(50)等...实际上甲午是存在的
    // 使用真正无效的天干地支组合：甲(0)配丑(1)，0%10=0, 1%12=1，但0和1的差不是整数倍，所以不存在
    // 实际上干支组合需要 ganIndex%2 == zhiIndex%2（同奇同偶）
    // 甲(index=0,阳) + 丑(index=1,阴) 是无效的组合
    expect(() => ganZhiFromNames('甲', '丑')).toThrow()
  })
})

describe('对象冻结', () => {
  it('JIA_ZI_TABLE 本身已冻结', () => {
    expect(Object.isFrozen(JIA_ZI_TABLE)).toBe(true)
  })

  it('每个 GanZhi 对象已冻结', () => {
    for (const gz of JIA_ZI_TABLE) {
      expect(Object.isFrozen(gz)).toBe(true)
    }
  })

  it('nayin 对象已冻结', () => {
    expect(Object.isFrozen(JIA_ZI_TABLE[0].nayin)).toBe(true)
  })

  it('kongWang 数组已冻结', () => {
    expect(Object.isFrozen(JIA_ZI_TABLE[0].kongWang)).toBe(true)
  })
})
