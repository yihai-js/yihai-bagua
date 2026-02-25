# P1: @yhjs/bagua 包 + 重构现有包 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建 `@yhjs/bagua` 术数基础包（零依赖），并重构 `@yhjs/lunar` 和 `@yhjs/dunjia` 统一使用 bagua 的类型定义。

**Architecture:** bagua 采用三层架构（原语→关系→组合），所有数据预计算并 `Object.freeze`。lunar 和 dunjia 的干支/五行/旬相关代码改为从 bagua 导入。

**Tech Stack:** TypeScript 5.9+, Vite 7.3 (library mode), Vitest 4.0, pnpm workspace

---

## Task 1: 创建 bagua 包骨架

**Files:**
- Create: `packages/bagua/package.json`
- Create: `packages/bagua/tsconfig.json`
- Create: `packages/bagua/vite.config.ts`
- Create: `packages/bagua/vitest.config.ts`
- Create: `packages/bagua/src/index.ts` (空文件)
- Modify: `tsconfig.base.json:7-9` (添加 bagua paths)

**Step 1: 创建 package.json**

```json
{
  "name": "@yhjs/bagua",
  "type": "module",
  "version": "1.0.0",
  "description": "术数基础库 - 干支、五行、十神、关系引擎",
  "author": "",
  "license": "MIT",
  "homepage": "https://github.com/yihai-js/yihai-bagua#readme",
  "repository": {
    "type": "git",
    "url": "https://github.com/yihai-js/yihai-bagua.git",
    "directory": "packages/bagua"
  },
  "keywords": ["bagua", "ganzhi", "wuxing", "干支", "五行", "八卦", "十神", "术数"],
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
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist"]
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
      output: {
        exports: 'named',
      },
    },
  },
})
```

**Step 4: 创建 vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
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

**Step 5: 创建 src/index.ts (空占位)**

```typescript
// @yhjs/bagua - 术数基础库
```

**Step 6: 更新 tsconfig.base.json paths**

在 `compilerOptions.paths` 中添加 bagua 映射：

```json
{
  "compilerOptions": {
    "paths": {
      "@yhjs/lunar": ["./packages/lunar/src"],
      "@yhjs/lunar/*": ["./packages/lunar/src/*"],
      "@yhjs/bagua": ["./packages/bagua/src"]
    }
  }
}
```

**Step 7: 安装依赖并验证**

Run: `cd /Users/macbookair/Desktop/projects/sxwnl && pnpm install`
Expected: 依赖安装成功

Run: `pnpm --filter @yhjs/bagua run build`
Expected: 构建成功（空包）

**Step 8: Commit**

```bash
git add packages/bagua/ tsconfig.base.json pnpm-lock.yaml
git commit -m "feat(bagua): 创建 @yhjs/bagua 包骨架"
```

---

## Task 2: 实现原语层 - types.ts + gan.ts + zhi.ts

**Files:**
- Create: `packages/bagua/src/types.ts`
- Create: `packages/bagua/src/gan.ts`
- Create: `packages/bagua/src/zhi.ts`
- Create: `packages/bagua/tests/gan.test.ts`
- Create: `packages/bagua/tests/zhi.test.ts`

**Step 1: 编写 types.ts**

```typescript
/**
 * 术数基础类型定义
 */

/** 五行枚举 */
export enum Wuxing { 木 = 0, 火 = 1, 土 = 2, 金 = 3, 水 = 4 }

/** 阴阳类型 */
export type YinYang = '阴' | '阳'

/** 五行名称 */
export const WUXING_NAMES = ['木', '火', '土', '金', '水'] as const

// === Branded Index Types ===
declare const __ganIndex: unique symbol
declare const __zhiIndex: unique symbol
declare const __ganZhiIndex: unique symbol

/** 天干索引 (0-9) */
export type GanIndex = number & { readonly [__ganIndex]: true }
/** 地支索引 (0-11) */
export type ZhiIndex = number & { readonly [__zhiIndex]: true }
/** 六十甲子索引 (0-59) */
export type GanZhiIndex = number & { readonly [__ganZhiIndex]: true }

export function ganIndex(n: number): GanIndex {
  if (n < 0 || n > 9 || !Number.isInteger(n))
    throw new RangeError(`GanIndex must be 0-9, got ${n}`)
  return n as GanIndex
}

export function zhiIndex(n: number): ZhiIndex {
  if (n < 0 || n > 11 || !Number.isInteger(n))
    throw new RangeError(`ZhiIndex must be 0-11, got ${n}`)
  return n as ZhiIndex
}

export function ganZhiIndex(n: number): GanZhiIndex {
  if (n < 0 || n > 59 || !Number.isInteger(n))
    throw new RangeError(`GanZhiIndex must be 0-59, got ${n}`)
  return n as GanZhiIndex
}
```

**Step 2: 编写 gan.ts**

天干数据来源：
- `ganzhiPublic.ganList` = `['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']`
- `ganzhiPublic.ganWuxing` = `[0,0,1,1,2,2,3,3,4,4]` (对应 Wuxing 枚举)
- `gan.js:bornZhiList` = `[11,6,2,9,2,9,5,0,8,3]` (长生位地支索引)
- 阴阳: 偶数索引=阳, 奇数索引=阴
- `isTwelveStateClock`: 阳干(偶数索引)顺推, 阴干(奇数索引)逆推

