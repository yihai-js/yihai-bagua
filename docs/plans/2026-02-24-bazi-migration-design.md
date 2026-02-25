# 八字算法迁移设计文档

> 日期：2026-02-24
> 来源：chengming-mobile 八字模块
> 关联：dunjia-migration-design.md

## 1. 目标

将 `chengming-mobile` 中的八字算法迁移至本项目，同时提炼公共术数基础包 `@yhjs/bagua`，使八字和遁甲共享干支、五行、关系引擎等基础模块。

## 2. 架构决策

### 2.1 依赖架构

```
@yhjs/bagua    (zero deps — 纯术数基础)
  ↑
@yhjs/lunar    (→ bagua — 天文历法)
  ↑
@yhjs/dunjia   (→ lunar + bagua)
@yhjs/bazi     (→ lunar + bagua)
```

- `@yhjs/bagua` 零运行时依赖，仅包含纯术数概念和关系计算
- `@yhjs/lunar` 新增对 bagua 的依赖，干支相关类型统一使用 bagua 的定义
- `@yhjs/dunjia` 删除自有的 wuxing/bagua/xun 模块，改为从 bagua 导入
- `@yhjs/bazi` 新建，依赖 lunar（日历计算）和 bagua（术数基础）

### 2.2 bagua 三层架构

```
Layer 1: Primitives  (原语层 — 不可变数据)
  ┌─────────┬─────────┬──────────┐
  │   Gan   │   Zhi   │  Wuxing  │
  │  10 个  │  12 个  │   5 种   │
  └─────────┴─────────┴──────────┘
  预计算、冻结的单例，O(1) 按索引/名称查找

Layer 2: Relations  (关系层 — 纯函数)
  ┌──────────┬──────────┬──────────┬────────────┐
  │  十神    │  五行生克 │  合冲刑害 │  十二长生  │
  └──────────┴──────────┴──────────┴────────────┘
  每种关系是独立纯函数，输入原语、输出结果

Layer 3: Composites  (组合层 — 复合数据)
  ┌──────────┬──────────┬──────────┐
  │  GanZhi  │   Xun    │  Nayin   │
  │ 60 甲子  │  六旬    │  纳音    │
  └──────────┴──────────┴──────────┘
  基于 Layer 1 组合构建，同样预计算冻结
```

### 2.3 API 风格

延续项目约定：
- 不可变数据（`Object.freeze`, `readonly`, `as const`）
- 纯函数管道
- 私有构造器 + 静态工厂（`Bazi.create()` / `Bazi.from()`）
- Branded Index 类型安全（`GanIndex`, `ZhiIndex`, `GanZhiIndex`）

## 3. `@yhjs/bagua` 包设计

### 3.1 目录结构

```
packages/bagua/
  src/
    types.ts                    # Wuxing 枚举、YinYang 类型、Branded Index 类型
    gan.ts                      # 天干：10干数据 + 五行/阴阳 + 长生位
    zhi.ts                      # 地支：12支数据 + 五行/阴阳 + 藏干表 + 生肖
    ganzhi.ts                   # 干支组合：60甲子 + 旬空 + 纳音
    wuxing.ts                   # 五行：生克泄耗比关系
    ten-god.ts                  # 十神：基于五行+阴阳的10种关系
    relation.ts                 # 关系引擎：天干五合/冲、地支六合/三合/三会/冲/刑/破/害
    twelve-state.ts             # 十二长生
    bagua.ts                    # 八卦：先天/后天八卦序列 + 五行属性
    xun.ts                      # 六旬：旬首 + 六仪
    index.ts                    # 单入口导出
  tests/
  package.json                  # 单入口导出，ESM + CJS
  tsconfig.json
  vite.config.ts
```

### 3.2 核心类型

