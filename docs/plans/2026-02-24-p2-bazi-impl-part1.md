# P2: @yhjs/bazi 包实施计划 (Part 1: Task 1-4)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **Part 2:** `2026-02-24-p2-bazi-impl-part2.md` (Task 5-7)

**Goal:** 创建 `@yhjs/bazi` 八字排盘包，从 chengming-mobile 迁移四柱、大运、流年、神煞算法。

**Architecture:** bazi 依赖 `@yhjs/lunar`（日历计算）和 `@yhjs/bagua`（术数基础）。纯函数 + 私有构造器静态工厂模式。pillar 负责四柱计算，analysis 负责十神展开，dayun/liunian 负责运程，shensha 负责神煞，bazi.ts 组合为主类。

**Tech Stack:** TypeScript 5.9+, Vite 7.3 (library mode), Vitest 4.0, pnpm workspace

**源代码参考（chengming-mobile）：**
- `class/stage/bazi.js` — 八字主类（大运/流年/流月）
- `class/date/cmDate.js` — 四柱构建（`initGanzhi`）
- `class/relation/timeGod.js` — 神煞规则
- `class/relation/relationSettings.js` — 十神/关系规则

**关键依赖 API：**
- `@yhjs/lunar`: `gregorianToJD`, `J2000`, `getYearGanZhi(jd)`, `getMonthGanZhi(jd)`, `getDayGanZhi(jd)`, `getHourGanZhi(jd)`, `calculateLunarYear(jd)`, `SOLAR_TERM_NAMES`
- `@yhjs/bagua`: `GanZhi`, `Gan`, `Zhi`, `ganZhi()`, `tenGod()`, `twelveState()`, `wuxingRelation()`

**注意：** 所有 lunar 函数的 `jd` 参数是 **J2000 相对儒略日**（即 `绝对JD - 2451545`），不是绝对儒略日。`gregorianToJD` 返回**绝对 JD**，使用时需 `- J2000`。

---

## Task 1: 创建 bazi 包骨架 + types.ts

**Files:**
- Create: `packages/bazi/package.json`
- Create: `packages/bazi/tsconfig.json`
- Create: `packages/bazi/vite.config.ts`
- Create: `packages/bazi/vitest.config.ts`
- Create: `packages/bazi/src/types.ts`
- Create: `packages/bazi/src/index.ts`
- Modify: `tsconfig.base.json` (添加 bazi paths)

**Step 1: 创建 package.json**

```json
{
  "name": "@yhjs/bazi",
  "type": "module",
  "version": "0.1.0",
  "description": "八字排盘库 - 四柱/大运/流年/神煞计算",
  "author": "",
  "license": "MIT",
  "homepage": "https://github.com/yihai-js/yihai-bagua#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/yihai-js/yihai-bagua.git",
    "directory": "packages/bazi"
  },
  "keywords": ["bazi", "four-pillars", "八字", "四柱", "大运", "命理"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "engines": { "node": ">=16.0.0" },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@yhjs/bagua": "workspace:*",
    "@yhjs/lunar": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^25.0.9",
    "vite-plugin-dts": "^4.5.4"
  }
}
```

**Step 2: 创建 tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: 创建 vite.config.ts**

```typescript
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/**/*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es')
          return 'index.js'
        return 'index.cjs'
      },
    },
    rollupOptions: {
      external: [/@yhjs\/lunar/, /@yhjs\/bagua/],
      output: {
        exports: 'named',
      },
    },
  },
  resolve: {
    alias: {
      '@yhjs/lunar': resolve(__dirname, '../lunar/src'),
      '@yhjs/bagua': resolve(__dirname, '../bagua/src'),
    },
  },
})
```

**Step 4: 创建 vitest.config.ts**

```typescript
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@yhjs/lunar': resolve(__dirname, '../lunar/src'),
      '@yhjs/bagua': resolve(__dirname, '../bagua/src'),
    },
  },
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['tests/**', '*.config.ts'],
    },
  },
})
```

**Step 5: 创建 src/types.ts**

