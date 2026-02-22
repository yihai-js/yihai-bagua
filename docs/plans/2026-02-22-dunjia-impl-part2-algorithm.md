# 遁甲迁移 Part 2：算法实现

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 @yhjs/dunjia 包内实现完整的遁甲排盘算法（时家奇门 + 山向奇门），包含不可变链式 API、外圈神煞插件系统、序列化/反序列化，并通过与原版交叉验证的测试。

**Architecture:** 纯函数管道构建盘面（initGroundGan → initSkyGan → initGods → initStars → initDoors → initOutGan），对外暴露不可变链式 API（dayjs 风格）。外圈神煞为插件式架构。

**Tech Stack:** TypeScript 5.9, Vitest 4.0, @yhjs/lunar（干支、节气计算）

**原版代码位置:** `/Users/macbookair/Desktop/projects/chengming-mobile`

**前置条件:** Part 1 已完成，monorepo 结构就绪，@yhjs/dunjia 空包骨架已创建。

---

## Task 1: 实现 base/wuxing.ts — 五行与生克关系

**Files:**
- Create: `packages/dunjia/src/base/wuxing.ts`
- Create: `packages/dunjia/src/base/index.ts`
- Test: `packages/dunjia/tests/base/wuxing.test.ts`

**Step 1: 写测试**

```ts
import { describe, expect, it } from 'vitest'
import { getWuxingRelation, Wuxing } from '../../src/base/wuxing'

describe('wuxing', () => {
  it('相生关系：木生火', () => {
    expect(getWuxingRelation(Wuxing.木, Wuxing.火)).toBe('生')
  })

  it('被生关系：火被木生', () => {
    expect(getWuxingRelation(Wuxing.火, Wuxing.木)).toBe('泄')
  })

  it('相克关系：木克土', () => {
    expect(getWuxingRelation(Wuxing.木, Wuxing.土)).toBe('克')
  })

  it('被克关系：土被木克', () => {
    expect(getWuxingRelation(Wuxing.土, Wuxing.木)).toBe('耗')
  })

  it('同类关系：木比木', () => {
    expect(getWuxingRelation(Wuxing.木, Wuxing.木)).toBe('比')
  })

  it('全部 25 种组合都有结果', () => {
    const values = [Wuxing.木, Wuxing.火, Wuxing.土, Wuxing.金, Wuxing.水]
    for (const a of values) {
      for (const b of values) {
        const r = getWuxingRelation(a, b)
        expect(['生', '克', '泄', '耗', '比']).toContain(r)
      }
    }
  })
})
```

**Step 2: 运行测试确认失败**

```bash
cd packages/dunjia && pnpm vitest run tests/base/wuxing.test.ts
```

Expected: FAIL，模块不存在。

**Step 3: 实现**

```ts
/**
 * 五行枚举与生克关系
 *
 * 五行相生：木→火→土→金→水→木
 * 五行相克：木→土→水→火→金→木
 */
export enum Wuxing {
  木 = 0,
  火 = 1,
  土 = 2,
  金 = 3,
  水 = 4,
}

export const WUXING_NAMES = ['木', '火', '土', '金', '水'] as const

export type WuxingRelation = '生' | '克' | '泄' | '耗' | '比'

/**
 * 五行生克关系表
 * relation[a][b] 表示 a 对 b 的关系
 * 生：a 生 b（木生火）
 * 克：a 克 b（木克土）
 * 泄：a 被 b 所生（火泄木 = 木生火的反面）
 * 耗：a 被 b 所克（土耗木 = 木克土的反面）
 * 比：同类
 */
const RELATION_TABLE: WuxingRelation[][] = [
  // 木对: 木火土金水
  ['比', '生', '克', '耗', '泄'],
  // 火对: 木火土金水
  ['泄', '比', '生', '克', '耗'],
  // 土对: 木火土金水
  ['耗', '泄', '比', '生', '克'],
  // 金对: 木火土金水
  ['克', '耗', '泄', '比', '生'],
  // 水对: 木火土金水
  ['生', '克', '耗', '泄', '比'],
]

/**
 * 获取 a 对 b 的五行关系
 */
export function getWuxingRelation(a: Wuxing, b: Wuxing): WuxingRelation {
  return RELATION_TABLE[a][b]
}
```

**Step 4: 创建 base/index.ts**

```ts
export { getWuxingRelation, Wuxing, WUXING_NAMES } from './wuxing'
export type { WuxingRelation } from './wuxing'
```

**Step 5: 运行测试确认通过**

```bash
cd packages/dunjia && pnpm vitest run tests/base/wuxing.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/dunjia/src/base/ packages/dunjia/tests/base/
git commit -m "feat(dunjia): 实现五行与生克关系"
```

---

## Task 2: 实现 base/bagua.ts — 八卦

**Files:**
- Create: `packages/dunjia/src/base/bagua.ts`
- Modify: `packages/dunjia/src/base/index.ts`
- Test: `packages/dunjia/tests/base/bagua.test.ts`

**Step 1: 写测试**

