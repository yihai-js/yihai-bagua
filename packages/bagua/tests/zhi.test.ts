import { describe, it, expect } from 'vitest'
import { zhi, ZHIS } from '../src/zhi'
import { gan } from '../src/gan'
import { Wuxing } from '../src/types'

describe('ZHIS', () => {
  it('长度为 12', () => {
    expect(ZHIS.length).toBe(12)
  })
})

describe('zhi() - 按索引查找', () => {
  it('索引 0 返回子', () => {
    expect(zhi(0).name).toBe('子')
  })

  it('索引 11 返回亥', () => {
    expect(zhi(11).name).toBe('亥')
  })
})

describe('zhi() - 按名称查找', () => {
  it('按名称查找子', () => {
    expect(zhi('子').index).toBe(0)
  })

  it('按名称查找亥', () => {
    expect(zhi('亥').index).toBe(11)
  })

  it('未知名称抛出错误', () => {
    expect(() => zhi('未知')).toThrow('未知地支: 未知')
  })
})

describe('地支五行', () => {
  const expectedWuxing: Wuxing[] = [
    Wuxing.水, // 子
    Wuxing.土, // 丑
    Wuxing.木, // 寅
    Wuxing.木, // 卯
    Wuxing.土, // 辰
    Wuxing.火, // 巳
    Wuxing.火, // 午
    Wuxing.土, // 未
    Wuxing.金, // 申
    Wuxing.金, // 酉
    Wuxing.土, // 戌
    Wuxing.水, // 亥
  ]

  it('全部 12 支的五行正确', () => {
    ZHIS.forEach((z, i) => {
      expect(z.wuxing).toBe(expectedWuxing[i])
    })
  })
})

describe('地支阴阳', () => {
  it('偶数索引为阳', () => {
    expect(zhi(0).yinyang).toBe('阳')  // 子
    expect(zhi(2).yinyang).toBe('阳')  // 寅
    expect(zhi(4).yinyang).toBe('阳')  // 辰
    expect(zhi(6).yinyang).toBe('阳')  // 午
    expect(zhi(8).yinyang).toBe('阳')  // 申
    expect(zhi(10).yinyang).toBe('阳') // 戌
  })

  it('奇数索引为阴', () => {
    expect(zhi(1).yinyang).toBe('阴')  // 丑
    expect(zhi(3).yinyang).toBe('阴')  // 卯
    expect(zhi(5).yinyang).toBe('阴')  // 巳
    expect(zhi(7).yinyang).toBe('阴')  // 未
    expect(zhi(9).yinyang).toBe('阴')  // 酉
    expect(zhi(11).yinyang).toBe('阴') // 亥
  })
})

describe('地支生肖', () => {
  const expectedShengXiao = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

  it('全部 12 支的生肖正确', () => {
    ZHIS.forEach((z, i) => {
      expect(z.shengXiao).toBe(expectedShengXiao[i])
    })
  })

  it('子→鼠', () => expect(zhi('子').shengXiao).toBe('鼠'))
  it('丑→牛', () => expect(zhi('丑').shengXiao).toBe('牛'))
  it('亥→猪', () => expect(zhi('亥').shengXiao).toBe('猪'))
})

describe('藏干完整性', () => {
  it('子: 1个(癸main)', () => {
    const hg = zhi('子').hiddenGans
    expect(hg.length).toBe(1)
    expect(hg[0].gan.name).toBe('癸')
    expect(hg[0].weight).toBe('main')
  })

  it('丑: 3个(癸main, 辛middle, 己minor)', () => {
    const hg = zhi('丑').hiddenGans
    expect(hg.length).toBe(3)
    expect(hg[0].gan.name).toBe('癸')
    expect(hg[0].weight).toBe('main')
    expect(hg[1].gan.name).toBe('辛')
    expect(hg[1].weight).toBe('middle')
    expect(hg[2].gan.name).toBe('己')
    expect(hg[2].weight).toBe('minor')
  })

  it('寅: 3个(戊main, 丙middle, 甲minor)', () => {
    const hg = zhi('寅').hiddenGans
    expect(hg.length).toBe(3)
    expect(hg[0].gan.name).toBe('戊')
    expect(hg[0].weight).toBe('main')
    expect(hg[1].gan.name).toBe('丙')
    expect(hg[1].weight).toBe('middle')
    expect(hg[2].gan.name).toBe('甲')
    expect(hg[2].weight).toBe('minor')
  })

  it('卯: 1个(乙main)', () => {
    const hg = zhi('卯').hiddenGans
    expect(hg.length).toBe(1)
    expect(hg[0].gan.name).toBe('乙')
    expect(hg[0].weight).toBe('main')
  })

  it('午: 2个(己main, 丁middle)', () => {
    const hg = zhi('午').hiddenGans
    expect(hg.length).toBe(2)
    expect(hg[0].gan.name).toBe('己')
    expect(hg[0].weight).toBe('main')
    expect(hg[1].gan.name).toBe('丁')
    expect(hg[1].weight).toBe('middle')
  })

  it('酉: 1个(辛main)', () => {
    const hg = zhi('酉').hiddenGans
    expect(hg.length).toBe(1)
    expect(hg[0].gan.name).toBe('辛')
    expect(hg[0].weight).toBe('main')
  })

  it('亥: 2个(甲main, 壬middle)', () => {
    const hg = zhi('亥').hiddenGans
    expect(hg.length).toBe(2)
    expect(hg[0].gan.name).toBe('甲')
    expect(hg[0].weight).toBe('main')
    expect(hg[1].gan.name).toBe('壬')
    expect(hg[1].weight).toBe('middle')
  })
})

describe('藏干 Gan 引用', () => {
  it('藏干的 gan 对象是正确的 Gan 引用', () => {
    const jiaChen = zhi('辰').hiddenGans.find(h => h.gan.name === '乙')
    expect(jiaChen).toBeDefined()
    expect(jiaChen!.gan).toBe(gan('乙'))
  })
})

describe('返回冻结对象', () => {
  it('ZHIS 中的对象是冻结的', () => {
    ZHIS.forEach(z => {
      expect(Object.isFrozen(z)).toBe(true)
    })
  })

  it('藏干对象也是冻结的', () => {
    ZHIS.forEach(z => {
      z.hiddenGans.forEach(hg => {
        expect(Object.isFrozen(hg)).toBe(true)
      })
    })
  })
})
