# P2: @yhjs/bazi 包实施计划 (Part 2: Task 5-7)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **Part 1:** `2026-02-24-p2-bazi-impl-part1.md` (Task 1-4)

---

## Task 5: 实现 liunian.ts — 流年 + 流月

**Files:**
- Create: `packages/bazi/src/liunian.ts`
- Create: `packages/bazi/tests/liunian.test.ts`

**背景知识（来自 chengming-mobile bazi.js:304-384）：**

**流年排布**：
- 从大运的起始年份开始，按干支表顺推（每年 ganZhi index +1）
- 每步大运 10 年，所以每步有 10 个流年
- 年干支起点 = 年柱干支 + 该大运起始年龄的偏移量
  - 实际上更简单：从出生年年柱开始，每年+1，大运只是分组方式
  - chengming-mobile: `curGan = yearGanzhi.gan.nextIndex(bigDestiny.list[index].age)`, `curZhi = yearGanzhi.zhi.nextIndex(age)`

**流月排布（五虎遁）**：
- 来源：`cmDate.js:903-923 getYearMonths`
- 根据流年的年干，用五虎遁推算 12 个月干支（从寅月开始）
- 五虎遁规则：`甲己之年丙作首` → 甲/己年的寅月天干为丙
  - 甲/己 → 丙寅起, 乙/庚 → 戊寅起, 丙/辛 → 庚寅起, 丁/壬 → 壬寅起, 戊/癸 → 甲寅起
  - 公式：`baseGanIndex = [2, 4, 6, 8, 0][yearGan.index % 5]`，寅月天干 = baseGanIndex
  - 从寅(index=2)开始，12 个月到丑(index=1)

**Step 1: 编写 liunian.ts**

```typescript
import type { Gan, GanZhi } from '@yhjs/bagua'
import { ganZhi, tenGod } from '@yhjs/bagua'
import type { DayunEntry, LiunianEntry, LiuyueEntry } from './types'

/**
 * 计算某步大运内的流年列表
 *
 * @param dayunEntry 大运条目
 * @param yearGanZhi 出生年柱干支
 * @param dayMaster 日主天干
 * @param birthYear 出生年份
 * @param nextDayunStartAge 下一步大运起始年龄（无则传 startAge + 10）
 * @returns 流年列表
 */
export function computeLiunian(
  dayunEntry: DayunEntry,
  yearGanZhi: GanZhi,
  dayMaster: Gan,
  birthYear: number,
  nextDayunStartAge?: number,
): readonly LiunianEntry[] {
  const endAge = nextDayunStartAge ?? dayunEntry.startAge + 10
  const result: LiunianEntry[] = []

  for (let age = dayunEntry.startAge; age < endAge; age++) {
    // 流年干支 = 年柱干支 + 年龄偏移
    const gzIndex = (yearGanZhi.index as number) + age
    const gz = ganZhi(gzIndex)

    result.push({
      ganZhi: gz,
      year: birthYear + age,
      age,
      tenGod: tenGod(dayMaster, gz.gan),
    })
  }

  return result
}

/**
 * 计算运前（大运前）的流年列表
 * 从出生到起运年龄之间的流年
 *
 * @param yearGanZhi 出生年柱干支
 * @param dayMaster 日主天干
 * @param birthYear 出生年份
 * @param startAge 起运年龄
 * @returns 运前流年列表
 */
export function computePreDayunLiunian(
  yearGanZhi: GanZhi,
  dayMaster: Gan,
  birthYear: number,
  startAge: number,
): readonly LiunianEntry[] {
  const result: LiunianEntry[] = []

  for (let age = 0; age < startAge; age++) {
    const gzIndex = (yearGanZhi.index as number) + age
    const gz = ganZhi(gzIndex)
    result.push({
      ganZhi: gz,
      year: birthYear + age,
      age,
      tenGod: tenGod(dayMaster, gz.gan),
    })
  }

  return result
}

/**
 * 五虎遁月干起始索引
 * 甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
 */
const TIGER_GAN_BASE = [2, 4, 6, 8, 0] as const

/**
 * 计算某年的 12 个流月干支（五虎遁）
 *
 * @param yearGan 该年的年干
 * @param dayMaster 日主天干
 * @returns 12 个流月（从寅月到丑月）
 */
export function computeLiuyue(
  yearGan: Gan,
  dayMaster: Gan,
): readonly LiuyueEntry[] {
  const baseGanIdx = TIGER_GAN_BASE[yearGan.index % 5]
  const result: LiuyueEntry[] = []

  for (let i = 0; i < 12; i++) {
    // 月支: 从寅(2)开始，寅=2, 卯=3, ... 丑=1
    const zhiIdx = (i + 2) % 12
    // 月干: baseGanIdx + i
    const ganIdx = (baseGanIdx + i) % 10
    // 查找六十甲子索引
    let gzIdx = -1
    for (let j = 0; j < 60; j++) {
      if (j % 10 === ganIdx && j % 12 === zhiIdx) {
        gzIdx = j
        break
      }
    }
    const gz = ganZhi(gzIdx)

    result.push({
      ganZhi: gz,
      monthIndex: i + 1, // 1=寅月, 2=卯月, ..., 12=丑月
      tenGod: tenGod(dayMaster, gz.gan),
    })
  }

  return result
}
```