```typescript
// === types.ts ===
export enum Wuxing { 木 = 0, 火 = 1, 土 = 2, 金 = 3, 水 = 4 }
export type YinYang = '阴' | '阳'

// Branded Index 类型
declare const __ganIndex: unique symbol
declare const __zhiIndex: unique symbol
declare const __ganZhiIndex: unique symbol
export type GanIndex = number & { [__ganIndex]: true }
export type ZhiIndex = number & { [__zhiIndex]: true }
export type GanZhiIndex = number & { [__ganZhiIndex]: true }

export function ganIndex(n: number): GanIndex
export function zhiIndex(n: number): ZhiIndex
export function ganZhiIndex(n: number): GanZhiIndex

// === gan.ts ===
export interface Gan {
  readonly index: GanIndex
  readonly name: string
  readonly wuxing: Wuxing
  readonly yinyang: YinYang
  readonly bornZhi: ZhiIndex       // 长生位
  readonly isYangGan: boolean
}
export function gan(input: GanIndex | string): Gan
export const GANS: readonly Gan[]

// === zhi.ts ===
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
}
export function zhi(input: ZhiIndex | string): Zhi
export const ZHIS: readonly Zhi[]

// === ganzhi.ts ===
export interface NayinInfo {
  readonly name: string
  readonly wuxing: Wuxing
}
export interface GanZhi {
  readonly index: GanZhiIndex
  readonly gan: Gan
  readonly zhi: Zhi
  readonly name: string
  readonly xunIndex: number
  readonly nayin: NayinInfo
  readonly kongWang: readonly [Zhi, Zhi]
}
export function ganZhi(input: GanZhiIndex | string): GanZhi
export const JIA_ZI_TABLE: readonly GanZhi[]
```

### 3.3 关系函数

```typescript
// wuxing.ts
export type WuxingRelation = '生' | '克' | '泄' | '耗' | '比'
export function wuxingRelation(a: Wuxing, b: Wuxing): WuxingRelation

// ten-god.ts
export type TenGodName = '正财'|'偏财'|'正官'|'七煞'|'伤官'|'食神'|'正印'|'偏印'|'劫财'|'比肩'
export type TenGodShort = '财'|'才'|'官'|'杀'|'伤'|'食'|'印'|'枭'|'劫'|'比'
export interface TenGod {
  readonly name: TenGodName
  readonly shortName: TenGodShort
  readonly wuxingRelation: WuxingRelation
  readonly sameYinYang: boolean
}
export function tenGod(dayMaster: Gan, target: Gan): TenGod

// twelve-state.ts
export type TwelveStateName = '长生'|'沐浴'|'冠带'|'临官'|'帝旺'|'衰'|'病'|'死'|'墓'|'绝'|'胎'|'养'
export function twelveState(gan: Gan, zhi: Zhi): TwelveStateName

// relation.ts
export type GanRelationType = '五合' | '相冲'
export type ZhiRelationType = '六合' | '三合' | '三会' | '相冲' | '相刑' | '相破' | '相害'
export function ganRelation(a: Gan, b: Gan): GanRelationType | null
export function zhiRelation(a: Zhi, b: Zhi): ZhiRelationType | null
export function zhiTripleRelation(a: Zhi, b: Zhi, c: Zhi): ZhiRelationType | null
```

### 3.4 数据来源映射

| bagua 模块 | chengming-mobile 来源 | dunjia 来源 |
|------------|----------------------|-------------|
| `types.ts` (Wuxing, YinYang) | `ganzhiPublic.js` | `types.ts` |
| `gan.ts` | `gan.js` + `ganzhiPublic.js` | — |
| `zhi.ts` (含藏干) | `zhi.js` + `ganzhiPublic.js` | — |
| `ganzhi.ts` (纳音) | `nayin.js` | — |
| `wuxing.ts` | `relationSettings.wuxing` | `base/wuxing.ts` |
| `ten-god.ts` | `relationSettings.tenGod` | — |
| `twelve-state.ts` | `relationSettings.twelveState` | — |
| `relation.ts` | `relationSettings.ganHe/ganChong/zhiHe/zhiChong/xing/po/hai/zhiThreeHe/zhiHui` | — |
| `bagua.ts` | — | `base/bagua.ts` |
| `xun.ts` | `xun.js` | `base/xun.ts` |

