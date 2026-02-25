# @yhjs/liuren 实施计划 Part 2 (Tasks 5-7)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现三传计算（含伏吟）、时运命、流水线入口 buildLiurenBoard()、集成测试

**Architecture:** 纯函数流水线。Part 1 完成了地盘/天盘/贵神/外天干，Part 2 完成三传/时运命/组装入口。

**Tech Stack:** TypeScript 5.9+, Vite 7.3, Vitest 4.0

**前置依赖:** Part 1 (Tasks 1-4) 全部完成

---

## Task 5: legend.ts — 三传计算

**Files:**
- Create: `packages/liuren/src/legend.ts`
- Create: `packages/liuren/tests/legend.test.ts`

**关键算法说明:**

三传分「干传」和「支传」，各取三步。

**正常模式（非伏吟）:**
1. **干传:** 起点=天干寄宫地支，查天盘得到初传，再用初传查天盘得到中传，以此类推
2. **支传:** 起点=用神地支，查天盘得到初传，连续三步

**伏吟模式（天盘=地盘，即 palace[0].tianpan == palace[0].zhi）:**
1. 首传: 天干取寄宫地支，地支取自身
2. 后续传: 取相刑地支；若自刑则取相冲地支

**数据表:**

```
十干寄宫 (GAN_JIGONG): 甲→寅(2), 乙→辰(4), 丙→巳(5), 丁→未(7), 戊→巳(5),
                        己→未(7), 庚→申(8), 辛→戌(10), 壬→亥(11), 癸→丑(1)
索引: [2, 4, 5, 7, 5, 7, 8, 10, 11, 1]

相刑表 (XING_TABLE): 子→卯(3), 丑→戌(10), 寅→巳(5), 卯→子(0), 辰→辰(4),
                      巳→申(8), 午→午(6), 未→丑(1), 申→寅(2), 酉→酉(9),
                      戌→未(7), 亥→亥(11)
索引: [3, 10, 5, 0, 4, 8, 6, 1, 2, 9, 7, 11]

相冲: chong[i] = (i + 6) % 12 (无需表)
```

### Step 1: Write failing tests