```typescript
import type { GanIndex, Wuxing, YinYang, ZhiIndex } from './types'
import { ganIndex as toGanIndex } from './types'

export interface Gan {
  readonly index: GanIndex
  readonly name: string
  readonly wuxing: Wuxing
  readonly yinyang: YinYang
  readonly bornZhi: ZhiIndex       // 十二长生的长生位（地支索引）
  readonly isYangGan: boolean       // 阳干顺推、阴干逆推十二长生
}

const GAN_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const GAN_WUXING: readonly Wuxing[] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]
const GAN_BORN_ZHI: readonly ZhiIndex[] = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3] as ZhiIndex[]

const ALL_GAN: readonly Gan[] = GAN_NAMES.map((name, i) => Object.freeze<Gan>({
  index: i as GanIndex,
  name,
  wuxing: GAN_WUXING[i],
  yinyang: i % 2 === 0 ? '阳' : '阴',
  bornZhi: GAN_BORN_ZHI[i],
  isYangGan: i % 2 === 0,
}))

const GAN_NAME_MAP = new Map<string, Gan>(ALL_GAN.map(g => [g.name, g]))

/** 按索引或名称获取天干 */
export function gan(input: GanIndex | number | string): Gan {
  if (typeof input === 'string') {
    const g = GAN_NAME_MAP.get(input)
    if (!g) throw new Error(`未知天干: ${input}`)
    return g
  }
  const idx = typeof input === 'number' ? ((input % 10) + 10) % 10 : input
  return ALL_GAN[idx]
}

/** 全部 10 天干（冻结数组） */
export const GANS: readonly Gan[] = ALL_GAN
```

**Step 3: 编写 zhi.ts**

地支数据来源：
- `ganzhiPublic.zhiList` = `['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']`
- `ganzhiPublic.zhiWuxing` = `[4,2,0,0,2,1,1,2,3,3,2,4]`
- `zhi.js:hiddenGans` = 12地支各自藏干（第一个=本气main，第二个=中气middle，第三个=余气minor）
- `zhi.js:shengxiaoList` = 十二生肖
- `zhi.js:bornZhiList` = `[8,5,2,11,8,5,2,11,8,5,2,11]` (地支的长生位)
- 阴阳: 偶数索引=阳, 奇数索引=阴

```typescript
import type { Gan } from './gan'
import { gan } from './gan'
import type { Wuxing, YinYang, ZhiIndex } from './types'

export interface HiddenGan {
  readonly gan: Gan
  readonly weight: 'main' | 'middle' | 'minor'
}

export interface Zhi {
  readonly index: ZhiIndex
  readonly name: string
  readonly wuxing: Wuxing
  readonly yinyang: YinYang
  readonly shengXiao: string
  readonly hiddenGans: readonly HiddenGan[]
  readonly bornZhi: ZhiIndex       // 地支自身的长生位
}

const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
const ZHI_WUXING: readonly Wuxing[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4]
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const
const ZHI_BORN: readonly ZhiIndex[] = [8, 5, 2, 11, 8, 5, 2, 11, 8, 5, 2, 11] as ZhiIndex[]

// 藏干名列表 (来源: chengming-mobile zhi.js:hiddenGans)
const HIDDEN_GAN_NAMES: readonly (readonly string[])[] = [
  ['癸'],              // 子
  ['癸', '辛', '己'],  // 丑
  ['戊', '丙', '甲'],  // 寅
  ['乙'],              // 卯
  ['乙', '癸', '戊'],  // 辰
  ['戊', '庚', '丙'],  // 巳
  ['己', '丁'],        // 午
  ['丁', '乙', '己'],  // 未
  ['戊', '壬', '庚'],  // 申
  ['辛'],              // 酉
  ['辛', '丁', '戊'],  // 戌
  ['甲', '壬'],        // 亥
]

const WEIGHT_ORDER: readonly HiddenGan['weight'][] = ['main', 'middle', 'minor']

function buildHiddenGans(names: readonly string[]): readonly HiddenGan[] {
  return Object.freeze(names.map((n, i) => Object.freeze<HiddenGan>({
    gan: gan(n),
    weight: WEIGHT_ORDER[i],
  })))
}

const ALL_ZHI: readonly Zhi[] = ZHI_NAMES.map((name, i) => Object.freeze<Zhi>({
  index: i as ZhiIndex,
  name,
  wuxing: ZHI_WUXING[i],
  yinyang: i % 2 === 0 ? '阳' : '阴',
  shengXiao: SHENG_XIAO[i],
  hiddenGans: buildHiddenGans(HIDDEN_GAN_NAMES[i]),
  bornZhi: ZHI_BORN[i],
}))

const ZHI_NAME_MAP = new Map<string, Zhi>(ALL_ZHI.map(z => [z.name, z]))

/** 按索引或名称获取地支 */
export function zhi(input: ZhiIndex | number | string): Zhi {
  if (typeof input === 'string') {
    const z = ZHI_NAME_MAP.get(input)
    if (!z) throw new Error(`未知地支: ${input}`)
    return z
  }
  const idx = typeof input === 'number' ? ((input % 12) + 12) % 12 : input
  return ALL_ZHI[idx]
}

/** 全部 12 地支（冻结数组） */
export const ZHIS: readonly Zhi[] = ALL_ZHI
```

**Step 4: 编写 gan 测试**

