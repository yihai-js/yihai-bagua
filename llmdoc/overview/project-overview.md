# @yhjs/monorepo - 项目概览

## 1. Identity

- **名称:** `@yhjs/monorepo` -- 用于"承明 AI"玄学计算的 TypeScript 库集合。
- **目的:** 将"寿星天文历"(许剑伟)的天文/历法/术数算法从浏览器端 JavaScript 迁移为现代 TypeScript 库，供 AI 后端调用。

## 2. 高层描述

本项目是一个 pnpm monorepo，包含五个核心包：`@yhjs/lunar`（农历天文计算）、`@yhjs/bagua`（术数基础）、`@yhjs/dunjia`（奇门遁甲排盘）、`@yhjs/bazi`（八字排盘）和 `@yhjs/liuren`（大六壬排盘）。`@yhjs/lunar` 基于 VSOP87 和 ELP/MPP02 算法实现高精度天文计算、农历推算；`@yhjs/bagua` 提供五行关系、十神、六十甲子、八卦等术数基础模块；`@yhjs/dunjia` 实现奇门遁甲排盘引擎（时家/山向奇门）；`@yhjs/bazi` 实现八字排盘（四柱/大运/流年/神煞）；`@yhjs/liuren` 实现大六壬排盘（天盘/贵神/三传/时运命）。所有包以 ESM + CJS 双格式发布。

## 3. 技术栈

| 层面 | 工具 | 版本 |
|------|------|------|
| 包管理 | pnpm workspace | `pnpm-workspace.yaml`, glob `packages/*` |
| 语言 | TypeScript | ^5.9 (strict 模式, branded types) |
| 构建 | Vite (library mode) + vite-plugin-dts | ^7.3 |
| 测试 | Vitest + @vitest/coverage-v8 | ^4.0 |
| 代码规范 | @antfu/eslint-config (type: lib) | ^7.4 |
| 模块格式 | ESM (.js) + CJS (.cjs), conditional exports | -- |

## 4. 包概览

### `@yhjs/lunar` (v1.0.0) -- 农历天文计算

- **零运行时依赖**，7 个导出子路径 (`.`, `./core`, `./lunar`, `./ephemeris`, `./eclipse`, `./astronomy`, `./data`)
- 核心功能：Julian Day 转换、ΔT 校正、岁差/章动、VSOP87 行星星历、高精度月球位置、农历推算（-721 至今）、干支/节气/节日、日月食计算、日出日落/晨昏蒙影
- 内部分层：`data/vsop87` -> `core` -> `ephemeris` -> `lunar`/`eclipse` -> `astronomy` -> 公共 API
- 关键入口：`LunarDate` 类、`lunar()` 工厂函数、`getSunPosition`/`getMoonPosition` 等天文 API

### `@yhjs/dunjia` (v0.1.0) -- 奇门遁甲排盘

- **运行时依赖** `@yhjs/lunar` (`workspace:*`，构建时 externalize)
- 2 个导出子路径 (`.`, `./outer-gods`)
- 核心功能：九宫格拓扑、五行/八卦/六甲旬数据、九星/八门/八神模型、地盘/天盘/隐干排布流水线、时家奇门 (`TimeDunjia`)、山向奇门 (`PosDunjia`)、外盘神煞插件系统（已实现十二建神）
- 内部分层：`base`(五行/八卦/九宫/旬) -> `model`(星/门/神) -> `board`(排盘流水线) + `mountain`(罗盘二十四山)
- 关键入口：`TimeDunjia.create()`、`PosDunjia.create()`、`buildBoard()`

### `@yhjs/bazi` (v0.1.0) -- 八字排盘

- **运行时依赖** `@yhjs/lunar` (`workspace:*`) + `@yhjs/bagua` (`workspace:*`)
- 1 个导出子路径 (`.`)
- 核心功能：四柱干支计算、十神分析、藏干展开、大运 9 步排列、流年/运前流年、五虎遁流月、驿马/贵人/空亡/旺相休囚死
- 内部分层：`pillar`(干支计算) -> `analysis`(十神/藏干) -> `dayun`(大运) + `liunian`(流年/流月) + `shensha`(神煞)
- 关键入口：`Bazi.create({ datetime, gender })`

### `@yhjs/liuren` (v0.1.0) -- 大六壬排盘

- **运行时依赖** `@yhjs/lunar` (`workspace:*`) + `@yhjs/bagua` (`workspace:*`)
- 1 个导出子路径 (`.`)
- 核心功能：月将计算、天盘排布、十二神将(贵神)排布、外天干、十二建、十二宫、太阴标记、三传计算（含伏吟）、时运命
- 内部分层：`yuejiang`(月将/天盘) + `pillar`(四柱) -> `guigod`(贵神) -> `outer`(外干/建/宫/太阴) -> `legend`(三传) + `destiny`(时运命) -> `board`(13步流水线)
- 关键入口：`buildLiurenBoard(options)` 返回 `LiurenBoard`

## 5. 包间依赖

```
@yhjs/dunjia  ──depends──>  @yhjs/lunar
@yhjs/dunjia  ──depends──>  @yhjs/bagua (via lunar's re-exports)
@yhjs/bazi    ──depends──>  @yhjs/lunar
@yhjs/bazi    ──depends──>  @yhjs/bagua
@yhjs/liuren  ──depends──>  @yhjs/lunar
@yhjs/liuren  ──depends──>  @yhjs/bagua
```