```typescript
// packages/liuren/tests/legend.test.ts
import { describe, expect, it } from 'vitest'
import { isFuyin, computeLegend, GAN_JIGONG, XING_TABLE } from '../src/legend'
import { ganZhi, zhi } from '@yhjs/bagua'
import { initPalaces, setTianpan } from '../src/yuejiang'

describe('legend', () => {
  describe('data tables', () => {
    it('GAN_JIGONG should have 10 entries', () => {
      expect(GAN_JIGONG).toHaveLength(10)
      expect(GAN_JIGONG[0]).toBe(2)  // 甲→寅
      expect(GAN_JIGONG[9]).toBe(1)  // 癸→丑
    })

    it('XING_TABLE should have 12 entries', () => {
      expect(XING_TABLE).toHaveLength(12)
      expect(XING_TABLE[0]).toBe(3)   // 子→卯
      expect(XING_TABLE[4]).toBe(4)   // 辰→辰 (自刑)
      expect(XING_TABLE[6]).toBe(6)   // 午→午 (自刑)
    })
  })

  describe('isFuyin', () => {
    it('should return true when tianpan equals dipan for all palaces', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('辰'), zhi('辰'))
      expect(isFuyin(palaces)).toBe(true)
    })

    it('should return false when tianpan differs from dipan', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('亥'), zhi('未'))
      expect(isFuyin(palaces)).toBe(false)
    })
  })

  describe('computeLegend (non-伏吟)', () => {
    // 1985-03-15 14:00: keyGanZhi=癸丑, yuejiang=亥, hourZhi=未
    // 天盘: 子→辰, 丑→巳, 寅→午, 卯→未, 辰→申, 巳→酉, 午→戌, 未→亥, 申→子, 酉→丑, 戌→寅, 亥→卯
    //
    // 干传: 癸(9), GAN_JIGONG[9]=1(丑), tianpan[1]=巳(5)
    //   → 巳(5), tianpan[5]=酉(9)
    //   → 酉(9), tianpan[9]=丑(1)
    //   ganLegend = [巳, 酉, 丑]
    //
    // 支传: 丑(1), tianpan[1]=巳(5)
    //   → 巳(5), tianpan[5]=酉(9)
    //   → 酉(9), tianpan[9]=丑(1)
    //   zhiLegend = [巳, 酉, 丑]
    it('should compute 干传 and 支传 for non-fuyin case', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('亥'), zhi('未'))
      const key = ganZhi('癸丑')
      const legend = computeLegend(palaces, key)
      expect(legend.ganLegend[0].name).toBe('巳')
      expect(legend.ganLegend[1].name).toBe('酉')
      expect(legend.ganLegend[2].name).toBe('丑')
      expect(legend.zhiLegend[0].name).toBe('巳')
      expect(legend.zhiLegend[1].name).toBe('酉')
      expect(legend.zhiLegend[2].name).toBe('丑')
    })
  })

  describe('computeLegend (伏吟)', () => {
    // yuejiang=辰, hourZhi=辰 → 伏吟 (天盘=地盘)
    // keyGanZhi=乙巳
    //
    // 干传: 乙(1), GAN_JIGONG[1]=4(辰)
    //   step 0 (首传): 直接返回寄宫 = 辰(4)
    //   step 1: 辰(4), XING[4]=4(辰, 自刑!), chong = (4+6)%12=10(戌) → 戌(10)
    //   step 2: 戌(10), XING[10]=7(未) → 未(7)
    //   ganLegend = [辰, 戌, 未]
    //
    // 支传: 巳(5)
    //   step 0 (首传): 直接返回自身 = 巳(5)
    //   step 1: 巳(5), XING[5]=8(申) → 申(8)
    //   step 2: 申(8), XING[8]=2(寅) → 寅(2)
    //   zhiLegend = [巳, 申, 寅]
    it('should handle 伏吟 with 自刑 fallback to 相冲', () => {
      let palaces = initPalaces()
      palaces = setTianpan(palaces, zhi('辰'), zhi('辰'))
      const key = ganZhi('乙巳')
      const legend = computeLegend(palaces, key)
      expect(legend.ganLegend[0].name).toBe('辰')
      expect(legend.ganLegend[1].name).toBe('戌')
      expect(legend.ganLegend[2].name).toBe('未')
      expect(legend.zhiLegend[0].name).toBe('巳')
      expect(legend.zhiLegend[1].name).toBe('申')
      expect(legend.zhiLegend[2].name).toBe('寅')
    })
  })
})
```

### Step 2: Run tests to verify they fail

Run: `cd /Users/macbookair/Desktop/projects/sxwnl && pnpm --filter @yhjs/liuren test:run`
Expected: FAIL

### Step 3: Implement legend.ts

