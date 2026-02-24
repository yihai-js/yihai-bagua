import { describe, it, expect } from 'vitest'
import { gan, GANS } from '../src/gan'
import { Wuxing } from '../src/types'

describe('GANS', () => {
  it('长度为 10', () => {
    expect(GANS.length).toBe(10)
  })
})

describe('gan() - 按索引查找', () => {
  it('索引 0 返回甲', () => {
    expect(gan(0).name).toBe('甲')
  })

  it('索引 9 返回癸', () => {
    expect(gan(9).name).toBe('癸')
  })

  it('取模索引 10 → 甲', () => {
    expect(gan(10).name).toBe('甲')
  })

  it('取模索引 -1 → 癸', () => {
    expect(gan(-1).name).toBe('癸')
  })
})

describe('gan() - 按名称查找', () => {
  it('按名称查找甲', () => {
    expect(gan('甲').index).toBe(0)
  })

  it('按名称查找癸', () => {
    expect(gan('癸').index).toBe(9)
  })

  it('未知名称抛出错误', () => {
    expect(() => gan('未知')).toThrow('未知天干: 未知')
  })
})

describe('gan() - 同一引用', () => {
  it('gan(0) === gan("甲")', () => {
    expect(gan(0)).toBe(gan('甲'))
  })

  it('gan(9) === gan("癸")', () => {
    expect(gan(9)).toBe(gan('癸'))
  })
})

describe('天干五行', () => {
  const expectedWuxing: Wuxing[] = [
    Wuxing.木, Wuxing.木, // 甲乙
    Wuxing.火, Wuxing.火, // 丙丁
    Wuxing.土, Wuxing.土, // 戊己
    Wuxing.金, Wuxing.金, // 庚辛
    Wuxing.水, Wuxing.水, // 壬癸
  ]

  it('全部 10 干的五行正确', () => {
    GANS.forEach((g, i) => {
      expect(g.wuxing).toBe(expectedWuxing[i])
    })
  })
})

describe('天干阴阳', () => {
  it('偶数索引为阳', () => {
    expect(gan(0).yinyang).toBe('阳') // 甲
    expect(gan(2).yinyang).toBe('阳') // 丙
    expect(gan(4).yinyang).toBe('阳') // 戊
    expect(gan(6).yinyang).toBe('阳') // 庚
    expect(gan(8).yinyang).toBe('阳') // 壬
  })

  it('奇数索引为阴', () => {
    expect(gan(1).yinyang).toBe('阴') // 乙
    expect(gan(3).yinyang).toBe('阴') // 丁
    expect(gan(5).yinyang).toBe('阴') // 己
    expect(gan(7).yinyang).toBe('阴') // 辛
    expect(gan(9).yinyang).toBe('阴') // 癸
  })
})

describe('天干长生位 bornZhi', () => {
  it('甲 → 11 (亥)', () => {
    expect(gan('甲').bornZhi).toBe(11)
  })

  it('乙 → 6 (午)', () => {
    expect(gan('乙').bornZhi).toBe(6)
  })

  it('丙 → 2 (寅)', () => {
    expect(gan('丙').bornZhi).toBe(2)
  })

  it('丁 → 9 (酉)', () => {
    expect(gan('丁').bornZhi).toBe(9)
  })

  it('戊 → 2 (寅)', () => {
    expect(gan('戊').bornZhi).toBe(2)
  })

  it('己 → 9 (酉)', () => {
    expect(gan('己').bornZhi).toBe(9)
  })

  it('庚 → 5 (巳)', () => {
    expect(gan('庚').bornZhi).toBe(5)
  })

  it('辛 → 0 (子)', () => {
    expect(gan('辛').bornZhi).toBe(0)
  })

  it('壬 → 8 (申)', () => {
    expect(gan('壬').bornZhi).toBe(8)
  })

  it('癸 → 3 (卯)', () => {
    expect(gan('癸').bornZhi).toBe(3)
  })
})

describe('isYangGan', () => {
  it('偶数索引为阳干', () => {
    expect(gan(0).isYangGan).toBe(true)
    expect(gan(2).isYangGan).toBe(true)
  })

  it('奇数索引为阴干', () => {
    expect(gan(1).isYangGan).toBe(false)
    expect(gan(3).isYangGan).toBe(false)
  })
})

describe('返回冻结对象', () => {
  it('GANS 中的对象是冻结的', () => {
    GANS.forEach(g => {
      expect(Object.isFrozen(g)).toBe(true)
    })
  })
})