```typescript
import type { Gan, GanZhi, TenGod, Zhi } from '@yhjs/bagua'

/** 性别 */
export type Gender = '男' | '女'

/**
 * 四柱（年/月/日/时柱）
 */
export interface Pillar {
  /** 干支 */
  readonly ganZhi: GanZhi
  /** 天干十神（日柱自身为 null） */
  readonly tenGod: TenGod | null
  /** 地支藏干展开 */
  readonly hiddenGods: readonly HiddenGodEntry[]
}

/**
 * 藏干十神条目
 */
export interface HiddenGodEntry {
  /** 藏干 */
  readonly gan: Gan
  /** 藏干十神 */
  readonly tenGod: TenGod
  /** 权重 */
  readonly weight: 'main' | 'middle' | 'minor'
}

/**
 * 大运条目
 */
export interface DayunEntry {
  /** 干支 */
  readonly ganZhi: GanZhi
  /** 起运年龄 */
  readonly startAge: number
  /** 起运公历年份 */
  readonly startYear: number
  /** 天干十神（相对日主） */
  readonly tenGod: TenGod
}

/**
 * 流年条目
 */
export interface LiunianEntry {
  /** 干支 */
  readonly ganZhi: GanZhi
  /** 公历年份 */
  readonly year: number
  /** 虚岁年龄 */
  readonly age: number
  /** 天干十神（相对日主） */
  readonly tenGod: TenGod
}

/**
 * 流月条目
 */
export interface LiuyueEntry {
  /** 干支 */
  readonly ganZhi: GanZhi
  /** 月份（1=寅月, 2=卯月, ... 12=丑月） */
  readonly monthIndex: number
  /** 天干十神（相对日主） */
  readonly tenGod: TenGod
}

/**
 * 神煞结果
 */
export interface ShenshaResult {
  /** 四柱驿马（地支） */
  readonly horses: readonly (Zhi | null)[]
  /** 四柱空亡（各柱旬空两地支） */
  readonly kongWang: readonly (readonly [Zhi, Zhi])[]
  /** 四柱天乙贵人（各柱的阳贵/阴贵地支） */
  readonly guiren: readonly (readonly [Zhi, Zhi])[]
  /** 旺相休囚死（月令五行决定的五行状态） */
  readonly seasonPower: readonly string[]
}

/**
 * 八字元数据
 */
export interface BaziMeta {
  /** 起局时间 */
  readonly datetime: Date
  /** 性别 */
  readonly gender: Gender
  /** 日主天干 */
  readonly dayMaster: Gan
  /** 阴阳遁（年干阴阳） */
  readonly yinYangDun: '阳' | '阴'
  /** 起运年龄 */
  readonly startAge: number
  /** 日柱旬空 */
  readonly kongWang: readonly [Zhi, Zhi]
}

/**
 * Bazi.create() 创建选项
 */
export interface BaziOptions {
  /** 出生日期时间 */
  datetime: Date
  /** 性别 */
  gender: Gender
}

/**
 * 序列化后的八字数据
 */
export interface BaziBoardData {
  meta: Omit<BaziMeta, 'datetime' | 'dayMaster' | 'kongWang'> & {
    datetime: Date | string
    dayMaster: string
    kongWang: readonly [string, string]
  }
  pillars: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar
  }
  dayun: readonly DayunEntry[]
}
```

**Step 6: 创建 src/index.ts（占位）**

```typescript
// @yhjs/bazi - 八字排盘库
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
```

**Step 7: 更新 tsconfig.base.json paths**

在 `compilerOptions.paths` 中添加 bazi 映射：

```json
"@yhjs/bazi": ["./packages/bazi/src"]
```

**Step 8: 安装依赖并验证**

Run: `pnpm install`
Expected: 依赖安装成功

Run: `pnpm --filter @yhjs/bazi run build`
Expected: 构建成功

**Step 9: Commit**

```bash
git add packages/bazi/ tsconfig.base.json pnpm-lock.yaml
git commit -m "feat(bazi): 创建 @yhjs/bazi 包骨架和类型定义"
```