```typescript
// tests/gan.test.ts
import { describe, expect, it } from 'vitest'
import { gan, GANS } from '../src/gan'
import { Wuxing } from '../src/types'

describe('gan', () => {
  it('should have exactly 10 items', () => {
    expect(GANS).toHaveLength(10)
  })

  it('should lookup by index', () => {
    expect(gan(0).name).toBe('甲')
    expect(gan(9).name).toBe('癸')
  })

  it('should lookup by name', () => {
    expect(gan('甲').index).toBe(0)
    expect(gan('癸').index).toBe(9)
  })

  it('should have correct wuxing', () => {
    // 甲乙=木, 丙丁=火, 戊己=土, 庚辛=金, 壬癸=水
    expect(gan('甲').wuxing).toBe(Wuxing.木)
    expect(gan('乙').wuxing).toBe(Wuxing.木)
    expect(gan('丙').wuxing).toBe(Wuxing.火)
    expect(gan('丁').wuxing).toBe(Wuxing.火)
    expect(gan('戊').wuxing).toBe(Wuxing.土)
    expect(gan('己').wuxing).toBe(Wuxing.土)
    expect(gan('庚').wuxing).toBe(Wuxing.金)
    expect(gan('辛').wuxing).toBe(Wuxing.金)
    expect(gan('壬').wuxing).toBe(Wuxing.水)
    expect(gan('癸').wuxing).toBe(Wuxing.水)
  })

  it('should have correct yinyang', () => {
    // 偶数=阳, 奇数=阴
    expect(gan('甲').yinyang).toBe('阳')
    expect(gan('乙').yinyang).toBe('阴')
    expect(gan('丙').yinyang).toBe('阳')
    expect(gan('癸').yinyang).toBe('阴')
  })

  it('should have correct born zhi', () => {
    // 甲长生在亥(11), 乙长生在午(6)
    expect(gan('甲').bornZhi).toBe(11)
    expect(gan('乙').bornZhi).toBe(6)
    expect(gan('丙').bornZhi).toBe(2)
  })

  it('should return frozen objects', () => {
    const jia = gan('甲')
    expect(Object.isFrozen(jia)).toBe(true)
  })

  it('should return same reference for same input', () => {
    expect(gan(0)).toBe(gan('甲'))
  })

  it('should throw for unknown name', () => {
    expect(() => gan('X')).toThrow('未知天干')
  })

  it('should handle modular index', () => {
    expect(gan(10).name).toBe('甲')  // 10 % 10 = 0
    expect(gan(-1).name).toBe('癸')  // (-1+10) % 10 = 9
  })
})
```

**Step 5: 编写 zhi 测试**

```typescript
// tests/zhi.test.ts
import { describe, expect, it } from 'vitest'
import { zhi, ZHIS } from '../src/zhi'
import { Wuxing } from '../src/types'

describe('zhi', () => {
  it('should have exactly 12 items', () => {
    expect(ZHIS).toHaveLength(12)
  })

  it('should lookup by index', () => {
    expect(zhi(0).name).toBe('子')
    expect(zhi(11).name).toBe('亥')
  })

  it('should lookup by name', () => {
    expect(zhi('子').index).toBe(0)
    expect(zhi('亥').index).toBe(11)
  })

  it('should have correct wuxing', () => {
    expect(zhi('子').wuxing).toBe(Wuxing.水)
    expect(zhi('丑').wuxing).toBe(Wuxing.土)
    expect(zhi('寅').wuxing).toBe(Wuxing.木)
    expect(zhi('卯').wuxing).toBe(Wuxing.木)
    expect(zhi('午').wuxing).toBe(Wuxing.火)
    expect(zhi('酉').wuxing).toBe(Wuxing.金)
  })

  it('should have correct yinyang', () => {
    expect(zhi('子').yinyang).toBe('阳')
    expect(zhi('丑').yinyang).toBe('阴')
  })

  it('should have correct shengxiao', () => {
    expect(zhi('子').shengXiao).toBe('鼠')
    expect(zhi('丑').shengXiao).toBe('牛')
    expect(zhi('亥').shengXiao).toBe('猪')
  })

  it('should have correct hidden gans', () => {
    // 子: 癸(main)
    const zi = zhi('子')
    expect(zi.hiddenGans).toHaveLength(1)
    expect(zi.hiddenGans[0].gan.name).toBe('癸')
    expect(zi.hiddenGans[0].weight).toBe('main')

    // 丑: 癸(main) 辛(middle) 己(minor)
    const chou = zhi('丑')
    expect(chou.hiddenGans).toHaveLength(3)
    expect(chou.hiddenGans[0].gan.name).toBe('癸')
    expect(chou.hiddenGans[0].weight).toBe('main')
    expect(chou.hiddenGans[1].gan.name).toBe('辛')
    expect(chou.hiddenGans[1].weight).toBe('middle')
    expect(chou.hiddenGans[2].gan.name).toBe('己')
    expect(chou.hiddenGans[2].weight).toBe('minor')

    // 寅: 戊(main) 丙(middle) 甲(minor)
    const yin = zhi('寅')
    expect(yin.hiddenGans).toHaveLength(3)
    expect(yin.hiddenGans[0].gan.name).toBe('戊')
    expect(yin.hiddenGans[1].gan.name).toBe('丙')
    expect(yin.hiddenGans[2].gan.name).toBe('甲')
  })

  it('should return frozen objects', () => {
    expect(Object.isFrozen(zhi('子'))).toBe(true)
  })
})
```

**Step 6: 运行测试**

Run: `cd /Users/macbookair/Desktop/projects/sxwnl && pnpm --filter @yhjs/bagua exec vitest run`
Expected: 全部通过

**Step 7: Commit**

```bash
git add packages/bagua/src/types.ts packages/bagua/src/gan.ts packages/bagua/src/zhi.ts packages/bagua/tests/
git commit -m "feat(bagua): 实现原语层 - 天干/地支/类型定义"
```

---

## Task 3: 实现关系层 - wuxing + ten-god + twelve-state + relation

**Files:**
- Create: `packages/bagua/src/wuxing.ts`
- Create: `packages/bagua/src/ten-god.ts`
- Create: `packages/bagua/src/twelve-state.ts`
- Create: `packages/bagua/src/relation.ts`
- Create: `packages/bagua/tests/wuxing.test.ts`
- Create: `packages/bagua/tests/ten-god.test.ts`
- Create: `packages/bagua/tests/twelve-state.test.ts`
- Create: `packages/bagua/tests/relation.test.ts`

**Step 1: 编写 wuxing.ts**

五行生克关系数据来源：
- `dunjia/src/base/wuxing.ts:RELATION_TABLE`（已有实现）
- `chengming-mobile relationSettings.wuxing.offsetList` = `[3,2,4,1,0]` → 对应克/受克/生/受生/同

