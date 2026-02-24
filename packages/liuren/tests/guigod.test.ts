import { gan, zhi } from '@yhjs/bagua'
import { describe, expect, it } from 'vitest'
import { GUI_GOD_NAMES, resolveGuiGodType, setGuiGods } from '../src/guigod'
import { initPalaces, setTianpan } from '../src/yuejiang'

describe('guigod', () => {
  describe('gUI_GOD_NAMES', () => {
    it('should have 12 entries', () => {
      expect(GUI_GOD_NAMES).toHaveLength(12)
      expect(GUI_GOD_NAMES[0]).toBe('贵人')
      expect(GUI_GOD_NAMES[11]).toBe('天后')
    })
  })

  describe('resolveGuiGodType', () => {
    it('should return yang for 卯~申 (index 3~8)', () => {
      expect(resolveGuiGodType(zhi('卯'))).toBe('yang')
      expect(resolveGuiGodType(zhi('辰'))).toBe('yang')
      expect(resolveGuiGodType(zhi('申'))).toBe('yang')
    })
    it('should return yin for 酉~寅 (index 9~11, 0~2)', () => {
      expect(resolveGuiGodType(zhi('酉'))).toBe('yin')
      expect(resolveGuiGodType(zhi('子'))).toBe('yin')
      expect(resolveGuiGodType(zhi('寅'))).toBe('yin')
    })
  })

  describe('setGuiGods', () => {
    // Case 1: 癸干, 阳贵, yuejiang=亥, hourZhi=未
    // 癸→[巳(5),卯(3)], yang→巳(5)
    // offset = (5 - 11 + 12) % 12 = 6
    // startIndex = (7 + 6) % 12 = 1 (丑)
    // 丑(1) in {11,0,1,2,3,4} → forward
    it('should place 贵人 at 丑 for 癸干 阳贵 yuejiang=亥 hourZhi=未', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('亥'), zhi('未'))
      const result = setGuiGods(palaces, gan('癸'), zhi('亥'), zhi('未'), 'yang')
      expect(result[1].guiGod!.name).toBe('贵人')
      expect(result[2].guiGod!.name).toBe('螣蛇')
      expect(result[0].guiGod!.name).toBe('天后')
    })

    // Case 2: reverse direction (startIndex in 5~10)
    // 甲干→[丑(1),未(7)], yin→未(7)
    // yuejiang=子(0), hourZhi=子(0)
    // offset = (7 - 0 + 12) % 12 = 7
    // startIndex = (0 + 7) % 12 = 7 (未)
    // 未(7) in {5~10} → reverse
    it('should reverse when startIndex is 巳~戌', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('子'), zhi('子'))
      const result = setGuiGods(palaces, gan('甲'), zhi('子'), zhi('子'), 'yin')
      expect(result[7].guiGod!.name).toBe('贵人')
      expect(result[6].guiGod!.name).toBe('螣蛇')
    })
  })
})
