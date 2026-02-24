import { describe, expect, it } from 'vitest'
import { setOuterGan } from '../src/outer'
import { ganZhi, zhi } from '@yhjs/bagua'
import { initPalaces, setTianpan } from '../src/yuejiang'

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
      expect(result[10].outerGan!.name).toBe('甲')  // cycle
      expect(result[11].outerGan!.name).toBe('乙')  // cycle
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
})