```typescript
import { Wuxing, WUXING_NAMES } from './types'

export type WuxingRelation = '生' | '克' | '泄' | '耗' | '比'

/**
 * 五行关系表: RELATION_TABLE[a][b] = a 对 b 的关系
 * 生: a 生 b (木生火)
 * 克: a 克 b (木克土)
 * 泄: b 生 a (火泄木 = 木生火的反面)
 * 耗: b 克 a (金耗木 = 金克木的反面, 从木的视角)
 * 比: 同类
 */
const RELATION_TABLE: readonly (readonly WuxingRelation[])[] = [
  ['比', '生', '克', '耗', '泄'], // 木对
  ['泄', '比', '生', '克', '耗'], // 火对
  ['耗', '泄', '比', '生', '克'], // 土对
  ['克', '耗', '泄', '比', '生'], // 金对
  ['生', '克', '耗', '泄', '比'], // 水对
]

/** 获取 a 对 b 的五行关系 */
export function wuxingRelation(a: Wuxing, b: Wuxing): WuxingRelation {
  return RELATION_TABLE[a][b]
}

/** 获取五行名称 */
export function wuxingName(w: Wuxing): string {
  return WUXING_NAMES[w]
}

export { Wuxing, WUXING_NAMES }
```

**Step 2: 编写 ten-god.ts**

十神算法来源：`chengming-mobile relationSettings.tenGod.method`
- 先判断五行关系（5种）× 阴阳是否相同（2种）= 10种十神
- `wuxingRelation.txtIndex * 2 + yinyangRelation.txtIndex`
- 五行关系序: 克=0, 受克=1, 生=2, 受生=3, 同=4
- 阴阳相异=0, 相同=1

映射表:
| 五行 | 异 | 同 |
|------|----|----|
| 克(我克) | 正财 | 偏财 |
| 受克(克我) | 正官 | 七煞 |
| 生(我生) | 伤官 | 食神 |
| 受生(生我) | 正印 | 偏印 |
| 同 | 劫财 | 比肩 |

```typescript
import type { Gan } from './gan'
import { wuxingRelation, type WuxingRelation } from './wuxing'

export type TenGodName = '正财' | '偏财' | '正官' | '七煞' | '伤官' | '食神' | '正印' | '偏印' | '劫财' | '比肩'
export type TenGodShort = '财' | '才' | '官' | '杀' | '伤' | '食' | '印' | '枭' | '劫' | '比'

export interface TenGod {
  readonly name: TenGodName
  readonly shortName: TenGodShort
  readonly wuxingRel: WuxingRelation
  readonly sameYinYang: boolean
}

const NAMES: readonly TenGodName[] = ['正财', '偏财', '正官', '七煞', '伤官', '食神', '正印', '偏印', '劫财', '比肩']
const SHORTS: readonly TenGodShort[] = ['财', '才', '官', '杀', '伤', '食', '印', '枭', '劫', '比']

// 五行关系 → 十神基础索引 (×2)
// 克(我克)=0, 耗(克我)=1, 生(我生)=2, 泄(生我)=3, 比=4
const WUXING_TO_BASE: Record<WuxingRelation, number> = {
  '克': 0,  // 我克他 → 财
  '耗': 1,  // 他克我 → 官
  '生': 2,  // 我生他 → 伤/食
  '泄': 3,  // 他生我 → 印
  '比': 4,  // 同类 → 劫/比
}

// 预计算全部 10×10 = 100 种十神结果
const TEN_GOD_CACHE: readonly (readonly TenGod[])[] = buildCache()

function buildCache(): readonly (readonly TenGod[])[] {
  const result: TenGod[][] = []
  for (let dayMaster = 0; dayMaster < 10; dayMaster++) {
    const row: TenGod[] = []
    for (let target = 0; target < 10; target++) {
      const wxRel = wuxingRelation(
        Math.floor(dayMaster / 2) as 0 | 1 | 2 | 3 | 4,
        Math.floor(target / 2) as 0 | 1 | 2 | 3 | 4,
      )
      // 注意: wuxingRelation 对天干需要用 gan.wuxing 而非 index/2
      // 这里仅做预计算框架，实际调用时用 wuxing
      const sameYY = (dayMaster % 2) === (target % 2)
      const base = WUXING_TO_BASE[wxRel]
      const idx = base * 2 + (sameYY ? 1 : 0)
      row.push(Object.freeze<TenGod>({
        name: NAMES[idx],
        shortName: SHORTS[idx],
        wuxingRel: wxRel,
        sameYinYang: sameYY,
      }))
    }
    result.push(Object.freeze(row))
  }
  return Object.freeze(result)
}

/**
 * 计算十神关系
 * @param dayMaster 日主天干
 * @param target 目标天干
 * @returns 目标相对于日主的十神
 */
export function tenGod(dayMaster: Gan, target: Gan): TenGod {
  const wxRel = wuxingRelation(dayMaster.wuxing, target.wuxing)
  const sameYY = dayMaster.yinyang === target.yinyang
  const base = WUXING_TO_BASE[wxRel]
  const idx = base * 2 + (sameYY ? 1 : 0)
  return Object.freeze<TenGod>({
    name: NAMES[idx],
    shortName: SHORTS[idx],
    wuxingRel: wxRel,
    sameYinYang: sameYY,
  })
}

export { NAMES as TEN_GOD_NAMES, SHORTS as TEN_GOD_SHORTS }
```

**Step 3: 编写 twelve-state.ts**

来源：`chengming-mobile relationSettings.twelveState.method`
- 阳干顺推（`isTwelveStateClock=true`），阴干逆推
- 偏移量 = 目标地支索引 相对于 长生位（`bornZhi`）的距离

