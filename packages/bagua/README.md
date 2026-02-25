# @yhjs/bagua

> 术数基础库 - 天干地支、五行关系、六十甲子、八卦

## ✨ 特性

- 🧱 **原语层** - 十天干、十二地支完整模型（五行、阴阳、藏干、十二长生）
- 🔗 **关系层** - 五行生克、十神、十二长生、干支合冲刑害破
- 🎯 **组合层** - 六十甲子、旬空六仪、先天/后天八卦
- 🏭 **工厂函数** - `gan()`、`zhi()`、`ganZhi()` 支持索引和名称查询
- 🔒 **不可变设计** - 所有对象均为 readonly，安全共享
- 📘 **TypeScript** - 完整的类型定义和 IDE 智能提示
- 📦 **零依赖** - 无任何外部依赖

## 📦 安装

```bash
npm install @yhjs/bagua
```

```bash
pnpm add @yhjs/bagua
```

## 🚀 快速开始

### 天干地支

```typescript
import { gan, zhi, ganZhi } from '@yhjs/bagua'

// 工厂函数支持索引和名称
const jia = gan(0)      // 甲
const zi = zhi('子')     // 子
const jiaZi = ganZhi(0)  // 甲子

// 属性访问
console.log(jia.name)     // '甲'
console.log(jia.wuxing)   // '木'
console.log(jia.yinyang)  // '阳'
console.log(zi.hiddenGan) // [{ gan, weight }] 藏干

// 地支支持模运算
const yin = zhi(2)        // 寅
const next = zhi(yin.index + 1) // 卯
```

### 五行关系

```typescript
import { wuxingRelation, tenGod, twelveState } from '@yhjs/bagua'

// 五行生克
const rel = wuxingRelation('木', '火') // '生'

// 十神
const god = tenGod(gan('甲'), gan('丙')) // { name: '食神', short: '食' }

// 十二长生
const state = twelveState(gan('甲'), zhi('寅')) // '长生'
```

### 干支关系

```typescript
import { ganRelation, zhiRelation, zhiTripleRelation } from '@yhjs/bagua'

// 天干关系
const gr = ganRelation(gan('甲'), gan('己')) // '合'

// 地支关系
const zr = zhiRelation(zhi('子'), zhi('午')) // { type: '冲' }

// 地支三合
const tr = zhiTripleRelation(zhi('申'), zhi('子'), zhi('辰')) // { type: '三合', wuxing: '水' }
```

### 六十甲子与旬空

```typescript
import { ganZhi, getXun, JIA_ZI_TABLE } from '@yhjs/bagua'

const gz = ganZhi('甲子')
console.log(gz.name)      // '甲子'
console.log(gz.nayin.name) // '海中金'

// 旬空
const xun = getXun(gz)
console.log(xun.name)      // '甲子旬'
console.log(xun.kongWang)  // ['戌', '亥']
```

### 八卦

```typescript
import { getBagua, compareBagua, BAGUAS } from '@yhjs/bagua'

const qian = getBagua('乾')
console.log(qian.wuxing)       // '金'
console.log(qian.houtianIndex) // 后天八卦序号

// 先后天八卦对比
const result = compareBagua('乾', '离')
```

## 📚 导出概览

| 分层 | 导出 | 说明 |
|------|------|------|
| 原语 | `gan()`, `zhi()`, `GANS`, `ZHIS` | 天干/地支工厂与常量 |
| 关系 | `wuxingRelation()`, `tenGod()`, `twelveState()` | 五行/十神/十二长生 |
| 关系 | `ganRelation()`, `zhiRelation()`, `zhiTripleRelation()` | 干支合冲刑害 |
| 组合 | `ganZhi()`, `getXun()`, `getBagua()` | 甲子/旬空/八卦 |

## 🧪 测试

```bash
pnpm test
```

## 📄 许可证

MIT