```ts
import { describe, expect, it } from 'vitest'
import { BAGUA_LIST, getBagua, Wuxing } from '../../src/base'

describe('bagua', () => {
  it('后天八卦列表长度为 8', () => {
    expect(BAGUA_LIST).toHaveLength(8)
  })

  it('坎卦属性正确', () => {
    const kan = getBagua(0)
    expect(kan.name).toBe('坎')
    expect(kan.wuxing).toBe(Wuxing.水)
  })

  it('通过名称查找八卦', () => {
    const li = getBagua('离')
    expect(li.index).toBe(7)
    expect(li.wuxing).toBe(Wuxing.火)
  })

  it('卦象比较', () => {
    const kan = getBagua('坎')
    const li = getBagua('离')
    // 坎 010 vs 离 101，全不同
    expect(compareBagua(kan, li)).toBe('111')
  })
})
```

**Step 2: 运行测试确认失败**

**Step 3: 实现**

```ts
import { Wuxing } from './wuxing'

/**
 * 八卦信息
 */
export interface BaguaInfo {
  /** 索引 0-7 */
  index: number
  /** 后天卦名 */
  name: string
  /** 先天卦名 */
  beforeName: string
  /** 阴阳 (1=阳, 0=阴) */
  yinyang: number
  /** 五行 */
  wuxing: Wuxing
  /** 卦象 (3位二进制字符串，0=阴爻，1=阳爻) */
  gua: string
}

/** 后天八卦名列表 (坎1→坤2→震3→巽4→乾6→兑7→艮8→离9) */
export const BAGUA_LIST = ['坎', '坤', '震', '巽', '乾', '兑', '艮', '离'] as const

/** 先天八卦名列表 */
const BEFORE_BAGUA_LIST = ['兑', '坎', '艮', '坤', '离', '巽', '乾', '震'] as const

/** 八卦阴阳 (后天序) */
const YINYANG_LIST = [1, 0, 1, 0, 1, 0, 1, 0] as const

/** 八卦五行 (后天序) */
const WUXING_LIST = [Wuxing.水, Wuxing.土, Wuxing.木, Wuxing.木, Wuxing.金, Wuxing.金, Wuxing.土, Wuxing.火] as const

/** 卦象 (后天序) */
const GUA_LIST = ['010', '000', '001', '110', '111', '011', '100', '101'] as const

/**
 * 获取八卦信息
 * @param input - 索引 (0-7) 或卦名
 */
export function getBagua(input: number | string): BaguaInfo {
  let index: number
  if (typeof input === 'string') {
    index = BAGUA_LIST.indexOf(input as typeof BAGUA_LIST[number])
    if (index === -1) throw new Error(`未知八卦: ${input}`)
  }
  else {
    index = input
  }

  return {
    index,
    name: BAGUA_LIST[index],
    beforeName: BEFORE_BAGUA_LIST[index],
    yinyang: YINYANG_LIST[index],
    wuxing: WUXING_LIST[index],
    gua: GUA_LIST[index],
  }
}

/**
 * 卦象比较，返回差异字符串 (0=相同，1=不同)
 */
export function compareBagua(a: BaguaInfo, b: BaguaInfo): string {
  let result = ''
  for (let i = 0; i < 3; i++) {
    result += a.gua[i] === b.gua[i] ? '0' : '1'
  }
  return result
}
```

**Step 4: 更新 base/index.ts 增加导出**

**Step 5: 运行测试确认通过**

**Step 6: Commit**

```bash
git commit -m "feat(dunjia): 实现八卦数据与查询"
```

---

## Task 3: 实现 base/xun.ts — 旬与六仪

**Files:**
- Create: `packages/dunjia/src/base/xun.ts`
- Test: `packages/dunjia/tests/base/xun.test.ts`

**Step 1: 写测试**

```ts
import { describe, expect, it } from 'vitest'
import { getXun, LIUYI_LIST, XUN_LIST } from '../../src/base/xun'

describe('xun', () => {
  it('六旬列表长度为 6', () => {
    expect(XUN_LIST).toHaveLength(6)
  })

  it('甲子旬', () => {
    const xun = getXun(0)
    expect(xun.name).toBe('甲子')
    expect(xun.head).toBe('戊')
    expect(xun.index).toBe(0)
  })

  it('甲戌旬', () => {
    const xun = getXun(1)
    expect(xun.name).toBe('甲戌')
    expect(xun.head).toBe('己')
  })

  it('六仪列表正确', () => {
    expect(LIUYI_LIST).toEqual(['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'])
  })

  it('从六十甲子索引推算旬', () => {
    // 甲子(0) → 甲子旬(0)
    expect(getXun(0).index).toBe(0)
    // 癸酉(9) → 甲子旬(0)，因为甲子旬包含甲子到癸酉
    // 甲戌(10) → 甲戌旬(1)
    expect(getXun(1).index).toBe(1)
  })

  it('通过干支索引获取旬', () => {
    // 六十甲子的第 0-9 个属于甲子旬
    // 第 10-19 个属于甲戌旬
    const xunFromGanZhi = getXunFromGanZhiIndex(10)
    expect(xunFromGanZhi.index).toBe(1)
    expect(xunFromGanZhi.name).toBe('甲戌')
  })
})
```