**Step 2: 编写测试**

```typescript
// tests/liunian.test.ts
import { describe, expect, it } from 'vitest'
import { computeLiunian, computeLiuyue, computePreDayunLiunian } from '../src/liunian'
import { computeDayun } from '../src/dayun'
import { computeFourPillars, dateToJd } from '../src/pillar'
import { gan, ganZhi } from '@yhjs/bagua'

describe('liunian', () => {
  describe('computeLiunian', () => {
    it('should compute liunian for one dayun step', () => {
      // 1990年庚午年，男
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const pillars = computeFourPillars(jd)
      const dayun = computeDayun(
        pillars.month,
        pillars.day.gan,
        pillars.year.gan,
        '男',
        jd,
        1990,
      )

      const liunian = computeLiunian(
        dayun[0],
        pillars.year,
        pillars.day.gan,
        1990,
        dayun[1].startAge,
      )

      // 应该有 10 个流年
      expect(liunian).toHaveLength(10)

      // 每个流年都应该有 ganZhi, year, age, tenGod
      for (const entry of liunian) {
        expect(entry.ganZhi).toBeDefined()
        expect(entry.year).toBeGreaterThan(0)
        expect(entry.tenGod).toBeDefined()
      }

      // 流年干支应该连续递增
      for (let i = 1; i < liunian.length; i++) {
        const prevIdx = liunian[i - 1].ganZhi.index as number
        const curIdx = liunian[i].ganZhi.index as number
        expect((curIdx - prevIdx + 60) % 60).toBe(1)
      }
    })
  })

  describe('computePreDayunLiunian', () => {
    it('should compute liunian before dayun starts', () => {
      const result = computePreDayunLiunian(
        ganZhi('庚午'),
        gan('壬'),
        1990,
        5, // 假设 5 岁起运
      )

      expect(result).toHaveLength(5)
      expect(result[0].age).toBe(0)
      expect(result[0].year).toBe(1990)
      expect(result[4].age).toBe(4)
    })
  })

  describe('computeLiuyue', () => {
    it('should compute 12 months starting from 寅', () => {
      // 甲年: 丙寅, 丁卯, 戊辰, 己巳, 庚午, 辛未, 壬申, 癸酉, 甲戌, 乙亥, 丙子, 丁丑
      const result = computeLiuyue(gan('甲'), gan('壬'))

      expect(result).toHaveLength(12)
      expect(result[0].ganZhi.name).toBe('丙寅')
      expect(result[0].monthIndex).toBe(1) // 寅月
      expect(result[1].ganZhi.name).toBe('丁卯')
      expect(result[2].ganZhi.name).toBe('戊辰')
      expect(result[11].ganZhi.name).toBe('丁丑')
      expect(result[11].monthIndex).toBe(12) // 丑月
    })

    it('should follow five-tiger rule for 乙 year', () => {
      // 乙年: 戊寅, 己卯, ...
      const result = computeLiuyue(gan('乙'), gan('壬'))
      expect(result[0].ganZhi.name).toBe('戊寅')
      expect(result[1].ganZhi.name).toBe('己卯')
    })

    it('should follow five-tiger rule for 丙 year', () => {
      // 丙年: 庚寅, 辛卯, ...
      const result = computeLiuyue(gan('丙'), gan('壬'))
      expect(result[0].ganZhi.name).toBe('庚寅')
    })

    it('should follow five-tiger rule for 丁 year', () => {
      // 丁年: 壬寅, 癸卯, ...
      const result = computeLiuyue(gan('丁'), gan('壬'))
      expect(result[0].ganZhi.name).toBe('壬寅')
    })

    it('should follow five-tiger rule for 戊 year', () => {
      // 戊年: 甲寅, 乙卯, ...
      const result = computeLiuyue(gan('戊'), gan('壬'))
      expect(result[0].ganZhi.name).toBe('甲寅')
    })

    it('should compute tenGod for each month', () => {
      const result = computeLiuyue(gan('甲'), gan('壬'))
      // 丙对壬=偏财
      expect(result[0].tenGod.name).toBe('偏财')
    })
  })
})
```