---

## Task 2: 实现 pillar.ts — 四柱计算

**Files:**
- Create: `packages/bazi/src/pillar.ts`
- Create: `packages/bazi/tests/pillar.test.ts`

**背景知识：**

四柱（年月日时柱）直接调用 `@yhjs/lunar` 的四个干支函数获取。关键：
- 所有函数接受 **J2000 相对 JD**（`jd = gregorianToJD(y,m,d) - J2000`）
- 年柱以立春为界
- 月柱以节气（节）为界
- 日柱以 2000-01-07 甲子日为基准
- 时柱从 JD 小数部分推算

`getHourGanZhi(jd)` 需要精确的时分信息编码进 JD 中。`gregorianToJD(y,m,d)` 的 `d` 可以是浮点数来包含时分信息。

**Step 1: 编写 pillar.ts**

```typescript
import type { GanZhi } from '@yhjs/bagua'
import {
  getDayGanZhi,
  getHourGanZhi,
  getMonthGanZhi,
  getYearGanZhi,
  gregorianToJD,
  J2000,
} from '@yhjs/lunar'

/**
 * 四柱干支原始结果
 */
export interface FourPillars {
  readonly year: GanZhi
  readonly month: GanZhi
  readonly day: GanZhi
  readonly hour: GanZhi
}

/**
 * 将 Date 对象转为 J2000 相对儒略日
 */
export function dateToJd(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate() + date.getHours() / 24 + date.getMinutes() / 1440 + date.getSeconds() / 86400
  return gregorianToJD(y, m, d) - J2000
}

/**
 * 计算四柱干支
 * @param jd J2000 相对儒略日
 */
export function computeFourPillars(jd: number): FourPillars {
  return {
    year: getYearGanZhi(jd),
    month: getMonthGanZhi(jd),
    day: getDayGanZhi(jd),
    hour: getHourGanZhi(jd),
  }
}
```

**Step 2: 编写测试**

```typescript
// tests/pillar.test.ts
import { describe, expect, it } from 'vitest'
import { computeFourPillars, dateToJd } from '../src/pillar'

describe('pillar', () => {
  describe('dateToJd', () => {
    it('should convert 2000-01-01 12:00 to JD 0', () => {
      const jd = dateToJd(new Date(2000, 0, 1, 12, 0, 0))
      expect(Math.abs(jd)).toBeLessThan(0.01) // J2000 epoch
    })
  })

  describe('computeFourPillars', () => {
    // 1990-10-08 08:00 → 庚午年 乙酉月 壬戌日 甲辰时
    it('should compute 1990-10-08 08:00 correctly', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const pillars = computeFourPillars(jd)
      expect(pillars.year.name).toBe('庚午')
      expect(pillars.month.name).toBe('乙酉')
      expect(pillars.day.name).toBe('壬戌')
      expect(pillars.hour.name).toBe('甲辰')
    })

    // 1985-03-15 14:00 → 乙丑年 己卯月 壬辰日 丁未时
    it('should compute 1985-03-15 14:00 correctly', () => {
      const jd = dateToJd(new Date(1985, 2, 15, 14, 0, 0))
      const pillars = computeFourPillars(jd)
      expect(pillars.year.name).toBe('乙丑')
      expect(pillars.month.name).toBe('己卯')
      expect(pillars.day.name).toBe('壬辰')
      expect(pillars.hour.name).toBe('丁未')
    })

    // 2000-01-01 00:30 (子时) → 己卯年 丙子月 戊午日 壬子时
    it('should compute 2000-01-01 00:30 correctly', () => {
      const jd = dateToJd(new Date(2000, 0, 1, 0, 30, 0))
      const pillars = computeFourPillars(jd)
      expect(pillars.year.name).toBe('己卯')
      expect(pillars.month.name).toBe('丙子')
      expect(pillars.day.name).toBe('戊午')
      expect(pillars.hour.name).toBe('壬子')
    })

    // 立春前后测试：2024-02-04 前应该是癸卯年，立春后是甲辰年
    // 2024立春约在 2024-02-04 16:27
    it('should handle lichun boundary for year pillar', () => {
      // 2024-02-04 10:00 (立春前)
      const jdBefore = dateToJd(new Date(2024, 1, 4, 10, 0, 0))
      const pillarsBefore = computeFourPillars(jdBefore)
      expect(pillarsBefore.year.name).toBe('癸卯')

      // 2024-02-04 18:00 (立春后)
      const jdAfter = dateToJd(new Date(2024, 1, 4, 18, 0, 0))
      const pillarsAfter = computeFourPillars(jdAfter)
      expect(pillarsAfter.year.name).toBe('甲辰')
    })

    // 23时后测试（子时，日柱应+1）
    it('should handle 23:00+ (zi shi next day)', () => {
      // 2000-01-01 23:30 → 时辰进入次日子时
      const jd = dateToJd(new Date(2000, 0, 1, 23, 30, 0))
      const pillars = computeFourPillars(jd)
      // 23:30 的时柱应该是子时
      expect(pillars.hour.zhi.name).toBe('子')
    })

    it('should return GanZhi objects with full properties', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const pillars = computeFourPillars(jd)

      // 所有返回值都应该是 GanZhi 对象
      expect(pillars.year.gan).toBeDefined()
      expect(pillars.year.zhi).toBeDefined()
      expect(pillars.year.nayin).toBeDefined()
      expect(pillars.year.kongWang).toBeDefined()
    })
  })
})
```