```typescript
// packages/liuren/src/legend.ts
import { zhi as zhiFn } from '@yhjs/bagua'
import type { GanZhi, Zhi } from '@yhjs/bagua'
import type { LegendResult, ZhiPalace } from './types'

/**
 * 十干寄宫: ganIndex → 地支 index
 * 甲→寅(2), 乙→辰(4), 丙→巳(5), 丁→未(7), 戊→巳(5),
 * 己→未(7), 庚→申(8), 辛→戌(10), 壬→亥(11), 癸→丑(1)
 */
export const GAN_JIGONG = [2, 4, 5, 7, 5, 7, 8, 10, 11, 1] as const

/**
 * 相刑表: zhiIndex → 刑对方 zhiIndex
 * 子→卯, 丑→戌, 寅→巳, 卯→子, 辰→辰(自刑), 巳→申,
 * 午→午(自刑), 未→丑, 申→寅, 酉→酉(自刑), 戌→未, 亥→亥(自刑)
 */
export const XING_TABLE = [3, 10, 5, 0, 4, 8, 6, 1, 2, 9, 7, 11] as const

/**
 * 判断是否伏吟 (天盘=地盘)
 * 检查子宫(palace[0])的天盘是否等于地盘即可
 */
export function isFuyin(palaces: readonly ZhiPalace[]): boolean {
  return (palaces[0].tianpan.index as number) === (palaces[0].zhi.index as number)
}

/**
 * 获取下一传的地支索引
 *
 * 正常模式: 查天盘 palaces[zhiIndex].tianpan.index
 * 伏吟模式:
 *   - step 0: 直接返回当前 zhiIndex (首传=起点本身)
 *   - step > 0: 取相刑; 若自刑(刑=自身)则取相冲
 */
function getNextLegend(
  zhiIndex: number,
  palaces: readonly ZhiPalace[],
  fuyin: boolean,
  step: number,
): number {
  if (fuyin) {
    if (step === 0) {
      return zhiIndex
    }
    const xingResult = XING_TABLE[zhiIndex]
    if (xingResult === zhiIndex) {
      // 自刑 → 取相冲
      return (zhiIndex + 6) % 12
    }
    return xingResult
  }
  return palaces[zhiIndex].tianpan.index as number
}

/**
 * 计算三传 (干传 + 支传)
 *
 * 参考: chengming-mobile liuren.js:85-126
 */
export function computeLegend(
  palaces: readonly ZhiPalace[],
  keyGanZhi: GanZhi,
): LegendResult {
  const fuyin = isFuyin(palaces)

  // 干传: 从天干寄宫起
  const ganSteps: Zhi[] = []
  let ganZhiIdx = GAN_JIGONG[keyGanZhi.gan.index as number]
  for (let i = 0; i < 3; i++) {
    ganZhiIdx = getNextLegend(ganZhiIdx, palaces, fuyin, i)
    ganSteps.push(zhiFn(ganZhiIdx))
  }

  // 支传: 从用神地支起
  const zhiSteps: Zhi[] = []
  let zhiIdx = keyGanZhi.zhi.index as number
  for (let i = 0; i < 3; i++) {
    zhiIdx = getNextLegend(zhiIdx, palaces, fuyin, i)
    zhiSteps.push(zhiFn(zhiIdx))
  }

  return {
    ganLegend: [ganSteps[0], ganSteps[1], ganSteps[2]] as readonly [Zhi, Zhi, Zhi],
    zhiLegend: [zhiSteps[0], zhiSteps[1], zhiSteps[2]] as readonly [Zhi, Zhi, Zhi],
  }
}
```

### Step 4: Run tests

Run: `cd /Users/macbookair/Desktop/projects/sxwnl && pnpm --filter @yhjs/liuren test:run`
Expected: ALL PASS

> 伏吟测试涉及自刑→冲的回退逻辑，需仔细验证。如果预期值不对，对照源码 liuren.js:103-126 `getNextLegend` 方法。

### Step 5: Commit

```bash
git add packages/liuren/src/legend.ts packages/liuren/tests/legend.test.ts
git commit -m "feat(liuren): 三传计算（含伏吟处理）"
```

---

## Task 6: board.ts + destiny.ts — 流水线入口 + 时运命

**Files:**
- Create: `packages/liuren/src/destiny.ts`
- Create: `packages/liuren/src/board.ts`
- Create: `packages/liuren/tests/board.test.ts`

**关键算法说明:**

**时运命 (destiny.ts):**
- `time` = 时辰地支
- `destiny` = 月将地支
- `live` = 宿命地支 (用户指定, 默认取时支)

**流水线 (board.ts):**
```
buildLiurenBoard(options)
  1. dateToJd()              → jd
  2. computeFourPillars(jd)  → 四柱 (复用 bazi 的 pillar 逻辑或直接用 lunar API)
  3. resolveYuejiang(jd)     → 月将地支
  4. resolveGuiGodType()     → 阴阳贵人
  5. initPalaces()           → 地盘
  6. setTianpan()            → 天盘
  7. setGuiGods()            → 贵神
  8. setOuterGan()           → 外天干
  9. computeLegend()         → 三传
  10. computeDestiny()       → 时运命
```

> **四柱计算:** 从 `@yhjs/lunar` 导入干支计算函数。参考 `packages/bazi/src/pillar.ts` 中的 `computeFourPillars` 实现。可以直接复用 bazi 的函数，或在 board.ts 中用 lunar API 重新组装。优先尝试直接 import bazi 的 computeFourPillars；若不希望依赖 bazi，则从 lunar 的 `getYearGanZhi`、`getMonthGanZhi`、`getDayGanZhi`、`getHourGanZhi` 组装。

