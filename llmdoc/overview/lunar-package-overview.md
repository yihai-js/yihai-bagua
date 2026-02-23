# @yhjs/lunar - 农历天文计算库

## 1. Identity

- **What it is:** 寿星万年历 5.10 算法的 TypeScript 完整移植，提供中国农历、天文星历、日月食计算的零依赖库。
- **Purpose:** 为 monorepo 内的其他包（如 `@yhjs/dunjia`）提供精确的农历日期转换、干支推算、节气计算和天文星历数据。

## 2. High-Level Description

`@yhjs/lunar`（包名 `@yhjs/lunar`，版本 `1.0.0`）是从许剑伟的"寿星天文历 5.10"浏览器应用（`src-legacy/`）迁移而来的现代 TypeScript 库。原始代码为全局变量风格的 JavaScript（`eph0.js`、`eph.js`、`lunar.js`、`JW.js` 等），现已重构为 6 个分层子模块，采用 ESM + CJS 双格式导出，零运行时依赖。

核心算法基于 VSOP87（行星/太阳）和 ELP/MPP02（月球）截断多项式级数，太阳黄经最大误差 0.1 角秒，月球最大误差 0.8 角秒。农历历史校验覆盖公元前 721 年至今。

## 3. 六个子模块概述

| 子模块 | 导入路径 | 职责 |
|--------|----------|------|
| **core** | `@yhjs/lunar/core` | 基础数学原语：儒略日、ΔT、坐标变换、岁差、章动、VSOP87 级数求和、LRU 缓存 |
| **data** | `@yhjs/lunar/data` | 静态数据集：VSOP87 行星系数表（8 行星 + 月球 + 冥王星）、中国城市经纬度、历史朝代/年号 |
| **ephemeris** | `@yhjs/lunar/ephemeris` | 日月行星位置计算、升中天落、晨昏光，底层天文引擎 |
| **lunar** | `@yhjs/lunar/lunar` | 农历日历引擎：公农历互转、节气朔望、干支、生肖、节日、`LunarDate` 类 |
| **eclipse** | `@yhjs/lunar/eclipse` | 日食和月食的搜索、计算、分类 |
| **astronomy** | `@yhjs/lunar/astronomy` | 面向用户的简化天文 API，封装 ephemeris 层 |

## 4. 模块依赖关系

```
data/vsop87  -->  core  -->  ephemeris  -->  lunar
                                    |   -->  eclipse
                                    +------> astronomy  -->  index.ts (主入口)
```

- `core` 依赖 `data/vsop87`（级数系数表）
- `ephemeris` 依赖 `core`（数学原语）+ `data`（VSOP87 数据）
- `lunar` 依赖 `core`（儒略日、ΔT）+ `ephemeris`（太阳/月球经度反算）
- `eclipse` 依赖 `core`（常量）+ `ephemeris`（日月位置）
- `astronomy` 依赖 `core` + `ephemeris`（全部底层计算）
- `src/index.ts` 汇总导出所有模块，解决 astronomy 与 ephemeris 之间的命名冲突

## 5. 关键技术特征

- 内部时间表示：J2000 相对儒略日（JD - 2451545），ΔT 修正 TT/UT1 转换
- 农历输出时间统一为北京时间（UTC+8）
- 闰月规则：无中气置闰法（冬至后首个无中气月为闰月）
- 干支年界：默认以立春为界
- LRU 缓存应用于 `calculateLunarYear`（容量 100 年），重复访问加速 10x+
- Brand 类型系统防止角度/弧度单位混用