## 4. `@yhjs/bazi` 包设计

### 4.1 目录结构

```
packages/bazi/
  src/
    pillar.ts                   # 四柱构建
    bazi.ts                     # Bazi 主类
    dayun.ts                    # 大运计算
    liunian.ts                  # 流年/流月
    shensha.ts                  # 神煞
    analysis.ts                 # 分析工具（十神展开、状态计算）
    types.ts                    # 类型定义
    index.ts                    # 包入口
  tests/
  package.json
  tsconfig.json
  vite.config.ts
```

### 4.2 核心类型

```typescript
export type Gender = '男' | '女'

export interface Pillar {
  readonly ganZhi: GanZhi
  readonly tenGod: TenGod | null       // 日柱自身为 null
  readonly hiddenGodList: readonly HiddenGodEntry[]
}

export interface HiddenGodEntry {
  readonly gan: Gan
  readonly tenGod: TenGod
  readonly weight: 'main' | 'middle' | 'minor'
}

export interface DayunEntry {
  readonly ganZhi: GanZhi
  readonly startAge: number
  readonly tenGod: TenGod
}

export interface LiunianEntry {
  readonly ganZhi: GanZhi
  readonly year: number
  readonly tenGod: TenGod
}

export interface BaziMeta {
  readonly datetime: Date
  readonly gender: Gender
  readonly dayMaster: Gan
  readonly yinYangDun: '阳' | '阴'
  readonly startAge: number
  readonly kongWang: readonly [Zhi, Zhi]
}
```

### 4.3 Bazi 主类

```typescript
export class Bazi {
  private constructor(...)

  static create(options: {
    datetime: Date
    gender: Gender
    longitude?: number       // 可选，真太阳时修正
  }): Bazi

  static from(data: BaziBoardData): Bazi

  get year(): Pillar
  get month(): Pillar
  get day(): Pillar
  get hour(): Pillar
  get dayMaster(): Gan
  get meta(): BaziMeta
  get dayun(): readonly DayunEntry[]

  getLiunian(dayunIndex: number): readonly LiunianEntry[]
  getLiuyue(year: number): readonly LiuyueEntry[]
  getShensha(): ShenshaResult
  toJSON(): BaziBoardData
}
```

### 4.4 计算流程

```
Bazi.create(options)
  ├── [pillar.ts] computePillars(jd, longitude?)
  │     ├── 可选：真太阳时修正
  │     ├── getYearGanZhi(jd)   → bagua GanZhi
  │     ├── getMonthGanZhi(jd)  → bagua GanZhi
  │     ├── getDayGanZhi(jd)    → bagua GanZhi
  │     └── getHourGanZhi(jd)   → bagua GanZhi
  ├── [analysis.ts] buildPillars(fourGanZhi, dayMaster)
  │     ├── 每柱天干 → tenGod(dayMaster, pillarGan)
  │     └── 每柱地支藏干 → tenGod(dayMaster, hiddenGan)
  ├── [dayun.ts] computeDayun(pillars, gender, jd)
  │     ├── 顺逆判定：年干阴阳 × 性别
  │     ├── 起运计算：出生到目标节气天数 ÷ 3 = 起运年龄
  │     └── 排 9 步大运：月柱起顺/逆推
  └── freeze → new Bazi(board)
```

### 4.5 对 `@yhjs/lunar` 的依赖

```typescript
import {
  getYearGanZhi,
  getMonthGanZhi,
  getDayGanZhi,
  getHourGanZhi,
  gregorianToJD,
  J2000,
  calculateLunarYear,  // 节气数据，用于大运起运计算
} from '@yhjs/lunar'
```