**Step 3: 运行测试**

Run: `pnpm --filter @yhjs/bazi exec vitest run`
Expected: 全部通过

> **注意**: 测试中的四柱预期值需要与 chengming-mobile 或万年历工具交叉验证。如果某个值不对，需要调整预期值而不是代码（因为算法来自 lunar 包，已经验证过）。

**Step 4: Commit**

```bash
git add packages/bazi/src/pillar.ts packages/bazi/tests/pillar.test.ts
git commit -m "feat(bazi): 实现四柱计算 pillar.ts"
```

---

## Task 3: 实现 analysis.ts — 十神 + 藏干展开

**Files:**
- Create: `packages/bazi/src/analysis.ts`
- Create: `packages/bazi/tests/analysis.test.ts`

**背景知识：**

十神计算：以日主天干为参照，计算其他天干相对于日主的十神关系。
- 日柱自身天干的 tenGod 为 null
- 地支藏干展开：每个地支的 `hiddenGans` 包含 1-3 个藏干，各自计算相对日主的十神

来源：`chengming-mobile bazi.js:84-100 initGanzhi` + `bazi.js:402-412 setHiddenGan`

**Step 1: 编写 analysis.ts**

```typescript
import type { Gan, GanZhi, TenGod } from '@yhjs/bagua'
import { tenGod } from '@yhjs/bagua'
import type { HiddenGodEntry, Pillar } from './types'
import type { FourPillars } from './pillar'

/**
 * 构建单个柱（计算十神 + 展开藏干）
 * @param ganZhi 柱干支
 * @param dayMaster 日主天干
 * @param isDayPillar 是否为日柱（日柱自身 tenGod = null）
 */
export function buildPillar(ganZhi: GanZhi, dayMaster: Gan, isDayPillar: boolean = false): Pillar {
  const ganTenGod: TenGod | null = isDayPillar ? null : tenGod(dayMaster, ganZhi.gan)

  const hiddenGods: HiddenGodEntry[] = ganZhi.zhi.hiddenGans.map(hg => ({
    gan: hg.gan,
    tenGod: tenGod(dayMaster, hg.gan),
    weight: hg.weight,
  }))

  return {
    ganZhi,
    tenGod: ganTenGod,
    hiddenGods,
  }
}

/**
 * 四柱结果（含十神和藏干展开）
 */
export interface BuiltPillars {
  readonly year: Pillar
  readonly month: Pillar
  readonly day: Pillar
  readonly hour: Pillar
}

/**
 * 从四柱干支构建完整的四柱信息
 * @param fourPillars 四柱干支
 */
export function buildAllPillars(fourPillars: FourPillars): BuiltPillars {
  const dayMaster = fourPillars.day.gan
  return {
    year: buildPillar(fourPillars.year, dayMaster),
    month: buildPillar(fourPillars.month, dayMaster),
    day: buildPillar(fourPillars.day, dayMaster, true),
    hour: buildPillar(fourPillars.hour, dayMaster),
  }
}
```

