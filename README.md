# @yhjs/lunar

> 寿星万年历 TypeScript 实现 - 精确的中国农历与天文计算库

## ✨ 特性

- 🎯 **精确算法** - 基于寿星万年历 5.10，100% 遵循原始算法
- 📅 **农历计算** - 支持公农历互转、节气、干支、生肖、节日
- 🌙 **日月食** - 精密的日食、月食计算与搜索
- 🪐 **天文计算** - 日月行星位置、升降时刻、月相、晨昏光等
- 🚀 **高性能** - LRU 缓存机制，重复计算速度提升 10x+
- 📘 **TypeScript** - 完整的类型定义和 IDE 智能提示
- 🎨 **现代化接口** - 类似 dayjs/moment 的链式调用

## 📦 安装

```bash
npm install @yhjs/lunar
```

```bash
pnpm add @yhjs/lunar
```

```bash
yarn add @yhjs/lunar
```

## 🚀 快速开始

### 农历日期

```typescript
import { LunarDate } from '@yhjs/lunar'

// 创建农历日期
const date = new LunarDate(2024, 2, 10)

// 获取信息
console.log(date.lunarYear()) // 2024
console.log(date.lunarMonth()) // 1
console.log(date.lunarDay()) // 1
console.log(date.ganZhiYear()) // 甲辰
console.log(date.zodiac()) // 龙
console.log(date.solarTerm()) // 立春

// 格式化
console.log(date.format('YYYY-MM-DD')) // 2024-02-10
console.log(date.format('农历lYYYY年lMM月lDD')) // 农历2024年正月初一
console.log(date.format('GY年GM月GD日')) // 甲辰年丙寅月辛巳日

// 从农历创建
const lunar = LunarDate.fromLunar(2024, 1, 1)
```

### 天文计算

```typescript
import { getSunPosition, getSunTimes } from '@yhjs/lunar'

// 太阳位置
const sun = getSunPosition('2024-06-21 12:00', {
  longitude: 116.4074,
  latitude: 39.9042,
})
console.log(sun.azimuth) // 方位角
console.log(sun.altitude) // 高度角

// 日出日落和晨昏光
const times = getSunTimes('2024-06-21', {
  longitude: 116.4074,
  latitude: 39.9042,
})
console.log(times.rise) // 日出
console.log(times.set) // 日落
console.log(times.civilDawn) // 民用晨光始
console.log(times.civilDusk) // 民用昏影终
console.log(times.nauticalDawn) // 航海晨光始
console.log(times.astronomicalDawn) // 天文晨光始
```

### 日月食

```typescript
import { searchSolarEclipse } from '@yhjs/lunar'

// 搜索日食
const eclipses = searchSolarEclipse({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
})

eclipses.forEach((e) => {
  console.log(e.type) // 日食类型
  console.log(e.maxTime) // 食甚时刻
  console.log(e.magnitude) // 食分
})
```

## 📚 API 文档

### LunarDate 类

```typescript
// 创建
const date = new LunarDate(2024, 2, 10) // 公历创建
const lunarDate = LunarDate.fromLunar(2024, 1, 1) // 农历创建
const d = lunar('2024-02-10') // 工厂函数

// 公历信息
  .year() // 公历年
  .month() // 公历月
  .date() // 公历日
  .day() // 星期

// 农历信息
  .lunarYear() // 农历年
  .lunarMonth() // 农历月
  .lunarDay() // 农历日
  .lunarMonthName() // 月名称（正、二、三...）
  .lunarDayName() // 日名称（初一、初二...）
  .isLeapMonth() // 是否闰月

// 干支信息
  .ganZhiYear() // 干支年
  .ganZhiMonth() // 干支月
  .ganZhiDay() // 干支日
  .ganZhiHour() // 干支时
  .zodiac() // 生肖
  .constellation() // 星座

// 节气与节日
  .solarTerm() // 当日节气
  .festivals() // 节日列表

// 日期操作
  .add(1, 'day') // 添加
  .subtract(1, 'month') // 减去
  .clone() // 克隆
  .isBefore(other) // 比较
  .diff(other, 'day') // 差值

// 格式化
  .format('YYYY-MM-DD') // 格式化输出
  .toString() // 转字符串
  .toDate() // 转Date对象
```

### 天文接口

```typescript
// 位置计算
getSunPosition(date, location) // 太阳位置
getMoonPosition(date, location) // 月球位置
getPlanetPosition(planet, date) // 行星位置

// 升降时刻
getSunTimes(date, location) // 日出日落+晨昏光
getMoonTimes(date, location) // 月升月落

// 月相与节气
getMoonPhase(date) // 月相
getSolarTerms(year) // 某年节气
```

### 日月食接口

```typescript
searchSolarEclipse(options) // 搜索日食
searchLunarEclipse(options) // 搜索月食
```

## 📊 性能

| 操作 | 无缓存 | 有缓存 | 加速比 |
|-----|--------|--------|--------|
| 计算农历年历 | ~4ms | ~0.2ms | 20x |
| 100年年历批量 | ~42ms | ~0.2ms | 200x |
| 农历日期转换 | ~1ms | ~0.1ms | 10x |

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 生成覆盖率报告
pnpm test:coverage

# 运行性能基准测试
pnpm benchmark
```

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 📄 许可证

MIT

本项目基于寿星万年历算法，原作者：许剑伟

## 🙏 致谢

- 原作者：许剑伟 - [寿星万年历](http://bbs.nongli.net/dispbbs_2_14995.html)
- 算法来源：寿星天文历 5.10