**Step 3: 运行测试**

Run: `pnpm --filter @yhjs/bazi exec vitest run`
Expected: 全部通过

**Step 4: Commit**

```bash
git add packages/bazi/src/liunian.ts packages/bazi/tests/liunian.test.ts
git commit -m "feat(bazi): 实现流年流月计算 liunian.ts"
```

---

## Task 6: 实现 shensha.ts — 神煞

**Files:**
- Create: `packages/bazi/src/shensha.ts`
- Create: `packages/bazi/tests/shensha.test.ts`

**背景知识（来自 chengming-mobile timeGod.js）：**

**驿马**：
- `horseIndexList = [2, 11, 8, 5]`（寅=2, 亥=11, 申=8, 巳=5）
- 计算：`zhi.index % 4` 索引查表
- 规则口诀：寅午戌马在申(8), 亥卯未马在巳(5), 申子辰马在寅(2), 巳酉丑马在亥(11)

**空亡**：
- 直接使用 `GanZhi.kongWang` 属性（@yhjs/bagua 已提供）

**天乙贵人**：
- `guiGodList = [[1,7],[0,8],[11,9],[11,9],[1,7],[0,8],[1,7],[6,2],[5,3],[5,3]]`
- 按天干 index 查表，返回两个地支索引（阳贵/阴贵）
- 口诀：甲戊庚牛羊(丑未), 乙己鼠猴乡(子申), 丙丁猪鸡位(亥酉), 壬癸蛇兔藏(巳卯), 六辛逢马虎(午寅)

**旺相休囚死**：
- `seasonPowerList[月支五行][目标五行]`
- 5×5 矩阵，行=月令五行，列=五行(木火土金水)
- `['旺','相','死','囚','休']` 为木月(春)时各五行状态

**Step 1: 编写 shensha.ts**