**Step 2: 编写测试**

```typescript
// tests/analysis.test.ts
import { describe, expect, it } from 'vitest'
import { buildAllPillars, buildPillar } from '../src/analysis'
import { computeFourPillars, dateToJd } from '../src/pillar'
import { gan, ganZhi } from '@yhjs/bagua'

describe('analysis', () => {
  describe('buildPillar', () => {
    it('should compute tenGod for non-day pillar', () => {
      // 日主甲，年柱庚午 → 庚对甲=七煞
      const dayMaster = gan('甲')
      const pillar = buildPillar(ganZhi('庚午'), dayMaster)
      expect(pillar.tenGod).not.toBeNull()
      expect(pillar.tenGod!.name).toBe('七煞')
    })

    it('should return null tenGod for day pillar', () => {
      const dayMaster = gan('壬')
      const pillar = buildPillar(ganZhi('壬戌'), dayMaster, true)
      expect(pillar.tenGod).toBeNull()
    })

    it('should expand hidden gans with tenGod', () => {
      // 日主壬，地支寅 → 藏干: 戊(main)=七煞, 丙(middle)=偏财, 甲(minor)=食神
      const dayMaster = gan('壬')
      const pillar = buildPillar(ganZhi('甲寅'), dayMaster)

      expect(pillar.hiddenGods).toHaveLength(3)
      expect(pillar.hiddenGods[0].gan.name).toBe('戊')
      expect(pillar.hiddenGods[0].weight).toBe('main')
      expect(pillar.hiddenGods[0].tenGod.name).toBe('七煞')

      expect(pillar.hiddenGods[1].gan.name).toBe('丙')
      expect(pillar.hiddenGods[1].weight).toBe('middle')
      expect(pillar.hiddenGods[1].tenGod.name).toBe('偏财')

      expect(pillar.hiddenGods[2].gan.name).toBe('甲')
      expect(pillar.hiddenGods[2].weight).toBe('minor')
      expect(pillar.hiddenGods[2].tenGod.name).toBe('食神')
    })
  })

  describe('buildAllPillars', () => {
    it('should build all four pillars for 1990-10-08 08:00', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const fourPillars = computeFourPillars(jd)
      const built = buildAllPillars(fourPillars)

      // 日主 = 壬 (壬戌日)
      expect(fourPillars.day.gan.name).toBe('壬')

      // 年柱庚午: 庚对壬=偏印
      expect(built.year.tenGod!.name).toBe('偏印')
      // 月柱乙酉: 乙对壬=伤官
      expect(built.month.tenGod!.name).toBe('伤官')
      // 日柱壬戌: tenGod = null
      expect(built.day.tenGod).toBeNull()
      // 时柱甲辰: 甲对壬=食神
      expect(built.hour.tenGod!.name).toBe('食神')
    })
  })
})
```

**Step 3: 运行测试**

Run: `pnpm --filter @yhjs/bazi exec vitest run`
Expected: 全部通过

**Step 4: Commit**

```bash
git add packages/bazi/src/analysis.ts packages/bazi/tests/analysis.test.ts
git commit -m "feat(bazi): 实现十神分析 analysis.ts"
```

---

## Task 4: 实现 dayun.ts — 大运计算

**Files:**
- Create: `packages/bazi/src/dayun.ts`
- Create: `packages/bazi/tests/dayun.test.ts`

**背景知识（来自 chengming-mobile bazi.js:129-244）：**

