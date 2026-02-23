# @yhjs/monorepo

> 承明 AI 玄学计算 TypeScript 库集合

基于[寿星天文历](http://bbs.nongli.net/dispbbs_2_14995.html)（许剑伟）的现代 TypeScript 实现，提供精确的农历天文计算和奇门遁甲排盘引擎。

## 📦 包

| 包 | 版本 | 说明 |
|---|---|---|
| [`@yhjs/lunar`](./packages/lunar) | [![npm](https://img.shields.io/npm/v/@yhjs/lunar)](https://www.npmjs.com/package/@yhjs/lunar) | 农历天文计算 - 公农历互转、干支节气、天文星历、日月食 |
| [`@yhjs/dunjia`](./packages/dunjia) | [![npm](https://img.shields.io/npm/v/@yhjs/dunjia)](https://www.npmjs.com/package/@yhjs/dunjia) | 奇门遁甲排盘 - 时家/山向奇门、九星八门八神、二十四山 |

### 依赖关系

```
@yhjs/dunjia  ──depends──>  @yhjs/lunar
```

## ✨ 特性

- 🎯 **高精度算法** - 寿星万年历 5.10，VSOP87 行星/太阳，ELP/MPP02 月球
- 📅 **完整农历** - 公农历互转（前 721 年至今）、干支、节气、生肖、节日
- 🌙 **天文计算** - 日月行星位置、升降时刻、月相、日月食、晨昏光
- 🎲 **奇门遁甲** - 时家/山向奇门排盘、移星换斗、外圈神煞插件
- 🧭 **二十四山** - 罗盘系统、三盘查询、三元局数计算
- 📘 **TypeScript** - 严格模式、branded types、完整类型定义
- 🚀 **零外部依赖** - 无第三方运行时依赖
- 📦 **双格式** - ESM + CJS，支持 Node.js 16+

## 🚀 快速开始

### 农历日期

```typescript
import { LunarDate } from '@yhjs/lunar'

const date = new LunarDate(2024, 2, 10)
console.log(date.ganZhiYear()) // 甲辰
console.log(date.zodiac()) // 龙
console.log(date.format('农历lYYYY年lMM月lDD')) // 农历2024年正月初一
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
pnpm --filter @yhjs/lunar test:run
pnpm --filter @yhjs/dunjia test:run
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
│   ├── lunar/                  @yhjs/lunar - 农历天文计算
│   │   ├── src/
│   │   │   ├── core/           数学基础、儒略日、ΔT、岁差、章动
│   │   │   ├── ephemeris/      太阳/月球/行星星历、升降、晨昏
│   │   │   ├── lunar/          农历、干支、节气、节日、LunarDate
│   │   │   ├── eclipse/        日食/月食
│   │   │   ├── astronomy/      高层天文 API
│   │   │   └── data/           VSOP87 系数表、城市、年号
│   │   └── tests/
│   └── dunjia/                 @yhjs/dunjia - 奇门遁甲排盘
│       ├── src/
│       │   ├── base/           五行、八卦、九宫拓扑、六甲旬
│       │   ├── model/          九星、八门、八神数据
│       │   ├── board/          排盘流水线 + TimeDunjia/PosDunjia
│       │   ├── mountain/       罗盘二十四山、三盘、三元局数
│       │   └── outer-gods/     外盘神煞插件
│       └── tests/
└── src-legacy/                 寿星天文历原始 JS 源码
```

## 📄 许可证

MIT

## 🙏 致谢

- 算法原作者：许剑伟 - [寿星万年历](http://bbs.nongli.net/dispbbs_2_14995.html)
- 原始代码：寿星天文历 V5.10.3
