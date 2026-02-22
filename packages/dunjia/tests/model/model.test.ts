import { describe, expect, it } from 'vitest'
import { Wuxing } from '../../src/base'
import { DOORS, GODS, nextStarDoorIndex, prevStarDoorIndex, STARS } from '../../src/model'

describe('stars', () => {
  it('九星列表长度为 9', () => {
    expect(STARS).toHaveLength(9)
  })
  it('天蓬星属性', () => {
    expect(STARS[0].name).toBe('天蓬星')
    expect(STARS[0].shortName).toBe('蓬')
    expect(STARS[0].wuxing).toBe(Wuxing.水)
    expect(STARS[0].originPalace).toBe(1)
  })
  it('天禽星为最后一个（索引 8）', () => {
    expect(STARS[8].name).toBe('天禽星')
    expect(STARS[8].originPalace).toBe(5)
  })
  it('天禽星 next → 天柱星(6)', () => {
    expect(nextStarDoorIndex(8, true)).toBe(6)
  })
  it('天英星(4) next → 天禽星(8)', () => {
    expect(nextStarDoorIndex(4, true)).toBe(8)
  })
  it('普通 next: 0→1→2→3→4→5→6→7→0', () => {
    expect(nextStarDoorIndex(0, false)).toBe(1)
    expect(nextStarDoorIndex(7, false)).toBe(0)
  })
  it('天禽星 prev → 天英星(4)', () => {
    expect(prevStarDoorIndex(8, true)).toBe(4)
  })
  it('天柱星(6) prev → 天禽星(8)', () => {
    expect(prevStarDoorIndex(6, true)).toBe(8)
  })
})

describe('doors', () => {
  it('八门列表长度为 9', () => {
    expect(DOORS).toHaveLength(9)
  })
  it('休门属性', () => {
    expect(DOORS[0].name).toBe('休门')
    expect(DOORS[0].shortName).toBe('休')
    expect(DOORS[0].originPalace).toBe(1)
  })
})

describe('gods', () => {
  it('八神列表长度为 8', () => {
    expect(GODS).toHaveLength(8)
  })
  it('值符属性', () => {
    expect(GODS[0].name).toBe('值符')
    expect(GODS[0].shortName).toBe('符')
  })
})