```typescript
import type { Gan, GanZhi, Zhi } from '@yhjs/bagua'
import { zhi } from '@yhjs/bagua'
import type { ShenshaResult } from './types'

/**
 * 驿马表: 地支 index % 4 → 驿马地支 index
 * 申子辰→寅(2), 巳酉丑→亥(11), 寅午戌→申(8), 亥卯未→巳(5)
 */
const HORSE_INDEX_LIST = [2, 11, 8, 5] as const

/**
 * 天乙贵人表: 天干 index → [阳贵地支index, 阴贵地支index]
 */
const GUI_GOD_LIST: readonly (readonly [number, number])[] = [
  [1, 7],   // 甲 → 丑未
  [0, 8],   // 乙 → 子申
  [11, 9],  // 丙 → 亥酉
  [11, 9],  // 丁 → 亥酉
  [1, 7],   // 戊 → 丑未
  [0, 8],   // 己 → 子申
  [1, 7],   // 庚 → 丑未
  [6, 2],   // 辛 → 午寅
  [5, 3],   // 壬 → 巳卯
  [5, 3],   // 癸 → 巳卯
]

/**
 * 旺相休囚死矩阵
 * 行=月支五行(0木1火2土3金4水), 列=目标五行(0木1火2土3金4水)
 */
const SEASON_POWER_LIST: readonly (readonly string[])[] = [
  ['旺', '相', '死', '囚', '休'], // 木月(春)
  ['休', '旺', '相', '死', '囚'], // 火月(夏)
  ['囚', '休', '旺', '相', '死'], // 土月(四季)
  ['死', '囚', '休', '旺', '相'], // 金月(秋)
  ['相', '死', '囚', '休', '旺'], // 水月(冬)
]

/**
 * 计算单柱驿马
 */
export function computeHorse(ganZhi: GanZhi): Zhi {
  const horseIdx = HORSE_INDEX_LIST[ganZhi.zhi.index % 4]
  return zhi(horseIdx)
}

/**
 * 计算单柱天乙贵人（阳贵/阴贵）
 */
export function computeGuiren(ganZhi: GanZhi): readonly [Zhi, Zhi] {
  const [yangIdx, yinIdx] = GUI_GOD_LIST[ganZhi.gan.index]
  return [zhi(yangIdx), zhi(yinIdx)]
}

/**
 * 计算旺相休囚死
 * @param monthZhi 月支（月令）
 * @returns 五行状态数组，索引对应 Wuxing 枚举 (木=0,火=1,土=2,金=3,水=4)
 */
export function computeSeasonPower(monthZhi: Zhi): readonly string[] {
  return SEASON_POWER_LIST[monthZhi.wuxing]
}

/**
 * 计算四柱神煞
 *
 * @param yearGanZhi 年柱
 * @param monthGanZhi 月柱
 * @param dayGanZhi 日柱
 * @param hourGanZhi 时柱
 * @returns 神煞结果
 */
export function computeShensha(
  yearGanZhi: GanZhi,
  monthGanZhi: GanZhi,
  dayGanZhi: GanZhi,
  hourGanZhi: GanZhi,
): ShenshaResult {
  const pillars = [yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi]

  return {
    horses: pillars.map(p => computeHorse(p)),
    kongWang: pillars.map(p => p.kongWang),
    guiren: pillars.map(p => computeGuiren(p)),
    seasonPower: computeSeasonPower(monthGanZhi.zhi),
  }
}
```

**Step 2: 编写测试**

