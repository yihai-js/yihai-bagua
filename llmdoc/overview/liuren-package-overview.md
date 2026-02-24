# @yhjs/liuren - 大六壬排盘库

## 1. Identity

- **What it is:** 基于 `@yhjs/lunar` 天文历法数据和 `@yhjs/bagua` 术数基础的大六壬排盘 TypeScript 纯函数库，提供天盘排布、十二神将、三传计算、时运命推演等完整排盘能力。
- **Purpose:** 为"承明 AI"术数计算后端提供大六壬排盘能力，输入日期时间和用神干支，输出包含 12 宫位（天盘/贵神/外干/建/宫/太阴）、三传、时运命的完整盘面。

## 2. High-Level Description

`@yhjs/liuren`（版本 `0.1.0`）是 monorepo 中的第五个核心包，运行时依赖 `@yhjs/lunar`（儒略日/节气/农历/四柱干支）和 `@yhjs/bagua`（Gan/Zhi/GanZhi 类型及工厂函数）。采用纯函数流水线模式，由 `buildLiurenBoard(options)` 单入口编排 13 步管道，每步返回新的不可变数据。核心数据结构为 12 个 `ZhiPalace` 宫位（含 7 字段）+ `LegendResult` 三传 + `DestinyResult` 时运命。

## 3. 八个子模块概述

| 子模块 | 文件 | 核心导出 | 职责 |
|--------|------|----------|------|
| **types** | `packages/liuren/src/types.ts` | 8 个类型定义 | GuiGodType, GuiGodInfo, ZhiPalace, LegendResult, DestinyResult, LiurenMeta, LiurenOptions, LiurenBoard |
| **yuejiang** | `packages/liuren/src/yuejiang.ts` | `dateToJd`, `resolveYuejiang`, `initPalaces`, `setTianpan`, `resolveIsSolar`, `resolveTaiyinZhi` | Date->JD 转换、中气查月将、12 宫初始化、天盘排布（月将加时）、阴阳判定、农历日查太阴 |
| **pillar** | `packages/liuren/src/pillar.ts` | `computeFourPillars` | 调用 lunar 的 4 个干支函数获取年月日时柱 |
| **guigod** | `packages/liuren/src/guigod.ts` | `resolveGuiGodType`, `setGuiGods`, `GUIREN_TABLE` | 时支判阴阳贵人、天乙贵人表查贵人地支、12 神将顺/逆排布 |
| **outer** | `packages/liuren/src/outer.ts` | `setOuterGan`, `setJianChu`, `setTwelvePalaces`, `setTaiyin` | 六壬式天干排布、十二建排布、十二宫排布（阴阳顺逆）、太阴标记 |
| **legend** | `packages/liuren/src/legend.ts` | `isFuyin`, `computeLegend`, `GAN_JIGONG`, `XING_TABLE` | 伏吟判断、干传/支传三步推导（含伏吟时相刑/相冲逻辑） |
| **destiny** | `packages/liuren/src/destiny.ts` | `computeDestiny` | 时支/月将/生肖 -> 时/运/命三要素 |
| **board** | `packages/liuren/src/board.ts` | `buildLiurenBoard` | 13 步排盘流水线主编排函数 |

## 4. 13 步排盘流水线

```
Date → (1)JD → (2)四柱 → (3)月将 → (4)贵人类型 → (5)地盘
→ (6)天盘 → (7)贵神 → (8)外干 → (9)十二建 → (10)十二宫
→ (11)太阴 → (12)三传 → (13)时运命 → LiurenBoard
```

详见 `packages/liuren/src/board.ts` (`buildLiurenBoard`) 中 13 步注释。

## 5. 关键技术特征

- 主入口：`buildLiurenBoard(options: LiurenOptions)` 纯函数，返回不可变 `LiurenBoard`
- 宫位结构：`ZhiPalace` 含 7 字段（zhi/tianpan/guiGod/outerGan/jianChu/twelvePalace/taiyin）
- 天盘算法：月将落于时支位置，其余顺排（`yuejiang.ts:setTianpan`）
- 贵神排布：天乙贵人表 + 方向判定（上半圆顺、下半圆逆）（`guigod.ts:setGuiGods`）
- 三传算法：干传从天干寄宫起、支传从用神地支起，各 3 步；伏吟时取相刑（自刑取相冲）（`legend.ts:computeLegend`）
- 太阴查表：农历日(1~30) -> 地支索引的 31 元素查表（`yuejiang.ts:TAIYIN_TABLE`）
- 十二宫方向：冬至~夏至顺排，夏至~冬至逆排（`outer.ts:setTwelvePalaces`）
- 依赖的 lunar API：`gregorianToJD`, `J2000`, `calculateLunarYear`, `getLunarDateInfo`, `getYearGanZhi`, `getMonthGanZhi`, `getDayGanZhi`, `getHourGanZhi`
- 依赖的 bagua API：`zhi()`, `gan()`, `Gan`, `Zhi`, `GanZhi` 类型
- 测试覆盖：52 个测试用例，6 个测试文件