**Step 2: 实现**

```ts
/**
 * 旬与六仪
 *
 * 六十甲子分为六旬，每旬十个干支。
 * 每旬的旬首（甲X）对应一个六仪天干。
 *
 * 来源: chengming-mobile/class/bagua/xun.js
 */

export interface XunInfo {
  /** 旬索引 0-5 */
  index: number
  /** 旬首干支名 (甲子、甲戌等) */
  name: string
  /** 六仪天干 (戊己庚辛壬癸) */
  head: string
}

/** 六旬列表: 旬首干支 + 六仪天干 */
export const XUN_LIST = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'] as const

/** 六旬对应的六仪天干 */
const XUN_HEAD_LIST = ['戊', '己', '庚', '辛', '壬', '癸'] as const

/**
 * 三奇六仪排列顺序
 * 地盘排布时按此顺序依次填入九宫
 * 戊己庚辛壬癸 为六仪，丁丙乙 为三奇
 */
export const LIUYI_LIST = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'] as const

/**
 * 通过旬索引获取旬信息
 */
export function getXun(index: number): XunInfo {
  return {
    index,
    name: XUN_LIST[index],
    head: XUN_HEAD_LIST[index],
  }
}

/**
 * 从六十甲子索引 (0-59) 推算所属旬
 * 每旬 10 个干支: 0-9 → 旬0, 10-19 → 旬1, ...
 */
export function getXunFromGanZhiIndex(ganZhiIndex: number): XunInfo {
  const xunIndex = Math.floor(((ganZhiIndex % 60) + 60) % 60 / 10)
  return getXun(xunIndex)
}
```

**Step 3: 运行测试确认通过**

**Step 4: Commit**

```bash
git commit -m "feat(dunjia): 实现旬与六仪"
```

---

## Task 4: 实现 base/nine-palace.ts — 九宫拓扑

**Files:**
- Create: `packages/dunjia/src/base/nine-palace.ts`
- Test: `packages/dunjia/tests/base/nine-palace.test.ts`

**Step 1: 写测试**

```ts
import { describe, expect, it } from 'vitest'
import {
  CENTER_PALACE,
  createEmptyPalaces,
  EXTRA_PALACE,
  fixedIndex,
  getIndexByAfterNum,
  getOffsetPalaceNum,
  PALACE_AFTER_NUMS,
  PALACE_BAGUA_NAMES,
  traverseByClock,
  traverseByAfterNum,
} from '../../src/base/nine-palace'

describe('nine-palace', () => {
  it('九宫八卦名列表', () => {
    expect(PALACE_BAGUA_NAMES).toEqual(['巽', '离', '坤', '震', null, '兑', '艮', '坎', '乾'])
  })

  it('后天宫位数列表', () => {
    expect(PALACE_AFTER_NUMS).toEqual([4, 9, 2, 3, 5, 7, 8, 1, 6])
  })

  it('中宫索引为 4', () => {
    expect(CENTER_PALACE).toBe(4)
  })

  it('寄宫索引为 2（坤二宫）', () => {
    expect(EXTRA_PALACE).toBe(2)
  })

  it('后天宫位数转索引', () => {
    expect(getIndexByAfterNum(1)).toBe(7) // 坎
    expect(getIndexByAfterNum(9)).toBe(1) // 离
    expect(getIndexByAfterNum(5)).toBe(4) // 中
  })

  it('中宫寄坤修正', () => {
    expect(fixedIndex(4)).toBe(2) // 中宫 → 坤宫
    expect(fixedIndex(3)).toBe(3) // 其他不变
  })

  it('后天宫位数偏移', () => {
    expect(getOffsetPalaceNum(1, 1)).toBe(2)
    expect(getOffsetPalaceNum(9, 1)).toBe(1) // 9→1 循环
    expect(getOffsetPalaceNum(1, -1)).toBe(9) // 逆向
  })

  it('顺时针遍历 8 宫', () => {
    const visited: number[] = []
    traverseByClock(0, 8, (index) => { visited.push(index) })
    expect(visited).toHaveLength(8)
    // 不包含中宫(4)
    expect(visited).not.toContain(4)
  })

  it('按后天宫位数遍历 9 宫', () => {
    const visited: number[] = []
    traverseByAfterNum(0, 9, (index) => { visited.push(index) })
    expect(visited).toHaveLength(9)
  })
})
```

**Step 2: 实现**