```typescript
// tests/shensha.test.ts
import { describe, expect, it } from 'vitest'
import { computeGuiren, computeHorse, computeSeasonPower, computeShensha } from '../src/shensha'
import { ganZhi, zhi, Wuxing } from '@yhjs/bagua'

describe('shensha', () => {
  describe('computeHorse', () => {
    it('寅午戌马在申', () => {
      expect(computeHorse(ganZhi('甲寅')).name).toBe('申')
      expect(computeHorse(ganZhi('庚午')).name).toBe('申')
      expect(computeHorse(ganZhi('甲戌')).name).toBe('申')
    })

    it('亥卯未马在巳', () => {
      expect(computeHorse(ganZhi('乙亥')).name).toBe('巳')
      expect(computeHorse(ganZhi('乙卯')).name).toBe('巳')
      expect(computeHorse(ganZhi('乙未')).name).toBe('巳')
    })

    it('申子辰马在寅', () => {
      expect(computeHorse(ganZhi('壬申')).name).toBe('寅')
      expect(computeHorse(ganZhi('甲子')).name).toBe('寅')
      expect(computeHorse(ganZhi('甲辰')).name).toBe('寅')
    })

    it('巳酉丑马在亥', () => {
      expect(computeHorse(ganZhi('己巳')).name).toBe('亥')
      expect(computeHorse(ganZhi('辛酉')).name).toBe('亥')
      expect(computeHorse(ganZhi('乙丑')).name).toBe('亥')
    })
  })

  describe('computeGuiren', () => {
    it('甲→丑未', () => {
      const [yang, yin] = computeGuiren(ganZhi('甲子'))
      expect(yang.name).toBe('丑')
      expect(yin.name).toBe('未')
    })

    it('乙→子申', () => {
      const [yang, yin] = computeGuiren(ganZhi('乙丑'))
      expect(yang.name).toBe('子')
      expect(yin.name).toBe('申')
    })

    it('丙→亥酉', () => {
      const [yang, yin] = computeGuiren(ganZhi('丙寅'))
      expect(yang.name).toBe('亥')
      expect(yin.name).toBe('酉')
    })

    it('辛→午寅', () => {
      const [yang, yin] = computeGuiren(ganZhi('辛酉'))
      expect(yang.name).toBe('午')
      expect(yin.name).toBe('寅')
    })

    it('壬→巳卯', () => {
      const [yang, yin] = computeGuiren(ganZhi('壬戌'))
      expect(yang.name).toBe('巳')
      expect(yin.name).toBe('卯')
    })
  })

  describe('computeSeasonPower', () => {
    it('木月(春): 木旺火相土死金囚水休', () => {
      // 寅月=木
      const power = computeSeasonPower(zhi('寅'))
      expect(power[Wuxing.木]).toBe('旺')
      expect(power[Wuxing.火]).toBe('相')
      expect(power[Wuxing.土]).toBe('死')
      expect(power[Wuxing.金]).toBe('囚')
      expect(power[Wuxing.水]).toBe('休')
    })

    it('金月(秋): 金旺水相木死火囚土休', () => {
      // 酉月=金
      const power = computeSeasonPower(zhi('酉'))
      expect(power[Wuxing.金]).toBe('旺')
      expect(power[Wuxing.水]).toBe('相')
      expect(power[Wuxing.木]).toBe('死')
      expect(power[Wuxing.火]).toBe('囚')
      expect(power[Wuxing.土]).toBe('休')
    })
  })

  describe('computeShensha', () => {
    it('should compute shensha for all four pillars', () => {
      const result = computeShensha(
        ganZhi('庚午'),
        ganZhi('乙酉'),
        ganZhi('壬戌'),
        ganZhi('甲辰'),
      )

      // 四柱各有驿马
      expect(result.horses).toHaveLength(4)
      // 午=寅午戌→马在申
      expect(result.horses[0]!.name).toBe('申')
      // 酉=巳酉丑→马在亥
      expect(result.horses[1]!.name).toBe('亥')

      // 空亡来自 GanZhi.kongWang
      expect(result.kongWang).toHaveLength(4)
      expect(result.kongWang[0]).toHaveLength(2)

      // 贵人
      expect(result.guiren).toHaveLength(4)
      // 庚→丑未
      expect(result.guiren[0][0].name).toBe('丑')
      expect(result.guiren[0][1].name).toBe('未')

      // 旺相休囚死 (酉月=金)
      expect(result.seasonPower[Wuxing.金]).toBe('旺')
    })
  })
})
```

**Step 3: 运行测试**

Run: `pnpm --filter @yhjs/bazi exec vitest run`
Expected: 全部通过

**Step 4: Commit**

```bash
git add packages/bazi/src/shensha.ts packages/bazi/tests/shensha.test.ts
git commit -m "feat(bazi): 实现神煞计算 shensha.ts"
```

---

## Task 7: 实现 bazi.ts 主类 + index.ts + 端到端测试

**Files:**
- Create: `packages/bazi/src/bazi.ts`
- Modify: `packages/bazi/src/index.ts` (完善导出)
- Create: `packages/bazi/tests/bazi.test.ts`

**背景知识：**

Bazi 主类使用私有构造器 + 静态工厂方法模式（与项目约定一致）。

组合流程：
1. `Bazi.create(options)` → dateToJd → computeFourPillars → buildAllPillars → computeDayun → computeShensha → freeze → new Bazi()
2. `Bazi.from(data)` → 从序列化数据恢复

**Step 1: 编写 bazi.ts**

