# @yhjs/lunar 模块架构

## 1. Identity

- **What it is:** `@yhjs/lunar` 包的内部模块组织和执行流程的 LLM 检索地图。
- **Purpose:** 帮助开发者和 LLM Agent 快速定位功能实现文件和理解模块间调用关系。

## 2. Core Components

### core/ -- 基础数学层

- `packages/lunar/src/core/constants.ts` (`RAD`, `J2000`, `CS_AU`, `CS_K`): 天文常量定义，源自 `eph0.js`。
- `packages/lunar/src/core/julian.ts` (`gregorianToJD`, `jdToGregorian`, `JD`): 儒略日转换，处理 1582-10-15 儒略/格里历切换。
- `packages/lunar/src/core/delta-t.ts` (`calcDeltaT`, `deltaTFromJD`, `utToTD`, `tdToUT`): ΔT = TT - UT1 计算，表覆盖 -4000 至 2050。
- `packages/lunar/src/core/coordinate.ts` (`eclipticToEquatorial`, `equatorialToHorizontal`, `heliocentricToGeocentric`): 坐标系变换。
- `packages/lunar/src/core/nutation.ts` (`calculateNutation`): IAU2000B 章动序列（77 项）。
- `packages/lunar/src/core/precession.ts` (`calculateObliquity`, `equatorialJ2000ToDate`): 岁差模型（IAU1976/IAU2000/P03）。
- `packages/lunar/src/core/series.ts` (`calculateVSOP87Series`, `calculateMoonSeries`): VSOP87 和月球级数求和。
- `packages/lunar/src/core/cache.ts` (`LRUCache`, `memoize`): O(1) LRU 缓存，默认容量 100。
- `packages/lunar/src/core/types.ts` (`Radians`, `Degrees`, `JulianDay`): Brand 类型防止单位混用。

### data/ -- 静态数据层

- `packages/lunar/src/data/vsop87/` (10 files): 8 行星 VSOP87 系数 + 月球 6 参数级数 + 冥王星 Chebyshev 表。
- `packages/lunar/src/data/cities.ts` (`findCityByName`, `MAJOR_CITIES`): 中国城市经纬度压缩编码数据。
- `packages/lunar/src/data/eras.ts` (`findEraByYear`, `DYNASTIES`): 中国历史朝代和年号数据。

### ephemeris/ -- 天文星历层

- `packages/lunar/src/ephemeris/sun.ts` (`calculateSunGeocentricCoord`, `calculateTimeFromSunLongitude`, `calculateSolarTerms`): VSOP87 太阳位置，节气 JD 计算。
- `packages/lunar/src/ephemeris/moon.ts` (`calculateMoonGeocentricCoord`, `calculateTimeFromMoonSunDiff`): 高精度月球位置，朔望计算。
- `packages/lunar/src/ephemeris/planet.ts` (`calculatePlanetGeocentricCoord`, `calculatePlanetMagnitude`, `Planet`): 水星至海王星位置和视星等。
- `packages/lunar/src/ephemeris/rise-transit-set.ts` (`calculateSunRiseTransitSet`, `calculateMoonRiseTransitSet`): 日月升中天落。
- `packages/lunar/src/ephemeris/twilight.ts` (`calculateTwilight`, `TwilightType`): 民用/航海/天文晨昏光。

### lunar/ -- 农历日历层

- `packages/lunar/src/lunar/solar-term.ts` (`calculateShuoQi`, `calculateQiHigh`, `calculateShuoHigh`): 实朔实气计算引擎，含历史修正表（`SHUO_KB`/`QI_KB`，-721 至 1645 年均值；`SHUO_COMPRESSED`/`QI_COMPRESSED`，619-1960 修正）。
- `packages/lunar/src/lunar/calendar.ts` (`calculateLunarYear`, `getLunarDateInfo`): 农历年历构建，冬至起 25 中气 + 15 合朔，无中气置闰法。LRU 缓存。
- `packages/lunar/src/lunar/lunar-date.ts` (`LunarDate`, `lunar`): 主公共类，dayjs 风格 API，支持 format 模板。
- `packages/lunar/src/lunar/gan-zhi.ts` (`getYearGanZhi`, `getMonthGanZhi`, `getDayGanZhi`, `getHourGanZhi`, `getFullGanZhi`): 四柱干支、生肖、星座。
- `packages/lunar/src/lunar/festival.ts` (`getAllFestivals`, `SOLAR_FESTIVALS`, `LUNAR_FESTIVALS`): 公历/农历/按周节日。