```ts
/**
 * 九宫拓扑
 *
 * 九宫布局 (索引):
 *   巽(0) 离(1) 坤(2)
 *   震(3) 中(4) 兑(5)
 *   艮(6) 坎(7) 乾(8)
 *
 * 来源: chengming-mobile/class/stage/baseStage.js
 */

/** 九宫对应的后天八卦名 */
export const PALACE_BAGUA_NAMES = ['巽', '离', '坤', '震', null, '兑', '艮', '坎', '乾'] as const

/** 九宫后天宫位数 */
export const PALACE_AFTER_NUMS = [4, 9, 2, 3, 5, 7, 8, 1, 6] as const

/** 顺时针指针: [顺时针下一宫, 逆时针下一宫] */
const CLOCK_POINTERS: readonly [number, number][] = [
  [1, 3], [2, 0], [5, 1],
  [0, 6], [5, 1], [8, 2], // 中宫指针实际不用
  [3, 7], [6, 8], [7, 5],
]

/** 中宫索引 */
export const CENTER_PALACE = 4

/** 寄宫索引（坤二宫） */
export const EXTRA_PALACE = 2

// 按后天宫位数排列的索引指针（预计算）
let afterNumPointers: { prev: number, next: number }[] | null = null

function ensureAfterNumPointers(): { prev: number, next: number }[] {
  if (afterNumPointers) return afterNumPointers
  const len = PALACE_BAGUA_NAMES.length
  afterNumPointers = PALACE_AFTER_NUMS.map((num) => {
    const prevNum = ((num - 1 + len - 1) % len) + 1
    const nextNum = (num % len) + 1
    return {
      prev: PALACE_AFTER_NUMS.indexOf(prevNum),
      next: PALACE_AFTER_NUMS.indexOf(nextNum),
    }
  })
  return afterNumPointers
}

/**
 * 后天宫位数 → 九宫索引
 */
export function getIndexByAfterNum(num: number): number {
  const index = PALACE_AFTER_NUMS.indexOf(num)
  return index >= 0 ? index : 0
}

/**
 * 中宫寄坤修正: 如果是中宫则返回坤宫索引
 */
export function fixedIndex(index: number): number {
  return index === CENTER_PALACE ? EXTRA_PALACE : index
}

/**
 * 后天宫位数偏移
 * @param num - 当前宫位数 (1-9)
 * @param offset - 偏移量 (正=顺, 负=逆)
 * @returns 偏移后的宫位数 (1-9)
 */
export function getOffsetPalaceNum(num: number, offset: number): number {
  const len = PALACE_BAGUA_NAMES.length
  return ((num - 1 + ((offset % len) + len)) % len) + 1
}

/**
 * 顺时针遍历（跳过中宫）
 * @param start - 起始宫索引
 * @param count - 遍历宫数 (正=顺时针, 负=逆时针)
 * @param callback - 每宫回调 (宫索引, 遍历序号)，返回 false 中断
 */
export function traverseByClock(
  start: number,
  count: number,
  callback: (palaceIndex: number, step: number) => void | false,
): void {
  const isForward = count > 0
  const len = Math.abs(count)
  let current = start
  for (let i = 0; i < len; i++) {
    if (callback(current, i) === false) break
    const [go, anti] = CLOCK_POINTERS[current]
    current = isForward ? go : anti
  }
}

/**
 * 按后天宫位数遍历
 * @param start - 起始宫索引
 * @param count - 遍历宫数 (正=顺序, 负=逆序)
 * @param callback - 每宫回调
 */
export function traverseByAfterNum(
  start: number,
  count: number,
  callback: (palaceIndex: number, step: number) => void | false,
): void {
  const pointers = ensureAfterNumPointers()
  const isForward = count > 0
  const len = Math.abs(count)
  let current = start
  for (let i = 0; i < len; i++) {
    if (callback(current, i) === false) break
    const ptr = pointers[current]
    current = isForward ? ptr.next : ptr.prev
  }
}
```

**Step 3: 运行测试确认通过**

**Step 4: Commit**

```bash
git commit -m "feat(dunjia): 实现九宫拓扑与遍历"
```

---

## Task 5: 实现 model/ — 九星、八门、八神

**Files:**
- Create: `packages/dunjia/src/model/star.ts`
- Create: `packages/dunjia/src/model/door.ts`
- Create: `packages/dunjia/src/model/god.ts`
- Create: `packages/dunjia/src/model/index.ts`
- Test: `packages/dunjia/tests/model/model.test.ts`

**Step 1: 写测试**

```ts
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
```

**Step 2: 实现 star.ts**

```ts
import { Wuxing } from '../base/wuxing'
import type { StarInfo } from '../types'

/**
 * 九星数据
 * 来源: chengming-mobile/class/bagua/dunjiaStar.js
 */
export const STARS: readonly StarInfo[] = [
  { name: '天蓬星', shortName: '蓬', wuxing: Wuxing.水, originPalace: 1 },
  { name: '天任星', shortName: '任', wuxing: Wuxing.土, originPalace: 8 },
  { name: '天冲星', shortName: '冲', wuxing: Wuxing.木, originPalace: 3 },
  { name: '天辅星', shortName: '辅', wuxing: Wuxing.木, originPalace: 4 },
  { name: '天英星', shortName: '英', wuxing: Wuxing.火, originPalace: 9 },
  { name: '天芮星', shortName: '芮', wuxing: Wuxing.土, originPalace: 2 },
  { name: '天柱星', shortName: '柱', wuxing: Wuxing.金, originPalace: 7 },
  { name: '天心星', shortName: '心', wuxing: Wuxing.金, originPalace: 6 },
  { name: '天禽星', shortName: '禽', wuxing: Wuxing.土, originPalace: 5 },
]

/**
 * 后天宫位数 → 九星索引
 */
export function starIndexFromAfterNum(num: number): number {
  const index = STARS.findIndex(s => s.originPalace === num)
  return index >= 0 ? index : 0
}
```

