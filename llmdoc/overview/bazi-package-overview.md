# @yhjs/bazi - 八字排盘库

## 1. Identity

- **What it is:** 基于 `@yhjs/lunar` 干支数据和 `@yhjs/bagua` 术数基础的八字排盘 TypeScript 库，提供四柱计算、十神分析、大运排列、流年流月推演和神煞判定。
- **Purpose:** 为"承明 AI"命理计算后端提供完整的八字排盘能力，输入出生时间和性别，输出四柱、大运、流年、流月、神煞等全部命理数据。

## 2. High-Level Description

`@yhjs/bazi`（版本 `0.1.0`）是 monorepo 中的第三个核心包，运行时依赖 `@yhjs/lunar`（干支/节气/儒略日计算）和 `@yhjs/bagua`（五行关系/十神/六十甲子）。采用私有构造器 + `Bazi.create()` 静态工厂模式，内部由 6 个纯函数子模块组合：pillar（四柱干支）-> analysis（十神/藏干）-> dayun（大运）-> liunian（流年/流月）-> shensha（神煞），最终由 `Bazi` 主类统一编排。

## 3. 六个子模块概述

| 子模块 | 文件 | 核心导出 | 职责 |
|--------|------|----------|------|
| **types** | `packages/bazi/src/types.ts` | 10 个类型定义 | Gender, Pillar, HiddenGodEntry, DayunEntry, LiunianEntry, LiuyueEntry, ShenshaResult, BaziMeta, BaziOptions, BaziBoardData |
| **pillar** | `packages/bazi/src/pillar.ts` | `dateToJd`, `computeFourPillars` | Date -> J2000 儒略日转换，调用 lunar 的 4 个干支函数获取年月日时柱 |
| **analysis** | `packages/bazi/src/analysis.ts` | `buildPillar`, `buildAllPillars` | 基于日主天干计算十神关系，展开地支藏干（main/middle/minor 三级权重） |
| **dayun** | `packages/bazi/src/dayun.ts` | `isDayunReverse`, `findTargetJie`, `computeStartAge`, `computeDayun` | 阴阳顺逆判定、查找目标节气、三天折一年算起运年龄、9 步大运排列 |
| **liunian** | `packages/bazi/src/liunian.ts` | `computeLiunian`, `computePreDayunLiunian`, `computeLiuyue` | 大运内 10 年流年、运前流年、五虎遁 12 流月干支 |
| **shensha** | `packages/bazi/src/shensha.ts` | `computeHorse`, `computeGuiren`, `computeSeasonPower`, `computeShensha` | 驿马（三合冲）、天乙贵人（阳贵/阴贵）、空亡、旺相休囚死 |

## 4. 关键技术特征

- 主入口：`Bazi.create({ datetime, gender })` 静态工厂，返回不可变 `Bazi` 实例
- 惰性计算：流年/流月/神煞通过实例方法按需计算（`getLiunian`, `getLiuyue`, `getShensha`）
- 大运参数：`DESTINY_DAY_VALUE = 121.7474`（三天折一年系数），9 步 x 10 年
- 五虎遁月干：`TIGER_GAN_BASE = [2, 4, 6, 8, 0]`（甲己→丙, 乙庚→戊, ...）
- 序列化：`toJSON()` 返回 `BaziBoardData`，将 Gan/Zhi 对象转为字符串名称
- 依赖的 lunar API：`gregorianToJD`, `J2000`, `calculateLunarYear`, `jdToGregorian`, `getYearGanZhi`, `getMonthGanZhi`, `getDayGanZhi`, `getHourGanZhi`
- 依赖的 bagua API：`ganZhi()`, `zhi()`, `tenGod()`, `Gan`, `GanZhi`, `Zhi`, `TenGod` 等类型
