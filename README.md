# @yhjs/monorepo

> 承明 AI 玄学计算 TypeScript 库集合

基于[寿星天文历](http://bbs.nongli.net/dispbbs_2_14995.html)（许剑伟）的现代 TypeScript 实现，提供术数基础、农历天文、八字排盘、奇门遁甲、大六壬等完整计算引擎。

## 📦 包

| 包 | 版本 | 说明 |
|---|---|---|
| [`@yhjs/bagua`](./packages/bagua) | [![npm](https://img.shields.io/npm/v/@yhjs/bagua)](https://www.npmjs.com/package/@yhjs/bagua) | 术数基础 - 天干地支、五行关系、六十甲子、八卦 |
| [`@yhjs/lunar`](./packages/lunar) | [![npm](https://img.shields.io/npm/v/@yhjs/lunar)](https://www.npmjs.com/package/@yhjs/lunar) | 农历天文 - 公农历互转、干支节气、天文星历、日月食 |
| [`@yhjs/dunjia`](./packages/dunjia) | [![npm](https://img.shields.io/npm/v/@yhjs/dunjia)](https://www.npmjs.com/package/@yhjs/dunjia) | 奇门遁甲 - 时家/山向奇门、九星八门八神、二十四山 |
| [`@yhjs/bazi`](./packages/bazi) | [![npm](https://img.shields.io/npm/v/@yhjs/bazi)](https://www.npmjs.com/package/@yhjs/bazi) | 八字排盘 - 四柱大运、流年流月、神煞、柱位分析 |
| [`@yhjs/liuren`](./packages/liuren) | [![npm](https://img.shields.io/npm/v/@yhjs/liuren)](https://www.npmjs.com/package/@yhjs/liuren) | 大六壬 - 天盘贵神、三传计算、十二宫、太阴标记 |

### 依赖关系

```
bagua (零依赖)
  ↑
lunar (依赖 bagua)
  ↑
dunjia / bazi / liuren (均依赖 bagua + lunar)
```

## ✨ 特性

- 🧱 **术数基础** - 天干地支、五行生克、十神十二长生、六十甲子、先后天八卦
- 🎯 **高精度算法** - 寿星万年历 5.10，VSOP87 行星/太阳，ELP/MPP02 月球
- 📅 **完整农历** - 公农历互转（前 721 年至今）、干支、节气、生肖、节日
- 🌙 **天文计算** - 日月行星位置、升降时刻、月相、日月食、晨昏光
- 🎲 **奇门遁甲** - 时家/山向奇门排盘、移星换斗、外圈神煞插件
- 🧭 **二十四山** - 罗盘系统、三盘查询、三元局数计算
- 📊 **八字排盘** - 四柱大运、流年流月、神煞、十神十二长生、纳音
- 👑 **大六壬** - 天盘月将、贵神排布、三传计算、十二宫、太阴
- 📘 **TypeScript** - 严格模式、branded types、完整类型定义
- 🚀 **零外部依赖** - 无第三方运行时依赖
- 📦 **双格式** - ESM + CJS，支持 Node.js 16+

## 🚀 快速开始

### 术数基础

```typescript
import { gan, zhi, ganZhi, tenGod, twelveState } from '@yhjs/bagua'

const jia = gan('甲')
console.log(jia.wuxing) // '木'

const god = tenGod(gan('甲'), gan('丙')) // { name: '食神', short: '食' }
const state = twelveState(gan('甲'), zhi('寅')) // '长生'

const gz = ganZhi('甲子')
console.log(gz.nayin.name) // '海中金'
```

### 农历日期

```typescript
import { LunarDate } from '@yhjs/lunar'

const date = new LunarDate(2024, 2, 10)
console.log(date.ganZhiYear()) // 甲辰
console.log(date.zodiac()) // 龙
```

### 奇门遁甲排盘

```typescript
import { TimeDunjia } from '@yhjs/dunjia'

const board = TimeDunjia.create({ datetime: new Date() })
console.log(board.meta.yinYang) // 阳遁/阴遁
console.log(board.meta.juNumber) // 局数

for (let i = 0; i < 9; i++) {
  const p = board.palace(i)
  console.log(`${p.star.name} ${p.door.name} ${p.god.name}`)
}
```

### 八字排盘

```typescript
import { Bazi } from '@yhjs/bazi'

const bazi = Bazi.create({
  datetime: new Date(1990, 0, 15, 10, 0, 0),
  gender: '男',
})

const pillars = bazi.fourPillars()
console.log(pillars.year.name) // 如 '己巳'
console.log(pillars.day.name)  // 如 '庚午'

const dayun = bazi.dayun() // 十步大运
```

### 大六壬排盘

```typescript
import { buildLiurenBoard } from '@yhjs/liuren'
import { ganZhi } from '@yhjs/bagua'

const board = buildLiurenBoard({
  datetime: new Date(1985, 2, 15, 14, 0, 0),
  keyGanZhi: ganZhi('癸丑'),
})

board.palaces.forEach((p) => {
  console.log(p.zhi.name, p.tianpan.name, p.guiGod?.name)
})
console.log(board.legend.ganLegend.map(z => z.name)) // 干传三步
```

## 🔧 开发

### 环境要求

- Node.js >= 16
- pnpm >= 9

### 常用命令

```bash
# 安装依赖
pnpm install

# 全量构建
pnpm build

# 全量测试
pnpm test

# 单包测试
pnpm --filter @yhjs/bagua test:run
pnpm --filter @yhjs/lunar test:run
pnpm --filter @yhjs/dunjia test:run
pnpm --filter @yhjs/bazi test:run
pnpm --filter @yhjs/liuren test:run
```

## 🏗️ 技术栈

| 层面 | 工具 |
|------|------|
| 包管理 | pnpm workspace |
| 语言 | TypeScript ^5.9 (strict) |
| 构建 | Vite 7 (library mode) + vite-plugin-dts |
| 测试 | Vitest 4 + @vitest/coverage-v8 |
| 代码规范 | @antfu/eslint-config |

## 📁 项目结构

```
├── packages/
│   ├── bagua/                  @yhjs/bagua - 术数基础
│   │   └── src/               天干地支、五行、十神、六十甲子、八卦
│   ├── lunar/                  @yhjs/lunar - 农历天文计算
│   │   └── src/
│   │       ├── core/           数学基础、儒略日、ΔT、岁差、章动
│   │       ├── ephemeris/      太阳/月球/行星星历、升降、晨昏
│   │       ├── lunar/          农历、干支、节气、节日、LunarDate
│   │       ├── eclipse/        日食/月食
│   │       ├── astronomy/      高层天文 API
│   │       └── data/           VSOP87 系数表、城市、年号
│   ├── dunjia/                 @yhjs/dunjia - 奇门遁甲排盘
│   │   └── src/
│   │       ├── base/           五行、八卦、九宫拓扑、六甲旬
│   │       ├── model/          九星、八门、八神数据
│   │       ├── board/          排盘流水线 + TimeDunjia/PosDunjia
│   │       ├── mountain/       罗盘二十四山、三盘、三元局数
│   │       └── outer-gods/     外盘神煞插件
│   ├── bazi/                   @yhjs/bazi - 八字排盘
│   │   └── src/               四柱、大运、流年流月、神煞、柱位分析
│   └── liuren/                 @yhjs/liuren - 大六壬排盘
│       └── src/               月将天盘、贵神、三传、十二宫、太阴
└── src-legacy/                 寿星天文历原始 JS 源码
```

## 📄 许可证

MIT

## 🙏 致谢

- 算法原作者：许剑伟 - [寿星万年历](http://bbs.nongli.net/dispbbs_2_14995.html)
- 原始代码：寿星天文历 V5.10.3