**Step 3: 实现 door.ts（结构与 star.ts 几乎相同）**

```ts
import { Wuxing } from '../base/wuxing'
import type { DoorInfo } from '../types'

export const DOORS: readonly DoorInfo[] = [
  { name: '休门', shortName: '休', wuxing: Wuxing.水, originPalace: 1 },
  { name: '生门', shortName: '生', wuxing: Wuxing.土, originPalace: 8 },
  { name: '伤门', shortName: '伤', wuxing: Wuxing.木, originPalace: 3 },
  { name: '杜门', shortName: '杜', wuxing: Wuxing.木, originPalace: 4 },
  { name: '景门', shortName: '景', wuxing: Wuxing.火, originPalace: 9 },
  { name: '死门', shortName: '死', wuxing: Wuxing.土, originPalace: 2 },
  { name: '惊门', shortName: '惊', wuxing: Wuxing.金, originPalace: 7 },
  { name: '开门', shortName: '开', wuxing: Wuxing.金, originPalace: 6 },
  { name: '中门', shortName: '中', wuxing: Wuxing.土, originPalace: 5 },
]

export function doorIndexFromAfterNum(num: number): number {
  const index = DOORS.findIndex(d => d.originPalace === num)
  return index >= 0 ? index : 0
}
```

**Step 4: 实现共享的 next/prev 索引函数**

九星和八门的 next/prev 逻辑完全相同（天禽星/中门特殊处理），放在 model/index.ts：

```ts
/**
 * 九星/八门的下一个索引
 * 特殊处理: 天禽星(8)/中门(8) 在排盘遍历中的跳转
 * - 当前为 8 (天禽/中门) → 下一个是 6 (天柱/惊门)
 * - 当前为 4 (天英/景门) → 下一个是 8 (天禽/中门)
 *
 * @param index - 当前索引
 * @param isSpecial - 是否启用特殊处理
 */
export function nextStarDoorIndex(index: number, isSpecial: boolean): number {
  if (!isSpecial) return (index + 1) % 8

  if (index === 8) return 6       // 天禽/中门 → 天柱/惊门
  if (index === 4) return 8       // 天英/景门 → 天禽/中门
  return (index + 1) % 8
}

export function prevStarDoorIndex(index: number, isSpecial: boolean): number {
  if (!isSpecial) return (index + 7) % 8

  if (index === 8) return 4       // 天禽/中门 → 天英/景门
  if (index === 6) return 8       // 天柱/惊门 → 天禽/中门
  return (index + 7) % 8
}
```

**Step 5: 实现 god.ts**

```ts
import { Wuxing } from '../base/wuxing'
import type { GodInfo } from '../types'

export const GODS: readonly GodInfo[] = [
  { name: '值符', shortName: '符', wuxing: Wuxing.木 },
  { name: '腾蛇', shortName: '蛇', wuxing: Wuxing.火 },
  { name: '太阴', shortName: '阴', wuxing: Wuxing.金 },
  { name: '六合', shortName: '六', wuxing: Wuxing.木 },
  { name: '白虎', shortName: '白', wuxing: Wuxing.金 },
  { name: '玄武', shortName: '玄', wuxing: Wuxing.水 },
  { name: '九地', shortName: '地', wuxing: Wuxing.土 },
  { name: '九天', shortName: '天', wuxing: Wuxing.火 },
]
```

**Step 6: 运行测试确认通过**

**Step 7: Commit**

```bash
git commit -m "feat(dunjia): 实现九星、八门、八神数据模型"
```

---

## Task 6: 实现 board/common.ts — 排盘纯函数管道

**Files:**
- Create: `packages/dunjia/src/board/common.ts`
- Create: `packages/dunjia/src/board/index.ts`
- Test: `packages/dunjia/tests/board/common.test.ts`

这是最核心的任务，实现排盘的每个步骤函数。每个 init 函数都是纯函数：接收 palaces + meta → 返回新 palaces。

**Step 1: 写测试**

选取一个已知的时局作为 fixture。参照原版 chengming-mobile，以 2026-02-22 14:00 (未时) 为例，手动确认排盘结果。

具体的 fixture 数据需要在实现过程中通过原版代码生成（运行原版的 TimeDunjia 并记录输出）。

测试文件结构：

```ts
import { describe, expect, it } from 'vitest'
import { createEmptyPalaceData, initGroundGan, initSkyGan, initGods, initStars, initDoors, initOutGan, resolveMeta } from '../../src/board/common'

describe('resolveMeta', () => {
  it('确定阴阳遁和局数', () => {
    const meta = resolveMeta({ datetime: new Date('2026-02-22T14:00:00'), type: 'hour' })
    // 预期值需要通过原版验证后填入
    expect(meta.yinyang).toBeDefined()
    expect(meta.juNumber).toBeGreaterThanOrEqual(1)
    expect(meta.juNumber).toBeLessThanOrEqual(9)
  })
})

describe('initGroundGan', () => {
  it('地盘三奇六仪按阳遁顺排/阴遁逆排', () => {
    const meta = resolveMeta({ datetime: new Date('2026-02-22T14:00:00'), type: 'hour' })
    const palaces = createEmptyPalaceData()
    const result = initGroundGan(palaces, meta)
    // 每宫都应有 groundGan
    for (let i = 0; i < 9; i++) {
      if (i === 4) continue // 中宫排完后会被清空
      expect(result[i].groundGan).toBeTruthy()
    }
  })
})

// 更多步骤测试...在实现过程中补充具体预期值
```