```typescript
import type { Gan } from './gan'
import type { Zhi } from './zhi'

export type TwelveStateName = '长生' | '沐浴' | '冠带' | '临官' | '帝旺' | '衰' | '病' | '死' | '墓' | '绝' | '胎' | '养'

const STATE_NAMES: readonly TwelveStateName[] = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰',
  '病', '死', '墓', '绝', '胎', '养',
]

const ZHI_LEN = 12

/**
 * 计算天干在地支的十二长生状态
 * @param g 天干
 * @param z 地支
 */
export function twelveState(g: Gan, z: Zhi): TwelveStateName {
  let offset: number
  if (g.isYangGan) {
    // 阳干顺推
    offset = z.index >= g.bornZhi
      ? z.index - g.bornZhi
      : z.index + ZHI_LEN - g.bornZhi
  }
  else {
    // 阴干逆推
    offset = z.index <= g.bornZhi
      ? g.bornZhi - z.index
      : g.bornZhi + ZHI_LEN - z.index
  }
  return STATE_NAMES[offset]
}

export { STATE_NAMES as TWELVE_STATE_NAMES }
```

**Step 4: 编写 relation.ts**

来源：`chengming-mobile relationSettings` 的各关系常量表

```typescript
import type { Gan } from './gan'
import type { Zhi } from './zhi'

// === 天干关系 ===

export type GanRelationType = '五合' | '相冲'

// 天干五合表: ganHe.list[i] = 与第i个天干相合的天干名
// 甲己合, 乙庚合, 丙辛合, 丁壬合, 戊癸合
const GAN_HE_LIST = ['己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊'] as const

// 天干相冲表: ganChong.list[i] = 与第i个天干相冲的天干名, null=无冲
// 甲庚冲, 乙辛冲, 丙壬冲, 丁癸冲, 戊己无冲
const GAN_CHONG_LIST: readonly (string | null)[] = ['庚', '辛', '壬', '癸', null, null, '甲', '乙', '丙', '丁']

export function ganRelation(a: Gan, b: Gan): GanRelationType | null {
  if (GAN_HE_LIST[a.index] === b.name) return '五合'
  if (GAN_CHONG_LIST[a.index] === b.name) return '相冲'
  return null
}

// === 地支二元关系 ===

export type ZhiRelationType = '六合' | '相冲' | '相刑' | '相破' | '相害'

// 地支六合: zhiHe.list[i] = 与第i个地支相合的地支名
// 子丑合, 寅亥合, 卯戌合, 辰酉合, 巳申合, 午未合
const ZHI_HE_LIST = ['丑', '子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅'] as const

// 地支相冲: zhiChong.list[i]
// 子午冲, 丑未冲, 寅申冲, 卯酉冲, 辰戌冲, 巳亥冲
const ZHI_CHONG_LIST = ['午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳'] as const

// 地支相刑: xing.list[i]
const ZHI_XING_LIST = ['卯', '戌', '巳', '子', '辰', '申', '午', '丑', '寅', '酉', '未', '亥'] as const
export type XingType = '无礼' | '恃势' | '无恩' | '自刑'
const ZHI_XING_TYPES: readonly XingType[] = ['无礼', '恃势', '无恩', '无礼', '自刑', '无恩', '自刑', '恃势', '无恩', '自刑', '恃势', '自刑']

// 地支相破: po.list[i]
const ZHI_PO_LIST = ['酉', '辰', '亥', '午', '丑', '申', '卯', '戌', '巳', '子', '未', '寅'] as const

// 地支相害: hai.list[i]
const ZHI_HAI_LIST = ['未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌', '酉', '申'] as const

export interface ZhiRelationResult {
  readonly type: ZhiRelationType
  readonly xingType?: XingType  // 仅相刑时有值
}

export function zhiRelation(a: Zhi, b: Zhi): ZhiRelationResult | null {
  if (ZHI_HE_LIST[a.index] === b.name) return { type: '六合' }
  if (ZHI_CHONG_LIST[a.index] === b.name) return { type: '相冲' }
  if (ZHI_XING_LIST[a.index] === b.name) return { type: '相刑', xingType: ZHI_XING_TYPES[a.index] }
  if (ZHI_PO_LIST[a.index] === b.name) return { type: '相破' }
  if (ZHI_HAI_LIST[a.index] === b.name) return { type: '相害' }
  return null
}

// === 地支三元关系 ===

export type ZhiTripleRelationType = '三合' | '三会'

// 三合: 寅午戌(火), 亥卯未(木), 巳酉丑(金), 申子辰(水)
const SAN_HE: readonly string[] = ['寅午戌', '亥卯未', '巳酉丑', '申子辰']
// 三会: 寅卯辰(木), 巳午未(火), 申酉戌(金), 亥子丑(水)
const SAN_HUI: readonly string[] = ['寅卯辰', '巳午未', '申酉戌', '亥子丑']

export function zhiTripleRelation(a: Zhi, b: Zhi, c: Zhi): ZhiTripleRelationType | null {
  const names = [a.name, b.name, c.name]
  for (const group of SAN_HE) {
    if (names.every(n => group.includes(n)) && new Set(names).size === 3) return '三合'
  }
  for (const group of SAN_HUI) {
    if (names.every(n => group.includes(n)) && new Set(names).size === 3) return '三会'
  }
  return null
}
```

**Step 5: 编写测试**

为每个模块编写测试文件。关键测试用例：

- `wuxing.test.ts`: 5×5=25 组合全覆盖
- `ten-god.test.ts`: 验证经典十神组合（甲对乙=劫财, 甲对己=正财, 甲对庚=七煞 等）
- `twelve-state.test.ts`: 验证甲在子=沐浴, 甲在寅=长生 等
- `relation.test.ts`: 验证各种合冲刑害

测试代码由实现者根据上述规则表编写，此处省略完整代码，参考 chengming-mobile 常量表做交叉验证。

**Step 6: 运行测试**

Run: `pnpm --filter @yhjs/bagua exec vitest run`
Expected: 全部通过

**Step 7: Commit**