```typescript
import type { Gan, GanZhi, Zhi } from '@yhjs/bagua'
import { computeFourPillars, dateToJd } from './pillar'
import type { BuiltPillars } from './analysis'
import { buildAllPillars } from './analysis'
import { computeDayun } from './dayun'
import { computeLiunian, computeLiuyue, computePreDayunLiunian } from './liunian'
import { computeShensha } from './shensha'
import type {
  BaziMeta,
  BaziOptions,
  BaziBoardData,
  DayunEntry,
  Gender,
  LiunianEntry,
  LiuyueEntry,
  Pillar,
  ShenshaResult,
} from './types'

/**
 * 八字排盘主类
 *
 * 使用私有构造器，通过 Bazi.create() 或 Bazi.from() 创建实例。
 *
 * @example
 * ```ts
 * const bazi = Bazi.create({
 *   datetime: new Date(1990, 9, 8, 8, 0, 0),
 *   gender: '男',
 * })
 *
 * console.log(bazi.dayMaster.name) // '壬'
 * console.log(bazi.year.ganZhi.name) // '庚午'
 * ```
 */
export class Bazi {
  private readonly _meta: BaziMeta
  private readonly _pillars: BuiltPillars
  private readonly _dayun: readonly DayunEntry[]
  private readonly _jd: number

  private constructor(
    meta: BaziMeta,
    pillars: BuiltPillars,
    dayun: readonly DayunEntry[],
    jd: number,
  ) {
    this._meta = meta
    this._pillars = pillars
    this._dayun = dayun
    this._jd = jd
  }

  /**
   * 创建八字实例
   */
  static create(options: BaziOptions): Bazi {
    const { datetime, gender } = options
    const jd = dateToJd(datetime)
    const birthYear = datetime.getFullYear()

    // 1. 计算四柱干支
    const fourPillars = computeFourPillars(jd)

    // 2. 构建四柱（含十神和藏干展开）
    const pillars = buildAllPillars(fourPillars)

    // 3. 计算大运
    const dayMaster = fourPillars.day.gan
    const dayun = computeDayun(
      fourPillars.month,
      dayMaster,
      fourPillars.year.gan,
      gender,
      jd,
      birthYear,
    )

    // 4. 构建元数据
    const meta: BaziMeta = {
      datetime,
      gender,
      dayMaster,
      yinYangDun: fourPillars.year.gan.yinyang === '阳' ? '阳' : '阴',
      startAge: dayun[0].startAge,
      kongWang: fourPillars.day.kongWang,
    }

    return new Bazi(meta, pillars, dayun, jd)
  }

  // === 四柱 getter ===

  get year(): Pillar { return this._pillars.year }
  get month(): Pillar { return this._pillars.month }
  get day(): Pillar { return this._pillars.day }
  get hour(): Pillar { return this._pillars.hour }
  get dayMaster(): Gan { return this._meta.dayMaster }
  get meta(): BaziMeta { return this._meta }

  // === 大运 ===

  get dayun(): readonly DayunEntry[] { return this._dayun }

  // === 流年 ===

  /**
   * 获取某步大运的流年列表
   * @param dayunIndex 大运索引 (0-8)
   */
  getLiunian(dayunIndex: number): readonly LiunianEntry[] {
    if (dayunIndex < 0 || dayunIndex >= this._dayun.length) {
      throw new RangeError(`大运索引超出范围: ${dayunIndex}`)
    }

    const nextStartAge = dayunIndex + 1 < this._dayun.length
      ? this._dayun[dayunIndex + 1].startAge
      : this._dayun[dayunIndex].startAge + 10

    return computeLiunian(
      this._dayun[dayunIndex],
      this._pillars.year.ganZhi,
      this._meta.dayMaster,
      this._meta.datetime.getFullYear(),
      nextStartAge,
    )
  }

  /**
   * 获取运前流年（出生到起运之间）
   */
  getPreDayunLiunian(): readonly LiunianEntry[] {
    return computePreDayunLiunian(
      this._pillars.year.ganZhi,
      this._meta.dayMaster,
      this._meta.datetime.getFullYear(),
      this._meta.startAge,
    )
  }

  // === 流月 ===

  /**
   * 获取某年的 12 个流月
   * @param yearGan 该年的年干
   */
  getLiuyue(yearGan: Gan): readonly LiuyueEntry[] {
    return computeLiuyue(yearGan, this._meta.dayMaster)
  }

  // === 神煞 ===

  /**
   * 获取四柱神煞
   */
  getShensha(): ShenshaResult {
    return computeShensha(
      this._pillars.year.ganZhi,
      this._pillars.month.ganZhi,
      this._pillars.day.ganZhi,
      this._pillars.hour.ganZhi,
    )
  }

  // === 序列化 ===

  toJSON(): BaziBoardData {
    return {
      meta: {
        datetime: this._meta.datetime,
        gender: this._meta.gender,
        dayMaster: this._meta.dayMaster.name,
        yinYangDun: this._meta.yinYangDun,
        startAge: this._meta.startAge,
        kongWang: [this._meta.kongWang[0].name, this._meta.kongWang[1].name],
      },
      pillars: {
        year: this._pillars.year,
        month: this._pillars.month,
        day: this._pillars.day,
        hour: this._pillars.hour,
      },
      dayun: this._dayun,
    }
  }
}
```

