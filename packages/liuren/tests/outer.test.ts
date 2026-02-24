import { ganZhi, zhi } from '@yhjs/bagua'
import { describe, expect, it } from 'vitest'
import { JIANCHU_NAMES, setJianChu, setOuterGan, setTaiyin, setTwelvePalaces, TWELVE_PALACE_NAMES } from '../src/outer'
import { dateToJd, initPalaces, resolveIsSolar, resolveTaiyinZhi, setTianpan, TAIYIN_TABLE } from '../src/yuejiang'

describe('outer', () => {
  describe('setOuterGan', () => {
    // Case 1: keyGanZhi=癸丑, yuejiang=亥, hourZhi=未
    // jiaPos = (1 - 9 + 12) % 12 = 4 (辰)
    // offset = (4 - 11 + 12) % 12 = 5
    // startIndex = (7 + 5) % 12 = 0 (子)
    // 子→甲, 丑→乙, 寅→丙, ..., 酉→癸, 戌→甲, 亥→乙
    it('should place 甲 at 子 for keyGanZhi=癸丑 yuejiang=亥 hourZhi=未', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('亥'), zhi('未'))
      const result = setOuterGan(palaces, ganZhi('癸丑'), zhi('亥'), zhi('未'))
      expect(result[0].outerGan!.name).toBe('甲')
      expect(result[1].outerGan!.name).toBe('乙')
      expect(result[2].outerGan!.name).toBe('丙')
      expect(result[9].outerGan!.name).toBe('癸')
      expect(result[10].outerGan!.name).toBe('甲') // cycle
      expect(result[11].outerGan!.name).toBe('乙') // cycle
    })

    // Case 2: keyGanZhi=甲子, yuejiang=丑, hourZhi=寅
    // jiaPos = (0 - 0 + 12) % 12 = 0 (子)
    // offset = (0 - 1 + 12) % 12 = 11
    // startIndex = (2 + 11) % 12 = 1 (丑)
    it('should work for keyGanZhi=甲子 yuejiang=丑 hourZhi=寅', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('丑'), zhi('寅'))
      const result = setOuterGan(palaces, ganZhi('甲子'), zhi('丑'), zhi('寅'))
      expect(result[1].outerGan!.name).toBe('甲')
      expect(result[2].outerGan!.name).toBe('乙')
    })
  })

  describe('setJianChu', () => {
    it('should have correct constant names', () => {
      expect(JIANCHU_NAMES).toEqual(['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'])
    })

    // keyZhi=丑(1): 丑→建, 寅→除, 卯→满, ..., 子→闭
    it('should place 建 at keyZhi and clockwise', () => {
      const palaces = initPalaces()
      const result = setJianChu(palaces, zhi('丑'))
      expect(result[1].jianChu).toBe('建') // 丑=建
      expect(result[2].jianChu).toBe('除') // 寅=除
      expect(result[3].jianChu).toBe('满') // 卯=满
      expect(result[0].jianChu).toBe('闭') // 子=闭
    })

    // keyZhi=子(0): 子→建, 丑→除, ..., 亥→闭
    it('should work with keyZhi=子', () => {
      const palaces = initPalaces()
      const result = setJianChu(palaces, zhi('子'))
      expect(result[0].jianChu).toBe('建')
      expect(result[11].jianChu).toBe('闭')
      expect(result[6].jianChu).toBe('破') // 午=破
    })
  })

  describe('setTwelvePalaces', () => {
    it('should have correct constant names', () => {
      expect(TWELVE_PALACE_NAMES).toEqual([
        '命',
        '兄弟',
        '夫妻',
        '子女',
        '财帛',
        '疾厄',
        '迁移',
        '仆役',
        '官禄',
        '田宅',
        '福德',
        '父母',
      ])
    })

    // keyZhi=丑(1), yuejiang=亥(11), isSolar=true
    // zhiOffset = (1 - 3 + 12) % 12 = 10
    // startIndex = (11 + 10) % 12 = 9 (酉)
    // 阳→顺排: 酉=命, 戌=兄弟, 亥=夫妻, ..., 申=父母
    it('should place 命 correctly for isSolar=true', () => {
      const palaces = initPalaces()
      const result = setTwelvePalaces(palaces, zhi('亥'), zhi('丑'), true)
      expect(result[9].twelvePalace).toBe('命') // 酉=命
      expect(result[10].twelvePalace).toBe('兄弟') // 戌=兄弟
      expect(result[11].twelvePalace).toBe('夫妻') // 亥=夫妻
      expect(result[8].twelvePalace).toBe('父母') // 申=父母
    })

    // 阴→逆排: startIndex 同上=酉(9)
    // 酉=命, 申=兄弟, 未=夫妻, ..., 戌=父母
    it('should reverse for isSolar=false', () => {
      const palaces = initPalaces()
      const result = setTwelvePalaces(palaces, zhi('亥'), zhi('丑'), false)
      expect(result[9].twelvePalace).toBe('命') // 酉=命
      expect(result[8].twelvePalace).toBe('兄弟') // 申=兄弟（逆）
      expect(result[7].twelvePalace).toBe('夫妻') // 未=夫妻（逆）
      expect(result[10].twelvePalace).toBe('父母') // 戌=父母（逆）
    })
  })

  describe('setTaiyin', () => {
    it('should mark only the taiyinZhi palace as true', () => {
      const palaces = initPalaces()
      const result = setTaiyin(palaces, zhi('酉'))
      expect(result[9].taiyin).toBe(true) // 酉=true
      // 其余全为 false
      for (let i = 0; i < 12; i++) {
        if (i !== 9) {
          expect(result[i].taiyin).toBe(false)
        }
      }
    })

    it('should work with 子', () => {
      const palaces = initPalaces()
      const result = setTaiyin(palaces, zhi('子'))
      expect(result[0].taiyin).toBe(true)
      expect(result[1].taiyin).toBe(false)
    })
  })
})

describe('resolveIsSolar', () => {
  // 1985-03-15 (春分前) → 在冬至~夏至之间 → isSolar=true
  it('should return true for dates between winter/summer solstice', () => {
    const jd = dateToJd(new Date(1985, 2, 15, 14, 0, 0))
    expect(resolveIsSolar(jd)).toBe(true)
  })

  // 1990-10-08 (秋分后) → 在夏至~冬至之间 → isSolar=false
  it('should return false for dates between summer/winter solstice', () => {
    const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
    expect(resolveIsSolar(jd)).toBe(false)
  })
})

describe('resolveTaiyinZhi', () => {
  it('should have 31 elements in TAIYIN_TABLE', () => {
    expect(TAIYIN_TABLE).toHaveLength(31)
  })

  // 1985-03-15 → 农历正月廿六 → day=26 → TAIYIN_TABLE[26]=11 → 亥
  it('should resolve taiyin zhi from lunar day', () => {
    const jd = dateToJd(new Date(1985, 2, 15, 14, 0, 0))
    const taiyinZhi = resolveTaiyinZhi(jd)
    // 农历正月廿六, TAIYIN_TABLE[26]=11 → 亥
    expect(taiyinZhi.name).toBe('亥')
  })
})
