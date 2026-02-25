# @yhjs/liuren

> 大六壬排盘计算库 - 天盘、贵神、三传、十二宫

## ✨ 特性

- 🎯 **完整排盘** - 13 步纯函数流水线，从日期到完整盘面
- 🌟 **天盘排布** - 月将计算 + 时支定位天盘
- 👑 **十二神将** - 贵人/螣蛇/朱雀等阴阳贵人排布
- ⚡ **三传计算** - 干传/支传，含伏吟相刑相冲特殊处理
- 🏛️ **十二宫** - 命宫定位，阴阳顺逆排布
- 📅 **十二建** - 建除满平定执破危成收开闭
- 🌙 **太阴标记** - 农历日查太阴表定位宫位
- 🔒 **不可变设计** - 每步返回新对象，纯函数无副作用
- 📘 **TypeScript** - 完整的类型定义和 IDE 智能提示

## 📦 安装

```bash
npm install @yhjs/liuren
```

```bash
pnpm add @yhjs/liuren
```

> `@yhjs/lunar` 和 `@yhjs/bagua` 会作为依赖自动安装。

## 🚀 快速开始

### 一键排盘

```typescript
import { buildLiurenBoard } from '@yhjs/liuren'
import { ganZhi } from '@yhjs/bagua'

const board = buildLiurenBoard({
  datetime: new Date(1985, 2, 15, 14, 0, 0),
  keyGanZhi: ganZhi('癸丑'), // 用神干支
})

// 元数据
console.log(board.meta.yuejiangZhi.name) // '亥' (登明)
console.log(board.meta.isFuyin)          // false
console.log(board.meta.guiGodType)       // 'yang' 或 'yin'

// 十二宫
board.palaces.forEach((p) => {
  console.log(p.zhi.name)          // 地盘地支
  console.log(p.tianpan.name)      // 天盘月将
  console.log(p.guiGod?.name)      // 十二神将
  console.log(p.outerGan?.name)    // 外天干
  console.log(p.jianChu)           // 十二建
  console.log(p.twelvePalace)      // 十二宫
  console.log(p.taiyin)            // 太阴标记
})

// 三传
const { ganLegend, zhiLegend } = board.legend
console.log(ganLegend.map(z => z.name)) // 干传三步
console.log(zhiLegend.map(z => z.name)) // 支传三步

// 时运命
console.log(board.destiny.time.name)    // 时辰
console.log(board.destiny.destiny.name) // 运
console.log(board.destiny.live.name)    // 命
```

### 排盘选项

```typescript
import { zhi } from '@yhjs/bagua'

const board = buildLiurenBoard({
  datetime: new Date(1985, 2, 15, 14, 0, 0),
  keyGanZhi: ganZhi('癸丑'),
  guiGodType: 'yin',       // 强制使用阴贵人（默认 auto）
  shengXiao: zhi('丑'),     // 指定生肖地支（默认用时支）
})
```

### 分步调用（高级）

```typescript
import {
  dateToJd,
  resolveYuejiang,
  initPalaces,
  setTianpan,
  setGuiGods,
  setOuterGan,
  setJianChu,
  setTwelvePalaces,
  setTaiyin,
  computeLegend,
  computeDestiny,
} from '@yhjs/liuren'

// 按需组合流水线步骤
const jd = dateToJd(new Date())
const yuejiangZhi = resolveYuejiang(jd)
let palaces = initPalaces()
palaces = setTianpan(palaces, yuejiangZhi, hourZhi)
// ...
```

## 📚 排盘流水线

```
buildLiurenBoard(options)
  ├── 1.  Date → J2000 儒略日
  ├── 2.  四柱干支
  ├── 3.  月将地支
  ├── 4.  贵人阴阳类型
  ├── 5.  地盘初始化
  ├── 6.  天盘排布
  ├── 7.  十二神将排布
  ├── 8.  外天干排布
  ├── 9.  十二建排布
  ├── 10. 十二宫排布
  ├── 11. 太阴标记
  ├── 12. 三传计算
  └── 13. 时运命计算
```

## 📚 导出概览

| 分类 | 导出 | 说明 |
|------|------|------|
| 入口 | `buildLiurenBoard()` | 一键排盘 |
| 月将 | `resolveYuejiang()`, `setTianpan()`, `YUEJIANG_NAMES` | 月将计算与天盘 |
| 贵神 | `setGuiGods()`, `resolveGuiGodType()`, `GUI_GOD_NAMES` | 十二神将排布 |
| 外层 | `setOuterGan()`, `setJianChu()`, `setTwelvePalaces()`, `setTaiyin()` | 外天干/十二建/十二宫/太阴 |
| 三传 | `computeLegend()`, `isFuyin()`, `GAN_JIGONG`, `XING_TABLE` | 三传与伏吟 |
| 时运命 | `computeDestiny()` | 时运命计算 |
| 辅助 | `dateToJd()`, `resolveIsSolar()`, `resolveTaiyinZhi()` | 日期/节气/太阴 |
| 常量 | `JIANCHU_NAMES`, `TWELVE_PALACE_NAMES`, `TAIYIN_TABLE`, `GUIREN_TABLE` | 数据表 |

## 🧪 测试

```bash
pnpm test
```

## 📄 许可证

MIT