**Step 2: 完善 index.ts 导出**

```typescript
// @yhjs/bazi - 八字排盘库

// 主类
export { Bazi } from './bazi'

// 类型
export type {
  BaziMeta,
  BaziOptions,
  BaziBoardData,
  DayunEntry,
  Gender,
  HiddenGodEntry,
  LiunianEntry,
  LiuyueEntry,
  Pillar,
  ShenshaResult,
} from './types'

// 工具函数（高级用户可直接调用）
export { computeFourPillars, dateToJd } from './pillar'
export type { FourPillars } from './pillar'
export { buildAllPillars, buildPillar } from './analysis'
export type { BuiltPillars } from './analysis'
export { computeDayun, isDayunReverse, findTargetJie } from './dayun'
export { computeLiunian, computeLiuyue, computePreDayunLiunian } from './liunian'
export { computeShensha, computeHorse, computeGuiren, computeSeasonPower } from './shensha'
```

**Step 3: 编写端到端测试**

```typescript
// tests/bazi.test.ts
import { describe, expect, it } from 'vitest'
import { Bazi } from '../src/bazi'
import { Wuxing } from '@yhjs/bagua'

describe('Bazi', () => {
  describe('Bazi.create', () => {
    // 用例 1: 1990-10-08 08:00 男 → 庚午 乙酉 壬戌 甲辰
    it('should create bazi for 1990-10-08 08:00 male', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      // 四柱
      expect(bazi.year.ganZhi.name).toBe('庚午')
      expect(bazi.month.ganZhi.name).toBe('乙酉')
      expect(bazi.day.ganZhi.name).toBe('壬戌')
      expect(bazi.hour.ganZhi.name).toBe('甲辰')

      // 日主
      expect(bazi.dayMaster.name).toBe('壬')

      // 十神
      expect(bazi.year.tenGod!.name).toBe('偏印') // 庚对壬
      expect(bazi.month.tenGod!.name).toBe('伤官') // 乙对壬
      expect(bazi.day.tenGod).toBeNull() // 日柱自身
      expect(bazi.hour.tenGod!.name).toBe('食神') // 甲对壬

      // 藏干
      expect(bazi.year.hiddenGods.length).toBeGreaterThan(0)

      // 元数据
      expect(bazi.meta.gender).toBe('男')
      expect(bazi.meta.dayMaster.name).toBe('壬')
      expect(bazi.meta.yinYangDun).toBe('阳') // 庚=阳
    })

    // 用例 2: 1985-03-15 14:00 女 → 乙丑 己卯 壬辰 丁未
    it('should create bazi for 1985-03-15 14:00 female', () => {
      const bazi = Bazi.create({
        datetime: new Date(1985, 2, 15, 14, 0, 0),
        gender: '女',
      })

      expect(bazi.year.ganZhi.name).toBe('乙丑')
      expect(bazi.month.ganZhi.name).toBe('己卯')
      expect(bazi.day.ganZhi.name).toBe('壬辰')
      expect(bazi.hour.ganZhi.name).toBe('丁未')
      expect(bazi.dayMaster.name).toBe('壬')
      expect(bazi.meta.yinYangDun).toBe('阴') // 乙=阴
    })
  })

  describe('dayun', () => {
    it('should have 9 steps', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      expect(bazi.dayun).toHaveLength(9)
    })

    it('should be forward for yang-male (庚男)', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      // 庚(阳)+男=顺，月柱乙酉顺推: 丙戌, 丁亥, ...
      expect(bazi.dayun[0].ganZhi.name).toBe('丙戌')
      expect(bazi.dayun[1].ganZhi.name).toBe('丁亥')
    })

    it('should be reverse for yin-male (乙男)', () => {
      const bazi = Bazi.create({
        datetime: new Date(1985, 2, 15, 14, 0, 0),
        gender: '男',
      })

      // 乙(阴)+男=逆，月柱己卯逆推: 戊寅, 丁丑, ...
      expect(bazi.dayun[0].ganZhi.name).toBe('戊寅')
      expect(bazi.dayun[1].ganZhi.name).toBe('丁丑')
    })

    it('dayun startAge should increase by 10', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      for (let i = 1; i < bazi.dayun.length; i++) {
        expect(bazi.dayun[i].startAge - bazi.dayun[i - 1].startAge).toBe(10)
      }
    })
  })

  describe('liunian', () => {
    it('should return 10 liunian entries per dayun step', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      const liunian = bazi.getLiunian(0)
      expect(liunian).toHaveLength(10)
    })

    it('should have continuous ganZhi', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      const liunian = bazi.getLiunian(0)
      for (let i = 1; i < liunian.length; i++) {
        const prev = liunian[i - 1].ganZhi.index as number
        const cur = liunian[i].ganZhi.index as number
        expect((cur - prev + 60) % 60).toBe(1)
      }
    })

    it('should throw for invalid index', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      expect(() => bazi.getLiunian(-1)).toThrow()
      expect(() => bazi.getLiunian(9)).toThrow()
    })
  })

  describe('liuyue', () => {
    it('should return 12 months', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      const liunian = bazi.getLiunian(0)
      const liuyue = bazi.getLiuyue(liunian[0].ganZhi.gan)
      expect(liuyue).toHaveLength(12)
      // 第一个月是寅月
      expect(liuyue[0].ganZhi.zhi.name).toBe('寅')
      expect(liuyue[0].monthIndex).toBe(1)
    })
  })

  describe('shensha', () => {
    it('should compute shensha', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      const shensha = bazi.getShensha()
      expect(shensha.horses).toHaveLength(4)
      expect(shensha.kongWang).toHaveLength(4)
      expect(shensha.guiren).toHaveLength(4)
      expect(shensha.seasonPower).toHaveLength(5)

      // 酉月=金月
      expect(shensha.seasonPower[Wuxing.金]).toBe('旺')
    })
  })

  describe('toJSON', () => {
    it('should serialize to BaziBoardData', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      const data = bazi.toJSON()
      expect(data.meta.gender).toBe('男')
      expect(data.meta.dayMaster).toBe('壬')
      expect(data.pillars.year.ganZhi.name).toBe('庚午')
      expect(data.dayun).toHaveLength(9)
    })
  })

  describe('pre-dayun liunian', () => {
    it('should return liunian from birth to startAge', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      const preLiunian = bazi.getPreDayunLiunian()
      expect(preLiunian.length).toBe(bazi.meta.startAge)
      if (preLiunian.length > 0) {
        expect(preLiunian[0].age).toBe(0)
        expect(preLiunian[0].year).toBe(1990)
      }
    })
  })
})
```