### Step 1: Write failing tests

```typescript
// packages/liuren/tests/board.test.ts
import { describe, expect, it } from 'vitest'
import { computeDestiny } from '../src/destiny'
import { buildLiurenBoard } from '../src/board'
import { ganZhi, zhi } from '@yhjs/bagua'

describe('destiny', () => {
  it('should compute time/destiny/live', () => {
    const result = computeDestiny(zhi('未'), zhi('亥'), zhi('酉'))
    expect(result.time.name).toBe('未')
    expect(result.destiny.name).toBe('亥')
    expect(result.live.name).toBe('酉')
  })

  it('should default live to hourZhi when not specified', () => {
    const result = computeDestiny(zhi('未'), zhi('亥'))
    expect(result.live.name).toBe('未')
  })
})

describe('buildLiurenBoard', () => {
  // 1985-03-15 14:00, keyGanZhi=癸丑 (日柱)
  // 四柱: 乙丑/己卯/癸丑/乙未
  // 月将: 亥(登明), 时支: 未(7)
  // 非伏吟
  it('should build a complete board for 1985-03-15 14:00', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1985, 2, 15, 14, 0, 0),
      keyGanZhi: ganZhi('癸丑'),
    })

    // meta
    expect(board.meta.yuejiangZhi.name).toBe('亥')
    expect(board.meta.isFuyin).toBe(false)

    // palaces
    expect(board.palaces).toHaveLength(12)
    // 天盘: 子宫→辰
    expect(board.palaces[0].tianpan.name).toBe('辰')
    // 贵神应存在
    expect(board.palaces.some(p => p.guiGod !== null)).toBe(true)
    // 外天干应存在
    expect(board.palaces.some(p => p.outerGan !== null)).toBe(true)

    // legend (干传: 巳酉丑, 支传: 巳酉丑)
    expect(board.legend.ganLegend[0].name).toBe('巳')
    expect(board.legend.ganLegend[1].name).toBe('酉')
    expect(board.legend.ganLegend[2].name).toBe('丑')

    // destiny
    expect(board.destiny.time.name).toBe('未')
    expect(board.destiny.destiny.name).toBe('亥')
  })

  // 伏吟场景: 1990-10-08 08:00, keyGanZhi=乙巳 (日柱)
  // 月将=辰, 时支=辰 → 伏吟
  it('should handle 伏吟 for 1990-10-08 08:00', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1990, 9, 8, 8, 0, 0),
      keyGanZhi: ganZhi('乙巳'),
    })

    expect(board.meta.isFuyin).toBe(true)
    // 伏吟时天盘=地盘
    for (let i = 0; i < 12; i++) {
      expect(board.palaces[i].tianpan.name).toBe(board.palaces[i].zhi.name)
    }
  })

  it('should use specified guiGodType', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1985, 2, 15, 14, 0, 0),
      keyGanZhi: ganZhi('癸丑'),
      guiGodType: 'yin',
    })
    expect(board.meta.guiGodType).toBe('yin')
  })

  it('should use specified shengXiao for destiny.live', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1985, 2, 15, 14, 0, 0),
      keyGanZhi: ganZhi('癸丑'),
      shengXiao: zhi('午'),
    })
    expect(board.destiny.live.name).toBe('午')
  })
})
```

### Step 2: Run tests to verify they fail

Run: `cd /Users/macbookair/Desktop/projects/sxwnl && pnpm --filter @yhjs/liuren test:run`
Expected: FAIL

### Step 3: Implement destiny.ts

```typescript
// packages/liuren/src/destiny.ts
import type { Zhi } from '@yhjs/bagua'
import type { DestinyResult } from './types'

/**
 * 计算时运命
 *
 * @param hourZhi - 时辰地支
 * @param yuejiangZhi - 月将地支
 * @param shengXiao - 宿命地支 (可选, 默认取 hourZhi)
 *
 * 参考: chengming-mobile liuren.js:129-139
 */
export function computeDestiny(
  hourZhi: Zhi,
  yuejiangZhi: Zhi,
  shengXiao?: Zhi,
): DestinyResult {
  return {
    time: hourZhi,
    destiny: yuejiangZhi,
    live: shengXiao ?? hourZhi,
  }
}
```

