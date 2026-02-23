# @yhjs/dunjia

> 奇门遁甲排盘计算库 - 时家奇门与山向奇门

## ✨ 特性

- 🎯 **时家奇门** - 支持时/日/月/年/分家起局
- 🏔️ **山向奇门** - 罗盘角度起局，支持正盘/归一/合十/反转四种转盘
- 🧭 **二十四山** - 完整的罗盘系统，三盘（人盘/地盘/天盘）查询
- 🔌 **插件系统** - 外圈神煞插件架构，已内置十二建神
- 🔒 **不可变设计** - dayjs 风格的链式调用，所有操作返回新实例
- 📘 **TypeScript** - 完整的类型定义和 IDE 智能提示
- 📦 **零外部依赖** - 仅依赖 `@yhjs/lunar` 进行天文历法计算

## 📦 安装

```bash
npm install @yhjs/dunjia
```

```bash
pnpm add @yhjs/dunjia
```

```bash
yarn add @yhjs/dunjia
```

> `@yhjs/lunar` 会作为依赖自动安装。

## 🚀 快速开始

### 时家奇门

```typescript
import { TimeDunjia } from '@yhjs/dunjia'

// 以当前时间起局（默认时家）
const board = TimeDunjia.create({ datetime: new Date() })

// 查看盘面信息
console.log(board.meta.yinYang) // '阳遁' 或 '阴遁'
console.log(board.meta.juNumber) // 局数 1-9
console.log(board.meta.solarTerm) // 当前节气

// 遍历九宫
for (let i = 0; i < 9; i++) {
  const palace = board.palace(i)
  console.log(palace.star.name) // 九星
  console.log(palace.door.name) // 八门
  console.log(palace.god.name) // 八神
}

// 指定起局类型
const dayBoard = TimeDunjia.create({
  datetime: new Date('2024-06-21 10:00'),
  type: 'day', // 'hour' | 'day' | 'month' | 'year' | 'minute'
})
```

### 山向奇门

```typescript
import { PosDunjia } from '@yhjs/dunjia'

// 以罗盘角度起局
const board = PosDunjia.create({
  datetime: new Date('2024-06-21 10:00'),
  angle: 185, // 罗盘度数
  posType: 'year', // 'year' | 'dragon'
  trans: '正盘', // '正盘' | '归一' | '合十' | '反转'
})

console.log(board.meta.mountain) // 山向信息
console.log(board.meta.juNumber) // 局数
```

### 移星换斗

```typescript
// 链式调用，返回新实例
const shifted = board.moveStar(2) // 顺时针旋转 2 步
```

### 外圈神煞

```typescript
import { TimeDunjia, jianShen } from '@yhjs/dunjia'

const board = TimeDunjia.create({ datetime: new Date() })

// 应用十二建神
const withGods = board.applyOuterGod(jianShen)

// 查看宫位上的神煞
const palace = withGods.palace(0)
console.log(palace.outerGods) // [{ name: '建', ...entries }]
```

### 序列化与恢复

```typescript
// 序列化为 JSON
const data = board.toJSON()

// 从 JSON 恢复
const restored = TimeDunjia.from(data)
```

### 二十四山向 API

```typescript
import {
  getMountainIndexFromAngle,
  getMountainInfo,
  getMountainDetailFromAngle,
  getNumData,
  getOppositeAngle,
} from '@yhjs/dunjia'

// 从角度获取山向
const index = getMountainIndexFromAngle(185)
const info = getMountainInfo(index)
console.log(info.name) // 山向名称
console.log(info.wuxing) // 五行属性
console.log(info.yinyang) // 阴阳属性

// 三盘查询
const human = getMountainDetailFromAngle(185, 'human') // 人盘
const ground = getMountainDetailFromAngle(185, 'ground') // 地盘
const sky = getMountainDetailFromAngle(185, 'sky') // 天盘

// 三元局数
const numData = getNumData(185, human)
console.log(numData.isSolar) // 阳遁/阴遁
console.log(numData.num) // 局数 1-9

// 对向
const opposite = getOppositeAngle(185) // 5
```

## 📚 导出概览

| 导出路径 | 内容 |
|---------|------|
| `@yhjs/dunjia` | 主入口：TimeDunjia、PosDunjia、buildBoard、山向 API、模型数据 |
| `@yhjs/dunjia/outer-gods` | 外圈神煞插件（jianShen 十二建神） |

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 生成覆盖率报告
pnpm test:coverage
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

## 🙏 致谢

- 天文历法算法：许剑伟 - [寿星万年历](http://bbs.nongli.net/dispbbs_2_14995.html)
- 奇门遁甲排盘算法基于传统术数理论