大运起运算法：
1. **顺逆判断**: 年干阳 + 男 = 顺，年干阴 + 男 = 逆；年干阳 + 女 = 逆，年干阴 + 女 = 顺。即"阳男阴女顺，阴男阳女逆"。
   - chengming-mobile 的 `isReverse()`: 返回 true 表示逆。`(sex==='男' && !yearGan.yinyang) || (sex==='女' && yearGan.yinyang)` → 阴男阳女=逆。
   - 注意 chengming-mobile 中 yinyang: 0=阴, 1=阳。bagua 中 yinyang: '阴'|'阳'。
2. **寻找目标节气**: 顺数取出生后下一个"节"(奇数索引节气)，逆数取出生前上一个"节"。
   - `SOLAR_TERM_NAMES` 从冬至(0)开始，奇数=节(小寒=1, 立春=3, 惊蛰=5...)，偶数=气(冬至=0, 大寒=2, 雨水=4...)
   - `calculateLunarYear(jd).zhongQi` 是 25 个节气 JD，index 对应 `SOLAR_TERM_NAMES` 的 index
   - zhongQi[1]=小寒, zhongQi[3]=立春, zhongQi[5]=惊蛰 ... 这些是"节"
3. **计算天数差**: `dayDelta = |birthJd - targetTermJd|`
4. **换算起运天数**: `dayOffset = dayDelta * 121.7474`（三天折一年: 365.2422/3）
5. **起运年龄**: 从出生日 + dayOffset 天后的公历日期推算年龄
6. **排列 9 步大运**: 从月柱干支开始顺/逆推，每步 10 年

**Step 1: 编写 dayun.ts**