### Step 4: Implement board.ts

```typescript
// packages/liuren/src/board.ts
import type { GanZhi } from '@yhjs/bagua'
import type { LiurenBoard, LiurenOptions } from './types'
import { dateToJd, resolveYuejiang, initPalaces, setTianpan } from './yuejiang'
import { resolveGuiGodType, setGuiGods } from './guigod'
import { setOuterGan } from './outer'
import { computeLegend, isFuyin } from './legend'
import { computeDestiny } from './destiny'

// ---- 四柱计算 ----
// 需要从 lunar API 获取四柱。参考 bazi/pillar.ts 的实现。
// 如果 bazi 的 computeFourPillars 已导出, 可直接复用:
//   import { computeFourPillars } from '@yhjs/bazi'
// 否则, 从 @yhjs/lunar 逐个导入干支计算函数:
//   import { getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi } from '@yhjs/lunar'
//
// 实现时请查看 packages/bazi/src/pillar.ts 确定最佳导入方式。
// 下面用 computeFourPillars 作为占位, 需在实现时替换为实际可用的函数。

import { computeFourPillars } from './pillar'

/**
 * 大六壬排盘入口
 *
 * 纯函数流水线: 日期 → 四柱 → 月将 → 天盘 → 贵神 → 外天干 → 三传 → 时运命
 */
export function buildLiurenBoard(options: LiurenOptions): LiurenBoard {
  const { datetime, keyGanZhi, shengXiao, guiGodType: rawGuiGodType } = options

  // 1. 日期 → JD
  const jd = dateToJd(datetime)

  // 2. 四柱
  const fourPillars = computeFourPillars(jd)
  const hourZhi = fourPillars.hour.zhi

  // 3. 月将
  const yuejiangZhi = resolveYuejiang(jd)

  // 4. 阴阳贵人
  const resolvedGuiGodType = rawGuiGodType === 'yang' || rawGuiGodType === 'yin'
    ? rawGuiGodType
    : resolveGuiGodType(hourZhi)

  // 5. 地盘
  let palaces = initPalaces()

  // 6. 天盘
  palaces = setTianpan(palaces, yuejiangZhi, hourZhi)

  // 7. 贵神 (用 keyGanZhi 的天干查贵人表)
  palaces = setGuiGods(palaces, keyGanZhi.gan, yuejiangZhi, hourZhi, resolvedGuiGodType)

  // 8. 外天干
  palaces = setOuterGan(palaces, keyGanZhi, yuejiangZhi, hourZhi)

  // 9. 伏吟判断 + 三传
  const fuyin = isFuyin(palaces)
  const legend = computeLegend(palaces, keyGanZhi)

  // 10. 时运命
  const destiny = computeDestiny(hourZhi, yuejiangZhi, shengXiao)

  return {
    meta: {
      datetime,
      fourPillars: {
        year: fourPillars.year,
        month: fourPillars.month,
        day: fourPillars.day,
        hour: fourPillars.hour,
      },
      yuejiangZhi,
      keyGanZhi,
      guiGodType: resolvedGuiGodType,
      isFuyin: fuyin,
    },
    palaces,
    legend,
    destiny,
  }
}
```

> **关于 pillar.ts:** board.ts 需要一个 `computeFourPillars(jd)` 函数。有两个选择:
>
> **选项 A (推荐):** 创建 `packages/liuren/src/pillar.ts`，从 bazi 复制 `dateToJd` 和 `computeFourPillars` 的实现逻辑（只需几十行，调用 lunar API）。这避免了 liuren 依赖 bazi。
>
> **选项 B:** 直接依赖 `@yhjs/bazi`，导入其 `computeFourPillars`。但这引入了额外的包间依赖。
>
> 实现时参考 `packages/bazi/src/pillar.ts` 的代码, 创建 `packages/liuren/src/pillar.ts` 复制核心函数。

### Step 5: Create pillar.ts (复制自 bazi)

