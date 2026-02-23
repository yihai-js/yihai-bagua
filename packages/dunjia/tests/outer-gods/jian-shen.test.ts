import { describe, expect, it } from 'vitest'
import { TimeDunjia } from '../../src/board/time-dunjia'
import { jianShen } from '../../src/outer-gods/jian-shen'

const JIANCHU_ALL = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭']

describe('outer-god: jianShen', () => {
  const TEST_DATE = new Date(2026, 1, 22, 14, 0, 0) // 2026-02-22 14:00

  it('插件接口正确', () => {
    expect(jianShen.name).toBe('十二建神')
    expect(jianShen.scope).toContain('time')
    expect(typeof jianShen.apply).toBe('function')
  })

  it('应用后盘面含外圈层', () => {
    const board = TimeDunjia.create({
      datetime: TEST_DATE,
      type: 'hour',
    }).applyOuterGod(jianShen)
    const hasOuter = board.palaces.some(p => p.outerGods.length > 0)
    expect(hasOuter).toBe(true)
  })

  it('链式应用多个插件互不干扰', () => {
    const board = TimeDunjia.create({
      datetime: TEST_DATE,
      type: 'hour',
    })
      .applyOuterGod(jianShen)
      .applyOuterGod(jianShen)
    expect(board.palaces[0].outerGods).toHaveLength(2)
  })

  it('12 个建神全部被分配', () => {
    const board = TimeDunjia.create({
      datetime: TEST_DATE,
      type: 'hour',
    }).applyOuterGod(jianShen)

    // 收集所有宫位的 allEntries
    const allNames: string[] = []
    for (const palace of board.palaces) {
      if (palace.outerGods.length > 0) {
        const layer = palace.outerGods[0]
        const entry = layer.data[palace.index]
        if (entry?.extra) {
          allNames.push(...(entry.extra.allEntries as string[]))
        }
      }
    }

    // 12 个建神全部出现
    expect(allNames).toHaveLength(12)
    for (const name of JIANCHU_ALL) {
      expect(allNames).toContain(name)
    }
  })

  it('数据只映射到外八宫（不含中宫 index=4）', () => {
    const board = TimeDunjia.create({
      datetime: TEST_DATE,
      type: 'hour',
    }).applyOuterGod(jianShen)

    const layer = board.palaces[0].outerGods[0]
    const palaceIndices = Object.keys(layer.data).map(Number)

    // 中宫索引为 4，不应出现
    expect(palaceIndices).not.toContain(4)
    // 应该有 8 个外宫的数据（12 地支映射到 8 个外宫）
    expect(palaceIndices).toHaveLength(8)
  })

  it('共享宫位的 allEntries 包含正确的多个值', () => {
    const board = TimeDunjia.create({
      datetime: TEST_DATE,
      type: 'hour',
    }).applyOuterGod(jianShen)

    const layer = board.palaces[0].outerGods[0]

    // 找到 allEntries 长度 > 1 的宫位（共享宫位）
    const sharedPalaces = Object.entries(layer.data)
      .filter(([_, entry]) => {
        const entries = entry.extra?.allEntries as string[] | undefined
        return entries && entries.length > 1
      })

    // 12 个建神映射到 8 个宫，必然有 4 个宫共享（各包含 2 个建神）
    expect(sharedPalaces).toHaveLength(4)

    for (const [_, entry] of sharedPalaces) {
      const entries = entry.extra?.allEntries as string[]
      expect(entries).toHaveLength(2)
      // 每个条目都应是有效的建神名
      for (const name of entries) {
        expect(JIANCHU_ALL).toContain(name)
      }
    }
  })

  it('isGroundDoor 数组与 allEntries 长度一致', () => {
    const board = TimeDunjia.create({
      datetime: TEST_DATE,
      type: 'hour',
    }).applyOuterGod(jianShen)

    const layer = board.palaces[0].outerGods[0]

    for (const entry of Object.values(layer.data)) {
      const allEntries = entry.extra?.allEntries as string[]
      const isGroundDoor = entry.extra?.isGroundDoor as boolean[]
      expect(allEntries.length).toBe(isGroundDoor.length)
    }
  })

  it('不同日期产生不同的建神排列', () => {
    const board1 = TimeDunjia.create({
      datetime: new Date(2026, 1, 22, 14, 0, 0),
      type: 'hour',
    }).applyOuterGod(jianShen)

    const board2 = TimeDunjia.create({
      datetime: new Date(2026, 1, 22, 16, 0, 0),
      type: 'hour',
    }).applyOuterGod(jianShen)

    const layer1 = board1.palaces[0].outerGods[0]
    const layer2 = board2.palaces[0].outerGods[0]

    // 不同时辰的干支地支不同，建神排列应不同
    // 对比 name 字段，至少有一个宫不同
    let hasDiff = false
    for (let i = 0; i < 9; i++) {
      if (i === 4)
        continue // 跳过中宫
      const name1 = layer1.data[i]?.name
      const name2 = layer2.data[i]?.name
      if (name1 !== name2) {
        hasDiff = true
        break
      }
    }
    expect(hasDiff).toBe(true)
  })

  it('layer.name 应为"十二建神"', () => {
    const board = TimeDunjia.create({
      datetime: TEST_DATE,
      type: 'hour',
    }).applyOuterGod(jianShen)

    const layer = board.palaces[0].outerGods[0]
    expect(layer.name).toBe('十二建神')
  })

  it('entry.name 应为该宫第一个映射到的建神', () => {
    const board = TimeDunjia.create({
      datetime: TEST_DATE,
      type: 'hour',
    }).applyOuterGod(jianShen)

    const layer = board.palaces[0].outerGods[0]

    for (const entry of Object.values(layer.data)) {
      const allEntries = entry.extra?.allEntries as string[]
      // name 应等于 allEntries 的第一个元素
      expect(entry.name).toBe(allEntries[0])
    }
  })
})