```typescript
import type { GanZhi } from '@yhjs/bagua'
import { ganZhi } from '@yhjs/bagua'
import { tenGod } from '@yhjs/bagua'
import type { Gan } from '@yhjs/bagua'
import {
  calculateLunarYear,
  gregorianToJD,
  J2000,
  jdToGregorian,
} from '@yhjs/lunar'
import type { DayunEntry, Gender } from './types'

/** 大运步数 */
const DAYUN_STEPS = 9
/** 每步大运年数 */
const DAYUN_SPAN = 10
/** 每天折合的天数(365.2422/3)，用于起运计算 */
const DESTINY_DAY_VALUE = 121.7474

/**
 * 判断大运是否逆行
 * 阳男阴女 = 顺 (false)
 * 阴男阳女 = 逆 (true)
 */
export function isDayunReverse(yearGan: Gan, gender: Gender): boolean {
  const isYangGan = yearGan.yinyang === '阳'
  const isMale = gender === '男'
  // 阳男顺、阴女顺 → return false
  // 阴男逆、阳女逆 → return true
  return (isMale && !isYangGan) || (!isMale && isYangGan)
}

/**
 * 寻找目标节气（节）的 JD
 *
 * zhongQi 数组中，奇数索引为"节"（小寒=1, 立春=3, 惊蛰=5, ...）
 * 顺数: 找出生日之后最近的"节"
 * 逆数: 找出生日之前最近的"节"
 *
 * @param jd 出生日 J2000 相对 JD
 * @param reverse 是否逆行
 * @returns 目标节气的 J2000 相对 JD
 */
export function findTargetJie(jd: number, reverse: boolean): number {
  const yearData = calculateLunarYear(jd)
  const zhongQi = yearData.zhongQi

  if (reverse) {
    // 逆数: 找出生日之前最近的"节"（奇数索引）
    for (let i = 23; i >= 1; i -= 2) {
      if (zhongQi[i] <= jd) {
        return zhongQi[i]
      }
    }
    // 如果当年没有找到，查找上一年
    const prevYearData = calculateLunarYear(jd - 365)
    const prevZhongQi = prevYearData.zhongQi
    for (let i = 23; i >= 1; i -= 2) {
      if (prevZhongQi[i] <= jd) {
        return prevZhongQi[i]
      }
    }
    return prevZhongQi[23]
  }
  else {
    // 顺数: 找出生日之后最近的"节"（奇数索引）
    for (let i = 1; i <= 23; i += 2) {
      if (zhongQi[i] > jd) {
        return zhongQi[i]
      }
    }
    // 如果当年没有找到，查找下一年
    const nextYearData = calculateLunarYear(jd + 365)
    const nextZhongQi = nextYearData.zhongQi
    for (let i = 1; i <= 23; i += 2) {
      if (nextZhongQi[i] > jd) {
        return nextZhongQi[i]
      }
    }
    return nextZhongQi[1]
  }
}

/**
 * 计算起运年龄
 *
 * @param birthJd 出生日 J2000 相对 JD
 * @param targetJieJd 目标节气 J2000 相对 JD
 * @param reverse 是否逆行
 * @param birthYear 出生年份
 * @returns 起运年龄（正整数）
 */
export function computeStartAge(
  birthJd: number,
  targetJieJd: number,
  reverse: boolean,
  birthYear: number,
): number {
  const dayDelta = reverse ? birthJd - targetJieJd : targetJieJd - birthJd
  const dayOffset = dayDelta * DESTINY_DAY_VALUE
  // 起运时间点的绝对 JD
  const startAbsJd = (birthJd + J2000) + dayOffset
  const startDate = jdToGregorian(startAbsJd)

  let age = startDate.year - birthYear
  if (age < 0) age = 0
  return age
}

/**
 * 计算大运列表
 *
 * @param monthGanZhi 月柱干支
 * @param dayMaster 日主天干
 * @param yearGan 年干
 * @param gender 性别
 * @param birthJd 出生日 J2000 相对 JD
 * @param birthYear 出生年份
 * @returns 9 步大运
 */
export function computeDayun(
  monthGanZhi: GanZhi,
  dayMaster: Gan,
  yearGan: Gan,
  gender: Gender,
  birthJd: number,
  birthYear: number,
): readonly DayunEntry[] {
  const reverse = isDayunReverse(yearGan, gender)
  const targetJieJd = findTargetJie(birthJd, reverse)
  const startAge = computeStartAge(birthJd, targetJieJd, reverse, birthYear)

  const offset = reverse ? -1 : 1
  const result: DayunEntry[] = []

  let curGanIdx = monthGanZhi.gan.index as number
  let curZhiIdx = monthGanZhi.zhi.index as number

  for (let i = 0; i < DAYUN_STEPS; i++) {
    curGanIdx = ((curGanIdx + offset) % 10 + 10) % 10
    curZhiIdx = ((curZhiIdx + offset) % 12 + 12) % 12
    const gz = ganZhi(curGanIdx + curZhiIdx * 0) // 需要从索引组合查找

    // 从天干和地支索引计算六十甲子索引
    // 六十甲子中，第 n 个 = 天干 n%10 + 地支 n%12
    // 需要找到满足 idx%10==curGanIdx && idx%12==curZhiIdx 的 idx
    let gzIdx = -1
    for (let j = 0; j < 60; j++) {
      if (j % 10 === curGanIdx && j % 12 === curZhiIdx) {
        gzIdx = j
        break
      }
    }
    const dayunGz = ganZhi(gzIdx)

    result.push({
      ganZhi: dayunGz,
      startAge: startAge + i * DAYUN_SPAN,
      startYear: birthYear + startAge + i * DAYUN_SPAN,
      tenGod: tenGod(dayMaster, dayunGz.gan),
    })
  }

  return result
}
```

**Step 2: 编写测试**