- `dunjia` 中唯一导入 `lunar` 的文件：`packages/dunjia/src/board/common.ts`
- `bazi` 导入 `lunar` 的文件：`packages/bazi/src/pillar.ts`（干支/儒略日）、`packages/bazi/src/dayun.ts`（节气数据）
- `bazi` 导入 `bagua` 的文件：`packages/bazi/src/analysis.ts`（十神）、`packages/bazi/src/dayun.ts`（ganZhi/tenGod）、`packages/bazi/src/liunian.ts`（ganZhi/tenGod）、`packages/bazi/src/shensha.ts`（zhi）
- `liuren` 导入 `lunar` 的文件：`packages/liuren/src/yuejiang.ts`（月将/农历/儒略日）、`packages/liuren/src/pillar.ts`（四柱干支）
- `liuren` 导入 `bagua` 的文件：`packages/liuren/src/types.ts`（Gan/Zhi/GanZhi 类型）、`packages/liuren/src/guigod.ts`（Gan/Zhi）、`packages/liuren/src/outer.ts`（GanZhi/gan）、`packages/liuren/src/legend.ts`（GanZhi/zhi）、`packages/liuren/src/yuejiang.ts`（zhi）
- 测试时通过 vitest alias 直接指向源码，绕过构建产物

## 6. 项目来源

从 `src-legacy/` 目录的"寿星天文历 V5.10.3"（许剑伟）迁移而来。原始代码为纯浏览器 JavaScript（无模块系统，全局变量通信，兼容 IE6），通过 `<script>` 标签按依赖顺序加载。对应关系：

| 遗留文件 | 现代对应 |
|----------|----------|
| `eph0.js` | `packages/lunar/src/core/` |
| `eph.js` + `ephB.js` | `packages/lunar/src/ephemeris/` |
| `eph.js` (SZJ 对象) | `packages/lunar/src/astronomy/` |
| `lunar.js` | `packages/lunar/src/lunar/` |
| `JW.js` | `packages/lunar/src/data/` |

## 7. 目录结构

```
/
├── pnpm-workspace.yaml
├── tsconfig.base.json          # 共享 TS 配置 (strict, ES2020, bundler)
├── eslint.config.js            # @antfu/eslint-config (type: lib)
├── packages/
│   ├── lunar/                  # @yhjs/lunar
│   │   ├── src/
│   │   │   ├── core/           # 数学基础、Julian Day、ΔT、岁差、章动
│   │   │   ├── ephemeris/      # 太阳/月球/行星星历、升降、晨昏
│   │   │   ├── lunar/          # 农历、干支、节气、节日、LunarDate
│   │   │   ├── eclipse/        # 日食/月食
│   │   │   ├── astronomy/      # 用户友好型高层 API
│   │   │   └── data/           # 城市、年号、VSOP87 系数表
│   │   └── tests/
│   ├── bagua/                  # @yhjs/bagua
│   │   └── src/                # 五行、十神、六十甲子、八卦、十二长生
│   ├── dunjia/                 # @yhjs/dunjia
│   │   ├── src/
│   │   │   ├── base/           # 五行、八卦、九宫拓扑、六甲旬
│   │   │   ├── model/          # 九星、八门、八神数据
│   │   │   ├── board/          # 排盘流水线 + TimeDunjia/PosDunjia
│   │   │   ├── mountain/       # 罗盘二十四山、三盘、三元局数
│   │   │   ├── outer-gods/     # 外盘神煞插件 (十二建神)
│   │   │   └── types.ts        # 核心类型定义 (Palace, BoardMeta, etc.)
│   │   └── tests/
│   ├── bazi/                   # @yhjs/bazi
│   │   ├── src/
│   │   │   ├── types.ts        # 10 个核心类型 (Pillar, DayunEntry, etc.)
│   │   │   ├── pillar.ts       # Date -> 四柱干支
│   │   │   ├── analysis.ts     # 十神分析 + 藏干展开
│   │   │   ├── dayun.ts        # 大运计算 (9步 x 10年)
│   │   │   ├── liunian.ts      # 流年 + 五虎遁流月
│   │   │   ├── shensha.ts      # 驿马/贵人/空亡/旺相
│   │   │   └── bazi.ts         # Bazi 主类 (静态工厂 + 编排)
│   │   └── tests/
│   └── liuren/                 # @yhjs/liuren
│       ├── src/
│       │   ├── types.ts        # 8 个核心类型 (ZhiPalace, LiurenBoard, etc.)
│       │   ├── yuejiang.ts     # 月将计算、地盘初始化、天盘排布、太阴查表
│       │   ├── pillar.ts       # J2000 → 四柱干支
│       │   ├── guigod.ts       # 十二神将(贵神)排布、贵人表
│       │   ├── outer.ts        # 外天干、十二建、十二宫、太阴标记
│       │   ├── legend.ts       # 三传计算（含伏吟/相刑/相冲）
│       │   ├── destiny.ts      # 时运命计算
│       │   └── board.ts        # 13 步排盘流水线 (buildLiurenBoard)
│       └── tests/
└── src-legacy/                 # 寿星天文历 V5.10.3 原始 JS 源码
```