创建 `packages/liuren/src/pillar.ts`，从 `packages/bazi/src/pillar.ts` 复制 `computeFourPillars` 函数。只需要复制核心计算逻辑（约 50-80 行），不需要 bazi 特有的类型。

返回类型应为:
```typescript
interface FourPillars {
  year: GanZhi
  month: GanZhi
  day: GanZhi
  hour: GanZhi
}
```

从 bazi/pillar.ts 中复制 `computeFourPillars`，确保:
1. 导入路径使用 `@yhjs/lunar` 和 `@yhjs/bagua`
2. 返回类型匹配上述接口
3. `dateToJd` 已在 yuejiang.ts 中定义，不需要重复

### Step 6: Run tests

Run: `cd /Users/macbookair/Desktop/projects/sxwnl && pnpm --filter @yhjs/liuren test:run`
Expected: ALL PASS

> 如果四柱计算结果与预期不符, 参照 bazi 测试中已验证的预期值:
> - 1990-10-08 08:00 → 庚午/丙戌/乙巳/庚辰
> - 1985-03-15 14:00 → 乙丑/己卯/癸丑/乙未

### Step 7: Commit

```bash
git add packages/liuren/src/destiny.ts packages/liuren/src/board.ts packages/liuren/src/pillar.ts packages/liuren/tests/board.test.ts
git commit -m "feat(liuren): buildLiurenBoard 流水线 + 时运命"
```

---

## Task 7: 导出完善 + 端到端测试 + 构建验证

**Files:**
- Modify: `packages/liuren/src/index.ts`
- Create: `packages/liuren/tests/liuren.test.ts` (端到端)
- Verify build

### Step 1: Update index.ts with all exports

```typescript
// packages/liuren/src/index.ts
export type {
  GuiGodType,
  GuiGodInfo,
  ZhiPalace,
  LegendResult,
  DestinyResult,
  LiurenMeta,
  LiurenOptions,
  LiurenBoard,
} from './types'

export { buildLiurenBoard } from './board'

export { dateToJd, resolveYuejiang, initPalaces, setTianpan, YUEJIANG_NAMES } from './yuejiang'
export { resolveGuiGodType, setGuiGods, GUI_GOD_NAMES, GUI_GOD_SHORT_NAMES, GUIREN_TABLE } from './guigod'
export { setOuterGan } from './outer'
export { computeLegend, isFuyin, GAN_JIGONG, XING_TABLE } from './legend'
export { computeDestiny } from './destiny'
```

### Step 2: Write E2E test