```typescript
// tests/dayun.test.ts
import { describe, expect, it } from 'vitest'
import { computeDayun, findTargetJie, isDayunReverse } from '../src/dayun'
import { computeFourPillars, dateToJd } from '../src/pillar'
import { gan } from '@yhjs/bagua'

describe('dayun', () => {
  describe('isDayunReverse', () => {
    it('阳男顺', () => {
      expect(isDayunReverse(gan('甲'), '男')).toBe(false)
    })
    it('阴男逆', () => {
      expect(isDayunReverse(gan('乙'), '男')).toBe(true)
    })
    it('阳女逆', () => {
      expect(isDayunReverse(gan('甲'), '女')).toBe(true)
    })
    it('阴女顺', () => {
      expect(isDayunReverse(gan('乙'), '女')).toBe(false)
    })
  })

  describe('findTargetJie', () => {
    it('should find next jie for forward dayun', () => {
      // 1990-10-08 在寒露(节)和霜降(气)之间
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const targetJd = findTargetJie(jd, false)
      // 下一个节应该是霜降后的立冬
      expect(targetJd).toBeGreaterThan(jd)
    })

    it('should find prev jie for reverse dayun', () => {
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const targetJd = findTargetJie(jd, true)
      // 上一个节应该是寒露
      expect(targetJd).toBeLessThan(jd)
    })
  })

  describe('computeDayun', () => {
    it('should compute 9 steps of dayun', () => {
      // 1990-10-08 08:00 男
      // 庚午年 乙酉月 壬戌日 甲辰时
      // 庚=阳，男=顺
      const jd = dateToJd(new Date(1990, 9, 8, 8, 0, 0))
      const pillars = computeFourPillars(jd)
      const dayun = computeDayun(
        pillars.month, // 乙酉
        pillars.day.gan, // 壬
        pillars.year.gan, // 庚
        '男',
        jd,
        1990,
      )

      expect(dayun).toHaveLength(9)

      // 庚(阳)男=顺，月柱乙酉顺推: 丙戌, 丁亥, 戊子, 己丑, 庚寅, 辛卯, 壬辰, 癸巳, 甲午
      expect(dayun[0].ganZhi.name).toBe('丙戌')
      expect(dayun[1].ganZhi.name).toBe('丁亥')
      expect(dayun[2].ganZhi.name).toBe('戊子')
      expect(dayun[3].ganZhi.name).toBe('己丑')
      expect(dayun[4].ganZhi.name).toBe('庚寅')

      // 每步间隔 10 年
      expect(dayun[1].startAge - dayun[0].startAge).toBe(10)

      // 十神应该有值
      expect(dayun[0].tenGod.name).toBe('偏财') // 丙对壬=偏财
    })

    it('should reverse for yin-male', () => {
      // 1985-03-15 14:00 男
      // 乙丑年 己卯月 壬辰日 丁未时
      // 乙=阴，男=逆
      const jd = dateToJd(new Date(1985, 2, 15, 14, 0, 0))
      const pillars = computeFourPillars(jd)
      const dayun = computeDayun(
        pillars.month, // 己卯
        pillars.day.gan, // 壬
        pillars.year.gan, // 乙
        '男',
        jd,
        1985,
      )

      expect(dayun).toHaveLength(9)
      // 乙(阴)男=逆，月柱己卯逆推: 戊寅, 丁丑, 丙子, 乙亥, 甲戌...
      expect(dayun[0].ganZhi.name).toBe('戊寅')
      expect(dayun[1].ganZhi.name).toBe('丁丑')
      expect(dayun[2].ganZhi.name).toBe('丙子')
    })

    it('should have increasing startAge and startYear', () => {
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

      for (let i = 1; i < dayun.length; i++) {
        expect(dayun[i].startAge).toBe(dayun[i - 1].startAge + 10)
        expect(dayun[i].startYear).toBe(dayun[i - 1].startYear + 10)
      }
    })
  })
})
```

**Step 3: 运行测试**

Run: `pnpm --filter @yhjs/bazi exec vitest run`
Expected: 全部通过

> **注意**: `computeDayun` 中从天干/地支索引计算六十甲子索引的逻辑比较关键。实现者应该检查 bagua 的 `ganZhi()` 是否支持直接从 name 查找（如 `ganZhi('丙戌')`），如果可以则用名称拼接代替索引计算。

**Step 4: Commit**

```bash
git add packages/bazi/src/dayun.ts packages/bazi/tests/dayun.test.ts
git commit -m "feat(bazi): 实现大运计算 dayun.ts"
```