```bash
git add packages/bagua/src/wuxing.ts packages/bagua/src/ten-god.ts packages/bagua/src/twelve-state.ts packages/bagua/src/relation.ts packages/bagua/tests/
git commit -m "feat(bagua): 实现关系层 - 五行/十神/十二长生/关系引擎"
```

---

## Task 4: 实现组合层 - ganzhi + xun + bagua + index

**Files:**
- Create: `packages/bagua/src/ganzhi.ts`
- Create: `packages/bagua/src/xun.ts`
- Create: `packages/bagua/src/bagua.ts`
- Modify: `packages/bagua/src/index.ts`
- Create: `packages/bagua/tests/ganzhi.test.ts`
- Create: `packages/bagua/tests/xun.test.ts`

**Step 1: 编写 ganzhi.ts**

60甲子 = gan(i%10) + zhi(i%12)，纳音数据来自 `nayin.js`。

```typescript
import type { Gan } from './gan'
import { gan } from './gan'
import type { GanZhiIndex, Wuxing } from './types'
import { ganZhiIndex as toGanZhiIndex } from './types'
import type { Zhi } from './zhi'
import { zhi } from './zhi'

export interface NayinInfo {
  readonly name: string
  readonly wuxing: Wuxing
}

export interface GanZhi {
  readonly index: GanZhiIndex
  readonly gan: Gan
  readonly zhi: Zhi
  readonly name: string
  readonly xunIndex: number         // 所属旬 0-5
  readonly nayin: NayinInfo
  readonly kongWang: readonly [Zhi, Zhi]  // 旬空两地支
}

// 纳音表 (来源: chengming-mobile nayin.js)
const NAYIN_NAMES: readonly string[] = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金',
  '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
  '泉中水', '屋上土', '霹雳火', '松柏木', '长流水',
  '沙中金', '山下火', '平地木', '壁上土', '金箔金',
  '覆灯火', '天河水', '大驿土', '钗钏金', '桑拓木',
  '大溪水', '沙中土', '天上火', '石榴木', '大海水',
]
const NAYIN_WUXING: readonly Wuxing[] = [
  3, 1, 0, 2, 3, 1, 4, 2, 3, 0,
  4, 2, 1, 0, 4, 3, 1, 0, 2, 3,
  1, 4, 2, 3, 0, 4, 2, 1, 0, 4,
]

// 旬空表: 每旬最后两个地支 (index 10, 11 within the 旬)
function getKongWang(xunIndex: number): readonly [Zhi, Zhi] {
  // 每旬10个干支, 第xunIndex旬从 xunIndex*10 开始
  // 旬空 = 该旬不出现的两个地支
  // 甲子旬空戌亥, 甲戌旬空申酉, 甲申旬空午未, 甲午旬空辰巳, 甲辰旬空寅卯, 甲寅旬空子丑
  const kongWangZhi: readonly [number, number][] = [
    [10, 11], // 戌亥
    [8, 9],   // 申酉
    [6, 7],   // 午未
    [4, 5],   // 辰巳
    [2, 3],   // 寅卯
    [0, 1],   // 子丑
  ]
  const [a, b] = kongWangZhi[xunIndex]
  return [zhi(a), zhi(b)]
}

const ALL_GANZHI: readonly GanZhi[] = Array.from({ length: 60 }, (_, i) => {
  const g = gan(i % 10)
  const z = zhi(i % 12)
  const xunIdx = Math.floor(i / 10)
  const nayinIdx = Math.floor(i / 2) // 每两个干支共享一个纳音
  return Object.freeze<GanZhi>({
    index: i as GanZhiIndex,
    gan: g,
    zhi: z,
    name: g.name + z.name,
    xunIndex: xunIdx,
    nayin: Object.freeze<NayinInfo>({
      name: NAYIN_NAMES[nayinIdx],
      wuxing: NAYIN_WUXING[nayinIdx],
    }),
    kongWang: getKongWang(xunIdx),
  })
})

const GANZHI_NAME_MAP = new Map<string, GanZhi>(ALL_GANZHI.map(gz => [gz.name, gz]))

/** 按索引或名称获取干支 */
export function ganZhi(input: GanZhiIndex | number | string): GanZhi {
  if (typeof input === 'string') {
    const gz = GANZHI_NAME_MAP.get(input)
    if (!gz) throw new Error(`未知干支: ${input}`)
    return gz
  }
  const idx = ((input % 60) + 60) % 60
  return ALL_GANZHI[idx]
}

/** 从天干名+地支名组合查找 */
export function ganZhiFromNames(ganName: string, zhiName: string): GanZhi {
  return ganZhi(ganName + zhiName)
}

/** 六十甲子表 */
export const JIA_ZI_TABLE: readonly GanZhi[] = ALL_GANZHI
```

**Step 2: 编写 xun.ts** (从 dunjia 迁入并增强)

```typescript
import type { GanZhiIndex } from './types'

export interface XunInfo {
  readonly index: number
  readonly name: string
  readonly head: string       // 旬首六仪
}

export const XUN_LIST = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'] as const
const XUN_HEAD_LIST = ['戊', '己', '庚', '辛', '壬', '癸'] as const

/** 六仪三奇顺序 */
export const LIUYI_LIST = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'] as const

const ALL_XUN: readonly XunInfo[] = XUN_LIST.map((name, i) => Object.freeze<XunInfo>({
  index: i,
  name,
  head: XUN_HEAD_LIST[i],
}))

export function getXun(index: number): XunInfo {
  return ALL_XUN[index]
}

export function getXunFromGanZhiIndex(ganZhiIdx: GanZhiIndex | number): XunInfo {
  const idx = Math.floor(((ganZhiIdx % 60) + 60) % 60 / 10)
  return ALL_XUN[idx]
}

export const XUNS: readonly XunInfo[] = ALL_XUN
```

**Step 3: 编写 bagua.ts** (从 dunjia 迁入)

