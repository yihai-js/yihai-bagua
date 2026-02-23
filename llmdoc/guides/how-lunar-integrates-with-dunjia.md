# @yhjs/lunar 与 @yhjs/dunjia 的集成方式

`@yhjs/dunjia`（奇门遁甲排盘库）是 `@yhjs/lunar` 的主要下游消费者。本指南说明具体的依赖方式和数据流转。

1. **依赖声明:** `packages/dunjia/package.json` 将 `@yhjs/lunar` 声明为 `"workspace:*"` 依赖（唯一的运行时依赖）。

2. **核心导入:** `packages/dunjia/src/board/common.ts:11-22` 从 `@yhjs/lunar` 导入以下符号：
   - `gregorianToJD`, `J2000` -- 用于 `dateToJd()` 将 `Date` 转为 J2000 相对儒略日
   - `calculateLunarYear` -- 用于 `getPrevTermIndex()` 获取节气时刻数组（`yearData.zhongQi`），以及 `calculateJuNumber()` 获取合朔时刻数组（`yearData.heSuo`）计算农历日
   - `SOLAR_TERM_NAMES` -- 24 节气名称常量，用于判断阴阳遁和记录当前节气
   - `getYearGanZhi`, `getMonthGanZhi`, `getDayGanZhi`, `getHourGanZhi` -- 四柱干支推算
   - `ganZhiToIndex` -- 干支字符串转 60 甲子序号，用于确定旬首
   - `TIAN_GAN` -- 十天干常量，用于排盘中天干索引查找

3. **节气数据用途 -- 判断阴阳遁:**
   - `resolveMeta()` (`packages/dunjia/src/board/common.ts:195-243`) 调用 `getPrevTermIndex(jd)` 查找当前日期之前最近的节气
   - `getPrevTermIndex()` (`common.ts:103-120`) 调用 `calculateLunarYear(jd)` 获取 `yearData.zhongQi[0..24]`（从冬至起 25 个节气的 JD 时刻），遍历找到 jd 之前最近的节气索引
   - `determineYinYang()` (`common.ts:96-98`) 判断规则：索引 0-11（冬至到芒种）为阳遁，索引 12-23（夏至到大雪）为阴遁

4. **干支数据用途 -- 排盘核心:**
   - `resolveMeta()` 调用四柱干支函数获取年/月/日/时的天干地支
   - 干支数据决定：旬首（`ganZhiToIndex` -> 确定值符值使）、局数（`calculateJuNumber`）、地盘排布起点、天盘旋转方向
   - `calculateJuNumber()` (`common.ts:135-190`) 还通过 `calculateLunarYear(jd).heSuo` 计算当前农历日数

5. **验证集成是否正常:** 运行 `pnpm --filter @yhjs/dunjia test:run`，smoke test (`packages/dunjia/tests/smoke.test.ts`) 会验证 `buildBoard()` 完整管道（包含所有 lunar 调用）能正常输出盘面数据。

**数据流总结:**

```
Date -> gregorianToJD/J2000 -> jd (J2000-relative)
  -> calculateLunarYear(jd) -> { zhongQi[], heSuo[] }
     -> zhongQi: 判断阴阳遁 + 当前节气名
     -> heSuo: 计算农历日数 -> 局数
  -> getYear/Month/Day/HourGanZhi(jd) -> 四柱干支
     -> ganZhiToIndex -> 旬首 -> 值符值使
     -> TIAN_GAN 索引 -> 排盘步进方向
```