**Step 2: 实现 resolveMeta**

这是第一个核心函数，需要：
1. 将 Date 转为儒略日
2. 调用 @yhjs/lunar 获取年月日时干支
3. 根据 type 确定定局干支 (keyGanZhi)
4. 根据节气确定阴阳遁
5. 计算局数

```ts
import {
  TIAN_GAN,
  getYearGanZhi,
  getMonthGanZhi,
  getDayGanZhi,
  getHourGanZhi,
  ganZhiToIndex,
} from '@yhjs/lunar'
import type { BoardMeta, TimeBoardOptions, Palace } from '../types'
import { LIUYI_LIST, getXunFromGanZhiIndex } from '../base/xun'
import { PALACE_AFTER_NUMS, PALACE_BAGUA_NAMES } from '../base/nine-palace'

// 实现细节在此...
// 完整实现需要参照 timeDunjia.js 的 initGanzhi, initYinyang, initNum 逻辑
```

**Step 3: 实现排盘步骤函数**

每个函数对应原版 dunjia.js 中的一个 init 方法：

- `initGroundGan()` → 排地盘三奇六仪（对应 dunjia.js:128-168）
- `initSkyGan()` → 排天盘（对应 dunjia.js:188-216）
- `initGods()` → 排八神（对应 dunjia.js:218-233）
- `initStars()` → 排九星（对应 dunjia.js:236-251）
- `initDoors()` → 排八门（对应 dunjia.js:254-279）
- `initOutGan()` → 排隐干（对应 dunjia.js:282-364）

**关键转换注意事项:**

1. 原版用 mutable `this.palaces`，新版每步返回新数组
2. 原版的 `travePalaceByAfterNum` / `travePalaceByClock` 替换为 `traverseByAfterNum` / `traverseByClock`
3. 原版的 `Ganzhi`/`Gan` 对象替换为 plain string（只保留天干名）
4. 原版的 `this.isSolar` 替换为 `meta.yinyang === '阳'`
5. 原版的 `this.num` 替换为 `meta.juNumber`
6. 原版的 `this.xunHead` 替换为 `meta.xunHead` / `meta.xunHeadGan`

**Step 4: 逐步测试每个函数**

**Step 5: Commit**

```bash
git commit -m "feat(dunjia): 实现排盘纯函数管道（地盘→天盘→八神→九星→八门→隐干）"
```

---

## Task 7: 生成 fixture — 从原版代码提取测试数据

**Files:**
- Create: `packages/dunjia/tests/fixtures/`

**Step 1: 在原版 chengming-mobile 中生成 fixture**

选取多个有代表性的时间点：

| 时间 | 特点 |
|------|------|
| 2026-02-22 14:00 | 普通时局 |
| 2026-06-21 12:00 | 夏至附近（阳遁→阴遁转换点） |
| 2026-01-01 00:00 | 子时（跨日边界） |
| 2024-02-10 06:00 | 甲日甲时（值符特殊情况） |

对每个时间点，记录完整盘面数据：
- meta（阴阳遁、局数、旬首等）
- 9 宫的 groundGan, skyGan, star, door, god, outGan

保存为 JSON fixture 文件。

**Step 2: 编写 fixture 驱动的测试**

```ts
import { describe, expect, it } from 'vitest'
import fixture1 from '../fixtures/2026-02-22-1400.json'
import { TimeDunjia } from '../../src'

describe('cross-validation: 2026-02-22 14:00', () => {
  const board = TimeDunjia.create({
    datetime: new Date('2026-02-22T14:00:00'),
    type: 'hour',
  })

  it('meta 正确', () => {
    expect(board.meta.yinyang).toBe(fixture1.meta.yinyang)
    expect(board.meta.juNumber).toBe(fixture1.meta.juNumber)
    expect(board.meta.xunHead).toBe(fixture1.meta.xunHead)
  })

  it('每宫地盘正确', () => {
    for (let i = 0; i < 9; i++) {
      if (i === 4) continue
      expect(board.palace(i).groundGan).toBe(fixture1.palaces[i].groundGan)
    }
  })

  // ... star, door, god, skyGan, outGan
})
```

**Step 3: Commit**

```bash
git commit -m "test(dunjia): 添加排盘交叉验证 fixture"
```

---

## Task 8: 实现 board/time-dunjia.ts — TimeDunjia 类

**Files:**
- Create: `packages/dunjia/src/board/time-dunjia.ts`
- Test: `packages/dunjia/tests/board/time-dunjia.test.ts`

**Step 1: 写测试**

