# @yhjs/bazi

> 八字排盘计算库 - 四柱、大运、流年流月、神煞

## ✨ 特性

- 🎯 **四柱排盘** - 年柱/月柱/日柱/时柱完整计算
- 📊 **大运推排** - 自动计算起运年龄与十步大运
- 📅 **流年流月** - 逐年逐月天干地支与十神关系
- ⭐ **神煞计算** - 天乙贵人、驿马、禄神、旺衰等
- 🔍 **柱位分析** - 十神、十二长生、藏干透出、纳音
- 🔒 **不可变设计** - `Bazi.create()` 静态工厂，所有数据 readonly
- 📘 **TypeScript** - 完整的类型定义和 IDE 智能提示

## 📦 安装

```bash
npm install @yhjs/bazi
```

```bash
pnpm add @yhjs/bazi
```

> `@yhjs/lunar` 和 `@yhjs/bagua` 会作为依赖自动安装。

## 🚀 快速开始

### 排盘

```typescript
import { Bazi } from '@yhjs/bazi'

const bazi = Bazi.create({
  datetime: new Date(1990, 0, 15, 10, 0, 0),
  gender: '男',
})

// 四柱
const pillars = bazi.fourPillars()
console.log(pillars.year.name)  // 如 '己巳'
console.log(pillars.month.name) // 如 '丁丑'
console.log(pillars.day.name)   // 如 '庚午'
console.log(pillars.hour.name)  // 如 '辛巳'

// 元数据
const meta = bazi.meta()
console.log(meta.dayMaster.name) // 日主天干
console.log(meta.startAge)       // 起运年龄
console.log(meta.kongWang)       // 空亡
```

### 柱位分析

```typescript
// 每一柱包含完整的关系分析
const dayPillar = bazi.pillar('day')
console.log(dayPillar.ganTenGod)     // 日干十神（空）
console.log(dayPillar.zhiTenGod)     // 日支十神
console.log(dayPillar.twelveState)   // 十二长生
console.log(dayPillar.nayin)         // 纳音
console.log(dayPillar.hiddenGods)    // 藏干及十神
```

### 大运

```typescript
const dayun = bazi.dayun()
dayun.forEach((d) => {
  console.log(d.ganZhi.name)  // 大运干支
  console.log(d.startAge)     // 起运年龄
  console.log(d.startYear)    // 起运公历年
})
```

### 流年流月

```typescript
// 某步大运的流年
const liunian = bazi.liunian(0) // 第一步大运
liunian.forEach((ln) => {
  console.log(ln.ganZhi.name)   // 流年干支
  console.log(ln.year)          // 公历年
  console.log(ln.ganTenGod)     // 天干十神
})

// 某流年的流月
const liuyue = bazi.liuyue(2024)
liuyue.forEach((ly) => {
  console.log(ly.ganZhi.name)   // 流月干支
  console.log(ly.month)         // 月份
})
```

### 神煞

```typescript
const shensha = bazi.shensha()
console.log(shensha.tianyi)     // 天乙贵人
console.log(shensha.yima)       // 驿马
console.log(shensha.lu)         // 禄神
console.log(shensha.seasonPower) // 旺衰
```

### 完整数据导出

```typescript
// 一次性获取全部排盘数据
const data = bazi.toJSON()
// 包含 meta, pillars, dayun, shensha 全部字段
```

## 📚 导出概览

| 导出 | 说明 |
|------|------|
| `Bazi` | 主类，`Bazi.create(options)` 创建排盘 |
| `computeFourPillars()` | 低级 API：从 JD 计算四柱 |
| `buildPillar()`, `buildAllPillars()` | 低级 API：柱位分析 |
| `computeDayun()` | 低级 API：大运推排 |
| `computeLiunian()`, `computeLiuyue()` | 低级 API：流年流月 |
| `computeShensha()` | 低级 API：神煞计算 |

## 🧪 测试

```bash
pnpm test
```

## 📄 许可证

MIT