```typescript
import type { Wuxing } from './types'

export interface BaguaInfo {
  readonly index: number
  readonly name: string            // 后天名
  readonly beforeName: string      // 先天名
  readonly yinyang: number         // 0=阴, 1=阳
  readonly wuxing: Wuxing
  readonly gua: string             // 二进制卦象 '010' 等
}

export const BAGUA_LIST = ['坎', '坤', '震', '巽', '乾', '兑', '艮', '离'] as const
const BEFORE_BAGUA_LIST = ['兑', '坎', '艮', '坤', '离', '巽', '乾', '震'] as const
const YINYANG_LIST = [1, 0, 1, 0, 1, 0, 1, 0] as const
const WUXING_LIST: readonly Wuxing[] = [4, 2, 0, 0, 3, 3, 2, 1] // 水土木木金金土火
const GUA_LIST = ['010', '000', '001', '110', '111', '011', '100', '101'] as const

const ALL_BAGUA: readonly BaguaInfo[] = BAGUA_LIST.map((name, i) => Object.freeze<BaguaInfo>({
  index: i,
  name,
  beforeName: BEFORE_BAGUA_LIST[i],
  yinyang: YINYANG_LIST[i],
  wuxing: WUXING_LIST[i],
  gua: GUA_LIST[i],
}))

const BAGUA_NAME_MAP = new Map<string, BaguaInfo>(ALL_BAGUA.map(b => [b.name, b]))

export function getBagua(input: number | string): BaguaInfo {
  if (typeof input === 'string') {
    const b = BAGUA_NAME_MAP.get(input)
    if (!b) throw new Error(`未知八卦: ${input}`)
    return b
  }
  return ALL_BAGUA[input]
}

export function compareBagua(a: BaguaInfo, b: BaguaInfo): string {
  let result = ''
  for (let i = 0; i < 3; i++) {
    result += a.gua[i] === b.gua[i] ? '0' : '1'
  }
  return result
}

export const BAGUAS: readonly BaguaInfo[] = ALL_BAGUA
```

**Step 4: 更新 index.ts — 统一导出**

```typescript
// @yhjs/bagua - 术数基础库

// 类型
export { ganIndex, ganZhiIndex, Wuxing, WUXING_NAMES, zhiIndex } from './types'
export type { GanIndex, GanZhiIndex, YinYang, ZhiIndex } from './types'

// 原语层
export { gan, GANS } from './gan'
export type { Gan } from './gan'
export { zhi, ZHIS } from './zhi'
export type { HiddenGan, Zhi } from './zhi'

// 关系层
export { wuxingName, wuxingRelation } from './wuxing'
export type { WuxingRelation } from './wuxing'
export { TEN_GOD_NAMES, TEN_GOD_SHORTS, tenGod } from './ten-god'
export type { TenGod, TenGodName, TenGodShort } from './ten-god'
export { twelveState, TWELVE_STATE_NAMES } from './twelve-state'
export type { TwelveStateName } from './twelve-state'
export { ganRelation, zhiRelation, zhiTripleRelation } from './relation'
export type { GanRelationType, XingType, ZhiRelationResult, ZhiRelationType, ZhiTripleRelationType } from './relation'

// 组合层
export { ganZhi, ganZhiFromNames, JIA_ZI_TABLE } from './ganzhi'
export type { GanZhi, NayinInfo } from './ganzhi'
export { getXun, getXunFromGanZhiIndex, LIUYI_LIST, XUN_LIST, XUNS } from './xun'
export type { XunInfo } from './xun'
export { BAGUA_LIST, BAGUAS, compareBagua, getBagua } from './bagua'
export type { BaguaInfo } from './bagua'
```

**Step 5: 编写 ganzhi 测试**

验证: 60甲子遍历、纳音正确性（甲子海中金/乙丑海中金）、旬空正确性（甲子旬空戌亥）

**Step 6: 编写 xun 测试**

验证: 6旬旬首、从干支索引查旬

**Step 7: 运行全部测试**

Run: `pnpm --filter @yhjs/bagua exec vitest run`
Expected: 全部通过

**Step 8: 构建验证**

Run: `pnpm --filter @yhjs/bagua run build`
Expected: 构建成功

**Step 9: Commit**

```bash
git add packages/bagua/
git commit -m "feat(bagua): 实现组合层和统一导出 - 六十甲子/旬/八卦"
```

---

## Task 5: 重构 @yhjs/lunar 依赖 bagua

**Files:**
- Modify: `packages/lunar/package.json` (添加 bagua 依赖)
- Modify: `packages/lunar/src/lunar/gan-zhi.ts` (核心重构)
- Modify: `packages/lunar/src/lunar/index.ts` (调整导出)
- Modify: `packages/lunar/vitest.config.ts` (添加 bagua alias)

**Step 1: 添加依赖**

在 `packages/lunar/package.json` 添加:
```json
{
  "dependencies": {
    "@yhjs/bagua": "workspace:*"
  }
}
```

Run: `pnpm install`

**Step 2: 更新 vitest.config.ts**

添加 bagua alias（开发时直接指向源码）：

当前 lunar 的 vitest 没有 alias（lunar 是最底层包，之前无依赖）。现在需要添加：

```typescript
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
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

注意: lunar 之前没有 vitest.config.ts，需要检查实际文件。如果不存在则创建。

**Step 3: 重构 gan-zhi.ts**

核心策略：
1. 删除自有 `TIAN_GAN`、`DI_ZHI`、`SHENG_XIAO`、`GanZhiInfo` 等定义
2. 改为从 `@yhjs/bagua` 导入 `Gan`, `Zhi`, `GanZhi`, `GANS`, `ZHIS` 等
3. `getYearGanZhi` 等函数返回类型从 `GanZhiInfo` 改为 bagua 的 `GanZhi`
4. 保留计算逻辑不变，仅在最后用 `ganZhi(index)` 包装返回值
5. 提供向后兼容的 re-export

关键改动示例：

```typescript
// 改动前
export function getYearGanZhi(jd: number): GanZhiInfo {
  // ... 计算 index ...
  return getGanZhi(index)  // 返回 { gan: string, zhi: string, ... }
}