**Step 4: 运行全量测试**

Run: `pnpm --filter @yhjs/bazi exec vitest run`
Expected: 全部通过

**Step 5: 构建验证**

Run: `pnpm --filter @yhjs/bazi run build`
Expected: 构建成功

**Step 6: 全项目测试**

Run: `pnpm --filter @yhjs/bagua exec vitest run && pnpm --filter @yhjs/lunar exec vitest run && pnpm --filter @yhjs/dunjia exec vitest run && pnpm --filter @yhjs/bazi exec vitest run`
Expected: 全部通过

**Step 7: Commit**

```bash
git add packages/bazi/
git commit -m "feat(bazi): 实现 Bazi 主类和完整端到端测试"
```

---

## 验证清单

P2 完成后，应满足以下条件：

- [ ] `@yhjs/bazi` 可独立构建和测试
- [ ] `Bazi.create()` 能正确排出四柱、大运、流年、流月
- [ ] 大运顺逆判断正确（阳男阴女顺，阴男阳女逆）
- [ ] 大运起运年龄计算合理（与 chengming-mobile 交叉验证）
- [ ] 四柱十神计算正确
- [ ] 藏干展开正确
- [ ] 神煞（驿马/空亡/贵人/旺相休囚死）规则正确
- [ ] 流年干支连续递增
- [ ] 流月符合五虎遁规则
- [ ] `toJSON()` 序列化结构完整
- [ ] 全项目 `pnpm test` 通过（bagua + lunar + dunjia + bazi）
- [ ] `pnpm --filter @yhjs/bazi run build` 构建成功
