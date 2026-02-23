# @yhjs/monorepo - 项目概览

## 1. Identity

- **名称:** `@yhjs/monorepo` -- 用于"承明 AI"玄学计算的 TypeScript 库集合。
- **目的:** 将"寿星天文历"(许剑伟)的天文/历法/术数算法从浏览器端 JavaScript 迁移为现代 TypeScript 库，供 AI 后端调用。

## 2. 高层描述

本项目是一个 pnpm monorepo，包含两个核心包：`@yhjs/lunar`（农历天文计算）和 `@yhjs/dunjia`（奇门遁甲排盘）。`@yhjs/lunar` 基于 VSOP87 (行星/太阳) 和 ELP/MPP02 (月球) 算法实现高精度天文计算、农历推算、日月食预测；`@yhjs/dunjia` 基于 lunar 的干支和节气数据实现完整的奇门遁甲排盘引擎（时家/山向奇门）。两个包均以 ESM + CJS 双格式发布，无外部运行时依赖（lunar 自包含，dunjia 仅依赖 lunar）。

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

## 5. 包间依赖

```
@yhjs/dunjia  ──depends──>  @yhjs/lunar
```

- `dunjia` 中唯一导入 `lunar` 的文件：`packages/dunjia/src/board/common.ts`
- 使用的 lunar API：`gregorianToJD`, `J2000`, `calculateLunarYear`, `ganZhiToIndex`, `getYearGanZhi`, `getMonthGanZhi`, `getDayGanZhi`, `getHourGanZhi`, `SOLAR_TERM_NAMES`
- 测试时通过 vitest alias 直接指向 lunar 源码（`../lunar/src`），绕过构建产物

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
│   └── dunjia/                 # @yhjs/dunjia
│       ├── src/
│       │   ├── base/           # 五行、八卦、九宫拓扑、六甲旬
│       │   ├── model/          # 九星、八门、八神数据
│       │   ├── board/          # 排盘流水线 + TimeDunjia/PosDunjia
│       │   ├── mountain/       # 罗盘二十四山、三盘、三元局数
│       │   ├── outer-gods/     # 外盘神煞插件 (十二建神)
│       │   └── types.ts        # 核心类型定义 (Palace, BoardMeta, etc.)
│       └── tests/
└── src-legacy/                 # 寿星天文历 V5.10.3 原始 JS 源码
```