```ts
import { describe, expect, it } from 'vitest'
import { TimeDunjia } from '../../src'

describe('TimeDunjia', () => {
  it('create 返回 TimeDunjia 实例', () => {
    const board = TimeDunjia.create({
      datetime: new Date('2026-02-22T14:00:00'),
      type: 'hour',
    })
    expect(board).toBeInstanceOf(TimeDunjia)
    expect(board.palaces).toHaveLength(9)
    expect(board.meta.type).toBe('hour')
  })

  it('不可变性: 操作返回新实例', () => {
    const board = TimeDunjia.create({
      datetime: new Date('2026-02-22T14:00:00'),
      type: 'hour',
    })
    const moved = board.moveStar(1)
    expect(moved).not.toBe(board)
    // 原实例不变
    expect(board.meta.moveStarOffset).toBe(0)
    expect(moved.meta.moveStarOffset).toBe(1)
  })

  it('序列化往返', () => {
    const board = TimeDunjia.create({
      datetime: new Date('2026-02-22T14:00:00'),
      type: 'hour',
    })
    const json = board.toJSON()
    const restored = TimeDunjia.from(json)
    expect(restored.toJSON()).toEqual(json)
  })

  it('链式调用', () => {
    const board = TimeDunjia.create({
      datetime: new Date('2026-02-22T14:00:00'),
      type: 'hour',
    })
      .moveStar(1)
      .moveStar(2)

    expect(board.meta.moveStarOffset).toBe(2)
  })

  it('palace() 单宫查询', () => {
    const board = TimeDunjia.create({
      datetime: new Date('2026-02-22T14:00:00'),
      type: 'hour',
    })
    const p = board.palace(0)
    expect(p.name).toBe('巽')
    expect(p.groundGan).toBeTruthy()
  })
})
```

**Step 2: 实现**

```ts
import type { BoardMeta, DunjiaBoardData, OuterGodPlugin, Palace, TimeBoardOptions } from '../types'
import { buildBoard, resolveMeta, applyMoveStar } from './common'

export class TimeDunjia {
  readonly meta: BoardMeta
  readonly palaces: readonly Palace[]

  private constructor(meta: BoardMeta, palaces: Palace[]) {
    this.meta = Object.freeze({ ...meta })
    this.palaces = Object.freeze([...palaces])
  }

  /**
   * 起新局
   */
  static create(options: TimeBoardOptions): TimeDunjia {
    const type = options.type ?? 'hour'
    const meta = resolveMeta({ ...options, type })
    const palaces = buildBoard(meta)
    return new TimeDunjia(meta, palaces)
  }

  /**
   * 从序列化数据恢复
   */
  static from(data: DunjiaBoardData): TimeDunjia {
    return new TimeDunjia(
      { ...data.meta, datetime: new Date(data.meta.datetime) },
      data.palaces.map(p => ({ ...p })),
    )
  }

  /**
   * 移星换斗（返回新实例）
   */
  moveStar(offset: number): TimeDunjia {
    const newPalaces = applyMoveStar(this.palaces as Palace[], offset, this.meta.moveStarOffset)
    const newMeta = { ...this.meta, moveStarOffset: offset }
    return new TimeDunjia(newMeta, newPalaces)
  }

  /**
   * 应用外圈神煞插件（返回新实例）
   */
  applyOuterGod(plugin: OuterGodPlugin): TimeDunjia {
    const layer = plugin.apply(this.palaces as Palace[], this.meta)
    const newPalaces = (this.palaces as Palace[]).map(p => ({
      ...p,
      outerGods: [...p.outerGods, layer],
    }))
    return new TimeDunjia({ ...this.meta }, newPalaces)
  }

  /**
   * 批量应用外圈神煞
   */
  applyOuterGods(plugins: OuterGodPlugin[]): TimeDunjia {
    return plugins.reduce<TimeDunjia>((board, plugin) => board.applyOuterGod(plugin), this)
  }

  /**
   * 单宫查询
   */
  palace(index: number): Palace {
    return this.palaces[index]
  }

  /**
   * 序列化
   */
  toJSON(): DunjiaBoardData {
    return {
      meta: { ...this.meta },
      palaces: this.palaces.map(p => ({ ...p, outerGods: [...p.outerGods] })),
    }
  }
}
```

**Step 3: 运行测试**

**Step 4: Commit**

```bash
git commit -m "feat(dunjia): 实现 TimeDunjia 不可变链式 API"
```

---

## Task 9: 实现 moveStar — 移星换斗

**Files:**
- Modify: `packages/dunjia/src/board/common.ts`（添加 applyMoveStar）
- Test: `packages/dunjia/tests/board/move-star.test.ts`

**Step 1: 写测试**

```ts
import { describe, expect, it } from 'vitest'
import { TimeDunjia } from '../../src'

describe('moveStar', () => {
  const board = TimeDunjia.create({
    datetime: new Date('2026-02-22T14:00:00'),
    type: 'hour',
  })

  it('移星换斗后每宫数据发生旋转', () => {
    const moved = board.moveStar(1)
    // 移动 1 步后，每宫的天盘、九星、八门应该顺时针旋转了 1 格
    // 具体验证值依赖 fixture
    expect(moved.palaces).not.toEqual(board.palaces)
  })

  it('移星换斗保持不可变', () => {
    const original = board.toJSON()
    board.moveStar(1)
    expect(board.toJSON()).toEqual(original)
  })
})
```