### eclipse/ -- 日月食层

- `packages/lunar/src/eclipse/solar-eclipse.ts` (`findSolarEclipses`, `calculateSolarEclipse`, `searchSolarEclipseFast`): 日食搜索和详细计算，11 种日食类型。
- `packages/lunar/src/eclipse/lunar-eclipse.ts` (`findLunarEclipses`, `calculateLunarEclipse`): 月食搜索和详细计算。

### astronomy/ -- 用户 API 层

- `packages/lunar/src/astronomy/astronomy.ts` (`getSunPosition`, `getMoonPosition`, `getPlanetPosition`, `getSunTimes`, `getMoonTimes`, `getMoonPhase`, `getSolarTerms`): 接受 `Date | string` 和 `ObserverLocation`，封装 ephemeris 层。

### 主入口

- `packages/lunar/src/index.ts`: 汇总导出。`export *` 导出 core/eclipse/lunar；选择性导出 astronomy（7 函数 + 5 类型）、ephemeris（约 40 符号，避免与 astronomy 冲突）、data（城市/年号）。

## 3. Execution Flow (LLM Retrieval Map)

### 农历日期转换流程

- **1. 输入:** 用户创建 `LunarDate` -> `packages/lunar/src/lunar/lunar-date.ts:1-50`
- **2. 儒略日转换:** 调用 `gregorianToJD` -> `packages/lunar/src/core/julian.ts`
- **3. 年历构建:** 调用 `calculateLunarYear(jd)` -> `packages/lunar/src/lunar/calendar.ts`，查 LRU 缓存
- **4. 朔气计算:** `calculateShuoQi` -> `packages/lunar/src/lunar/solar-term.ts`，按年代分派至历史表/低精度修正/高精度算法
- **5. 高精度节气:** `calculateQiHigh` 调用 `calculateTimeFromSunLongitude` -> `packages/lunar/src/ephemeris/sun.ts`
- **6. 高精度合朔:** `calculateShuoHigh` 调用 `calculateTimeFromMoonSunDiff` -> `packages/lunar/src/ephemeris/moon.ts`
- **7. 闰月判定:** `calculateLunarYear` 用无中气置闰法确定闰月 -> `packages/lunar/src/lunar/calendar.ts`
- **8. 干支推算:** `getFullGanZhi` 用年历中的节气位置确定四柱 -> `packages/lunar/src/lunar/gan-zhi.ts`

### 天文位置计算流程

- **1. 输入:** `getSunPosition(date, location)` -> `packages/lunar/src/astronomy/astronomy.ts`
- **2. 日期转换:** Date/string -> JD -> 儒略世纪 T
- **3. 太阳坐标:** `calculateSunGeocentricCoord(T)` -> `packages/lunar/src/ephemeris/sun.ts`，内部调用 `calculateVSOP87Series` + `data/vsop87/earth.ts`
- **4. 修正:** 章动 (`calculateNutation`) + 黄赤交角 (`calculateObliquity`) -> `packages/lunar/src/core/nutation.ts`, `precession.ts`
- **5. 坐标变换:** 黄道 -> 赤道 -> 地平 -> 返回 `CelestialPosition`

## 4. Design Rationale

- **分层严格隔离:** core 不依赖上层模块，确保底层数学原语可独立测试和复用。
- **历史精度分治:** 对 -721 至 1645 年使用历史均值表 + 修正压缩表，1645 年后使用高精度天文算法，兼顾古历校验和现代精度。
- **Brand 类型:** 编译期防止弧度/角度/儒略日等单位混用错误，零运行时开销。