```typescript
// packages/liuren/tests/liuren.test.ts
import { describe, expect, it } from 'vitest'
import { buildLiurenBoard } from '../src/board'
import { ganZhi, zhi } from '@yhjs/bagua'

describe('liuren E2E', () => {
  describe('1985-03-15 14:00 癸丑 (非伏吟)', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1985, 2, 15, 14, 0, 0),
      keyGanZhi: ganZhi('癸丑'),
    })

    it('meta should be correct', () => {
      expect(board.meta.yuejiangZhi.name).toBe('亥')
      expect(board.meta.guiGodType).toMatch(/^(yang|yin)$/)
      expect(board.meta.isFuyin).toBe(false)
      expect(board.meta.fourPillars.year.name).toBe('乙丑')
      expect(board.meta.fourPillars.day.name).toBe('癸丑')
    })

    it('palaces should have 12 entries with all fields', () => {
      expect(board.palaces).toHaveLength(12)
      for (const p of board.palaces) {
        expect(p.zhi).toBeDefined()
        expect(p.tianpan).toBeDefined()
        expect(p.guiGod).not.toBeNull()
        expect(p.outerGan).not.toBeNull()
      }
    })

    it('tianpan should follow yuejiang=亥 hourZhi=未 mapping', () => {
      expect(board.palaces[7].tianpan.name).toBe('亥')
      expect(board.palaces[0].tianpan.name).toBe('辰')
    })

    it('legend should be 巳酉丑 / 巳酉丑', () => {
      expect(board.legend.ganLegend.map(z => z.name)).toEqual(['巳', '酉', '丑'])
      expect(board.legend.zhiLegend.map(z => z.name)).toEqual(['巳', '酉', '丑'])
    })

    it('destiny should have time=未 destiny=亥', () => {
      expect(board.destiny.time.name).toBe('未')
      expect(board.destiny.destiny.name).toBe('亥')
    })
  })

  describe('1990-10-08 08:00 乙巳 (伏吟)', () => {
    const board = buildLiurenBoard({
      datetime: new Date(1990, 9, 8, 8, 0, 0),
      keyGanZhi: ganZhi('乙巳'),
    })

    it('should be 伏吟', () => {
      expect(board.meta.isFuyin).toBe(true)
    })

    it('tianpan should equal dipan for all palaces', () => {
      for (const p of board.palaces) {
        expect(p.tianpan.name).toBe(p.zhi.name)
      }
    })

    it('伏吟 legend should use 刑/冲 logic', () => {
      // 干传: 乙(1)→寄宫辰(4), step0=辰, step1=辰自刑→冲=戌, step2=戌刑未
      expect(board.legend.ganLegend[0].name).toBe('辰')
      expect(board.legend.ganLegend[1].name).toBe('戌')
      expect(board.legend.ganLegend[2].name).toBe('未')
    })
  })

  describe('custom options', () => {
    it('should respect guiGodType=yin', () => {
      const board = buildLiurenBoard({
        datetime: new Date(1985, 2, 15, 14, 0, 0),
        keyGanZhi: ganZhi('癸丑'),
        guiGodType: 'yin',
      })
      expect(board.meta.guiGodType).toBe('yin')
    })

    it('should respect shengXiao for destiny.live', () => {
      const board = buildLiurenBoard({
        datetime: new Date(1985, 2, 15, 14, 0, 0),
        keyGanZhi: ganZhi('癸丑'),
        shengXiao: zhi('午'),
      })
      expect(board.destiny.live.name).toBe('午')
    })
  })
})
```

### Step 3: Run all tests

Run: `cd /Users/macbookair/Desktop/projects/sxwnl && pnpm --filter @yhjs/liuren test:run`
Expected: ALL PASS

### Step 4: Verify build

Run: `cd /Users/macbookair/Desktop/projects/sxwnl/packages/liuren && npx tsc --noEmit`
Expected: PASS (可能有 vite-plugin-dts 警告，忽略)

Run: `cd /Users/macbookair/Desktop/projects/sxwnl/packages/liuren && npx vite build`
Expected: Build succeeds

### Step 5: Run project-wide tests

Run: `cd /Users/macbookair/Desktop/projects/sxwnl && pnpm test:run`
Expected: ALL packages pass (含 lunar, bagua, dunjia, bazi, liuren)

### Step 6: Commit

```bash
git add packages/liuren/src/index.ts packages/liuren/tests/liuren.test.ts
git commit -m "feat(liuren): 导出完善 + 端到端测试"
```

---

## 关键注意事项

### 导入路径确认

实现时务必确认以下导入在当前 monorepo 中可用:

```typescript
// 来自 @yhjs/lunar
import { gregorianToJD, J2000 } from '@yhjs/lunar'
import { calculateLunarYear } from '@yhjs/lunar'

// 来自 @yhjs/bagua
import { gan, zhi, ganZhi } from '@yhjs/bagua'
import type { Gan, Zhi, GanZhi } from '@yhjs/bagua'
```

如果顶层导出不包含某个函数，需要从子模块导入。参考:
- `packages/bazi/src/pillar.ts` 的 lunar 导入方式
- `packages/dunjia/src/board/common.ts` 的 lunar 导入方式

### 测试预期值调整

如果某个预期值（如月将地支、三传结果）与算法实际输出不符:
1. 先确认算法逻辑是否正确（对照源码 liuren.js）
2. 如果算法正确，调整测试预期值
3. **不要为了通过测试修改算法**

### 伏吟边界情况

伏吟时 `getNextLegend` 的 step 参数很关键:
- `step === 0`: 首传直接返回起点地支
- `step > 0`: 取相刑，自刑时回退到相冲

注意: 干传的首传起点是「寄宫地支」，支传的首传起点是「用神地支本身」。