**Step 2: 实现 applyMoveStar**

参照原版 dunjia.js:390-443 的 moveStar 逻辑，将 mutable 操作转换为返回新数组。

**Step 3: 运行测试**

**Step 4: Commit**

```bash
git commit -m "feat(dunjia): 实现移星换斗"
```

---

## Task 10: 实现外圈神煞插件框架 + 十二建神示例插件

**Files:**
- Modify: `packages/dunjia/src/outer-gods/types.ts`（已在 types.ts 中定义）
- Create: `packages/dunjia/src/outer-gods/jian-shen.ts`
- Modify: `packages/dunjia/src/outer-gods/index.ts`
- Test: `packages/dunjia/tests/outer-gods/jian-shen.test.ts`

**Step 1: 写测试**

```ts
import { describe, expect, it } from 'vitest'
import { TimeDunjia } from '../../src'
import { jianShen } from '../../src/outer-gods'

describe('outer-god: jianShen', () => {
  it('插件接口正确', () => {
    expect(jianShen.name).toBe('十二建神')
    expect(jianShen.scope).toContain('time')
  })

  it('应用后盘面含外圈层', () => {
    const board = TimeDunjia.create({
      datetime: new Date('2026-02-22T14:00:00'),
      type: 'hour',
    }).applyOuterGod(jianShen)

    // 至少有一宫含有外圈神煞数据
    const hasOuter = board.palaces.some(p => p.outerGods.length > 0)
    expect(hasOuter).toBe(true)
  })

  it('链式应用多个插件互不干扰', () => {
    const board = TimeDunjia.create({
      datetime: new Date('2026-02-22T14:00:00'),
      type: 'hour',
    })
      .applyOuterGod(jianShen)
      .applyOuterGod(jianShen) // 同一个插件应用两次

    // 每宫应有 2 层
    expect(board.palaces[0].outerGods).toHaveLength(2)
  })
})
```

**Step 2: 实现十二建神插件**

参照原版 Liuren.setJianchu 逻辑实现。

**Step 3: 运行测试**

**Step 4: Commit**

```bash
git commit -m "feat(dunjia): 实现外圈神煞插件框架 + 十二建神插件"
```

---

## Task 11: 山向模块 + PosDunjia（概要）

> 本 Task 为后续实现的框架指引，具体实现步骤参照 Task 1-10 的 TDD 模式。

**Files:**
- Create: `packages/dunjia/src/mountain/mountain.ts`
- Create: `packages/dunjia/src/board/pos-dunjia.ts`
- Test: `packages/dunjia/tests/mountain/`
- Test: `packages/dunjia/tests/board/pos-dunjia.test.ts`

**实现顺序:**

1. **mountain.ts** — 24 山数据、罗盘三盘偏移（人盘偏 7.5°、天盘偏 7.5°）、角度→山向转换、透地龙、三元局数。参照原版 mountain.js。
2. **pos-dunjia.ts** — PosDunjia 类，extends 或 compose TimeDunjia 的排盘逻辑，增加山向相关属性（mountain, direction）、变盘类型（normal/guiyi/heshi/fanzhuan）。参照原版 posDunjia.js。
3. **PosDunjia 专属外圈神煞** — 十二长生、将神、关联八卦、小游年。

---

## Task 12: 完善导出和包入口

**Files:**
- Modify: `packages/dunjia/src/index.ts`

**Step 1: 更新包入口，导出所有公共 API**

```ts
// 类
export { TimeDunjia } from './board/time-dunjia'
export { PosDunjia } from './board/pos-dunjia'

// 类型
export type {
  BoardMeta,
  DoorInfo,
  DunjiaBoardData,
  GodInfo,
  OuterGodEntry,
  OuterGodLayer,
  OuterGodPlugin,
  Palace,
  StarInfo,
  TimeBoardOptions,
  YinYang,
} from './types'

// 枚举/常量
export { Wuxing } from './base'
export { STARS } from './model/star'
export { DOORS } from './model/door'
export { GODS } from './model/god'
```

**Step 2: 验证构建**

```bash
cd packages/dunjia && pnpm run build
```

**Step 3: Commit**

```bash
git commit -m "feat(dunjia): 完善包导出"
```

---

## 完成标志

Part 2 完成后，项目状态应为：

- [x] base/（五行、八卦、旬、九宫）全部实现并测试通过
- [x] model/（九星、八门、八神）全部实现并测试通过
- [x] TimeDunjia.create() 能正确排盘，与原版交叉验证通过
- [x] 不可变链式 API 工作正常（.moveStar(), .applyOuterGod()）
- [x] .toJSON() / .from() 序列化往返正确
- [x] 外圈神煞插件框架可用，至少一个插件（十二建神）实现
- [x] PosDunjia 基础功能可用
- [x] `pnpm run build && pnpm run test` 全量通过