// 改动后
import { ganZhi as baguaGanZhi, type GanZhi } from '@yhjs/bagua'

export function getYearGanZhi(jd: number): GanZhi {
  // ... 计算 index（逻辑完全不变）...
  return baguaGanZhi(index)  // 返回 bagua 的 GanZhi 对象
}
```

其他函数同理改造。保留 `getGanZhi(index)` 作为兼容函数，内部委托给 bagua。

**Step 4: 更新 lunar/index.ts 导出**

- `GanZhiInfo` type → 标记 deprecated，re-export 为 `GanZhi` 的别名
- `TIAN_GAN` → re-export `GANS.map(g => g.name)` 或直接 re-export
- `FullGanZhiInfo` → 更新类型字段

**Step 5: 运行 lunar 全量测试**

Run: `pnpm --filter @yhjs/lunar exec vitest run`
Expected: 全部通过

如果有失败，逐个修复。最可能的 breaking 点：
- 之前 `ganZhi.gan` 返回 `string`，现在返回 `Gan` 对象
- 测试中 `expect(result.gan).toBe('甲')` 需改为 `expect(result.gan.name).toBe('甲')`

**Step 6: Commit**

```bash
git add packages/lunar/
git commit -m "refactor(lunar): 干支类型迁移至 @yhjs/bagua"
```

---

## Task 6: 重构 @yhjs/dunjia 依赖 bagua

**Files:**
- Modify: `packages/dunjia/package.json` (添加 bagua 依赖)
- Modify: `packages/dunjia/vitest.config.ts` (添加 bagua alias)
- Modify: `packages/dunjia/vite.config.ts` (external 添加 bagua)
- Delete/Replace: `packages/dunjia/src/base/wuxing.ts`
- Delete/Replace: `packages/dunjia/src/base/bagua.ts`
- Delete/Replace: `packages/dunjia/src/base/xun.ts`
- Modify: `packages/dunjia/src/types.ts` (Wuxing/YinYang 改为 re-export)
- Modify: `packages/dunjia/src/board/common.ts` (适配 lunar 新类型)
- Possibly modify: 其他引用了 Wuxing/bagua/xun 的文件

**Step 1: 添加依赖**

```json
{
  "dependencies": {
    "@yhjs/bagua": "workspace:*",
    "@yhjs/lunar": "workspace:*"
  }
}
```

Run: `pnpm install`

**Step 2: 更新 vitest.config.ts**

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

**Step 3: 更新 vite.config.ts**

在 `rollupOptions.external` 中添加 bagua：

```typescript
rollupOptions: {
  external: [/@yhjs\/lunar/, /@yhjs\/bagua/],
}
```

**Step 4: 重构 types.ts**

删除 `Wuxing` 枚举和 `YinYang` 类型的定义，改为 re-export：

```typescript
export { Wuxing } from '@yhjs/bagua'
export type { YinYang } from '@yhjs/bagua'
```

保留 dunjia 特有的类型（Palace, BoardMeta, StarInfo 等）不变。

**Step 5: 替换 base/wuxing.ts**

```typescript
// 从 bagua 导入，保持向后兼容的导出签名
export { Wuxing, wuxingRelation as getWuxingRelation, WUXING_NAMES } from '@yhjs/bagua'
export type { WuxingRelation } from '@yhjs/bagua'
```

**Step 6: 替换 base/bagua.ts**

```typescript
export { BAGUA_LIST, compareBagua, getBagua } from '@yhjs/bagua'
export type { BaguaInfo } from '@yhjs/bagua'
```

**Step 7: 替换 base/xun.ts**

```typescript
export { getXun, getXunFromGanZhiIndex, LIUYI_LIST, XUN_LIST } from '@yhjs/bagua'
export type { XunInfo } from '@yhjs/bagua'
```

**Step 8: 修复 board/common.ts**

如果 lunar 的 `getYearGanZhi` 返回类型变了（`GanZhi` 而非 `GanZhiInfo`），需要适配：

- `yearGZ.zhiIndex` → `yearGZ.zhi.index`
- `yearGZ.ganZhi` → `yearGZ.name`
- `yearGZ.ganIndex` → `yearGZ.gan.index`
- `TIAN_GAN.indexOf(name)` → `gan(name).index`

逐一排查所有引用点。

**Step 9: 修复其他引用**

搜索 dunjia 中所有从 `../base/wuxing`, `../base/bagua`, `../base/xun`, `../types` 导入 `Wuxing`/`YinYang` 的文件，确认导入路径仍然有效（因为我们保留了 re-export 文件）。

**Step 10: 运行 dunjia 全量测试**

Run: `pnpm --filter @yhjs/dunjia exec vitest run`
Expected: 全部通过

**Step 11: 运行全项目测试**

Run: `pnpm test`
Expected: lunar + dunjia + bagua 全部通过

**Step 12: Commit**

```bash
git add packages/dunjia/ pnpm-lock.yaml
git commit -m "refactor(dunjia): 基础模块迁移至 @yhjs/bagua"
```

---

## 验证清单

P1 完成后，应满足以下条件：

- [ ] `@yhjs/bagua` 可独立构建和测试
- [ ] `@yhjs/lunar` 构建和全量测试通过
- [ ] `@yhjs/dunjia` 构建和全量测试通过
- [ ] `pnpm test` (全项目) 通过
- [ ] `pnpm build` (全项目) 通过
- [ ] `@yhjs/bagua` 导出了完整的术数基础 API
- [ ] `@yhjs/dunjia` 不再定义自己的 Wuxing/YinYang/八卦/旬
- [ ] `@yhjs/lunar` 的 getXxxGanZhi 返回 bagua 的 GanZhi 类型