不依赖天文星历、日月食、农历日期转换等模块（与 dunjia 一致）。

## 5. 对现有包的影响

### 5.1 `@yhjs/lunar` 重构

改动文件：`src/lunar/gan-zhi.ts`

- `GanZhiInfo` 接口替换为 bagua 的 `GanZhi` 类型
- `TIAN_GAN`/`DI_ZHI` 改为 re-export bagua 的 `GANS`/`ZHIS`
- `getYearGanZhi` 等函数返回值从 `GanZhiInfo` 变为 `GanZhi`

Breaking change：`.gan` 从 `string` 变为 `Gan` 对象（访问名称需 `.gan.name`）。

### 5.2 `@yhjs/dunjia` 重构

| 文件 | 变更 |
|------|------|
| `types.ts` | 删除 `Wuxing` 枚举和 `YinYang` 类型，re-export from bagua |
| `base/wuxing.ts` | 删除，re-export from bagua |
| `base/bagua.ts` | 删除，re-export from bagua |
| `base/xun.ts` | 删除，re-export from bagua |
| `base/nine-palace.ts` | **保留不动** |
| `board/common.ts` | 调整导入路径 |

## 6. 迁移步骤

### P1: bagua 包 + 重构现有包

| 步骤 | 内容 | 前置 | 验证 |
|------|------|------|------|
| P1.1 | 创建 `packages/bagua/` 包骨架 | — | pnpm build 通过 |
| P1.2 | 实现原语层：types + gan + zhi | P1.1 | 全部 10 干、12 支属性覆盖 |
| P1.3 | 实现关系层：wuxing + ten-god + twelve-state + relation | P1.2 | chengming-mobile 交叉验证 |
| P1.4 | 实现组合层：ganzhi + xun + bagua | P1.2 | 60 甲子全遍历验证 |
| P1.5 | 重构 `@yhjs/lunar` 依赖 bagua 类型 | P1.4 | lunar 全量测试通过 |
| P1.6 | 重构 `@yhjs/dunjia` 依赖 bagua | P1.4 | dunjia 全量测试通过 |

### P2: bazi 包

| 步骤 | 内容 | 前置 | 验证 |
|------|------|------|------|
| P2.1 | 创建 `packages/bazi/` 包骨架 | P1 完成 | 跨包依赖解析正常 |
| P2.2 | 实现 pillar.ts：四柱计算 | P2.1 | 10+ 用例交叉验证 |
| P2.3 | 实现 analysis.ts：十神 + 藏干展开 | P2.2 | 十神正确性验证 |
| P2.4 | 实现 dayun.ts + liunian.ts | P2.2 | 起运年龄 + 大运排列验证 |
| P2.5 | 实现 shensha.ts | P2.2 | 神煞规则全覆盖 |
| P2.6 | 实现 bazi.ts 主类 | P2.2-P2.5 | 端到端验证 |
| P2.7 | fixture 交叉验证 | P2.6 | 全部通过 |

## 7. 测试策略

以 chengming-mobile 的计算结果为基准，交叉验证。

### 7.1 bagua 测试

| 模块 | 测试方式 |
|------|----------|
| gan/zhi | 全属性遍历 + 与 chengming-mobile 常量表对比 |
| wuxing | 5×5 = 25 组合全覆盖 |
| ten-god | 10×10 = 100 组合全覆盖 |
| twelve-state | 10×12 = 120 组合全覆盖 |
| relation | 所有合冲刑害规则逐条验证 |
| ganzhi | 60 甲子全遍历（纳音、旬空） |

### 7.2 bazi 测试

| 模块 | 测试方式 |
|------|----------|
| pillar | 与 lunar 的 getFullGanZhi 交叉验证 + chengming-mobile fixture |
| dayun | 与 chengming-mobile 的 initBigDestiny 输出对比 |
| shensha | 规则表全覆盖 + fixture |
| bazi (E2E) | 10+ 不同日期/性别的完整排盘验证 |
