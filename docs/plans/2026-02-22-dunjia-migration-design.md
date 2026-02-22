# 遁甲算法迁移设计文档

> 日期：2026-02-22
> 关联计划：承明 AI 初步设计文档

## 1. 目标

将 `chengming-mobile` 中的遁甲算法（时家奇门 + 山向奇门）迁移至本项目，以独立 npm 包 `@yhjs/dunjia` 发布，适配承明 AI 的 Tool Use 消费模式。

## 2. 架构决策

### 2.1 Monorepo 结构

采用 pnpm workspace，不引入额外工具（turborepo、changesets 等）。

```
项目根目录/
  packages/
    lunar/          → @yhjs/lunar（现有代码整体搬入，不拆分）
    dunjia/         → @yhjs/dunjia（新包，依赖 @yhjs/lunar）
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json  → 共享编译选项 + paths 映射
  tsconfig.json       → 根目录脚本、eslint 配置等
  eslint.config.js
```

`@yhjs/dunjia` 通过 `workspace:*` 依赖 `@yhjs/lunar`。

### 2.2 开发时跨包引用

`tsconfig.base.json` 配置 paths 映射，开发时直接解析到源码，零构建延迟：

```json
{
  "compilerOptions": {
    "paths": {
      "@yhjs/lunar": ["./packages/lunar/src"],
      "@yhjs/lunar/*": ["./packages/lunar/src/*"]
    }
  }
}
```

各包 `tsconfig.json` extends `tsconfig.base.json`，构建和发布时走正常 npm 解析。

### 2.3 API 风格

不可变链式 API（dayjs 风格）。每个操作返回新实例，原实例不变。

- `.toJSON()` 序列化为 plain object，适配 MongoDB 存储和 Tool Use 返回值
- `.from()` 从 plain object 恢复实例，支持从 DB 加载后继续链式操作

### 2.4 外圈神煞

插件式架构。每种神煞是独立 transform 函数，通过 `.applyOuterGod()` 叠加到盘面上。核心类不硬编码任何具体神煞，新增神煞只需新增文件。

### 2.5 术数基础层

八卦、旬/六仪、五行关系、九宫等术数基础概念先放在 `@yhjs/dunjia` 内部。等六壬、八字等包出来时再提炼公共包，避免过早抽象。

## 3. 包内部结构

```
packages/dunjia/
  src/
    base/               # 术数基础
      wuxing.ts         #   五行 + 生克关系
      bagua.ts          #   八卦（先天/后天）
      xun.ts            #   旬/六仪
      nine-palace.ts    #   九宫拓扑（顺飞/逆飞、中宫寄坤）
    model/              # 遁甲模型
      star.ts           #   九星（蓬任冲辅英芮柱心禽）
      door.ts           #   八门（休生伤杜景死惊开中）
      god.ts            #   八神（符蛇阴六白玄地天）
    board/              # 排盘核心
      common.ts         #   共享排盘步骤（纯函数管道）
      time-dunjia.ts    #   TimeDunjia 类
      pos-dunjia.ts     #   PosDunjia 类
    mountain/           # 山向（PosDunjia 专属）
      mountain.ts       #   24 山、罗盘三盘、透地龙
    outer-gods/         # 外圈神煞插件
      types.ts          #   OuterGodPlugin / OuterGodLayer 接口
      yuejiang.ts       #   月将
      jian-shen.ts      #   十二建神
      shi-er-gong.ts    #   十二宫
      shen-jiang.ts     #   十二神将
      tai-yin.ts        #   太阴
      tian-gan.ts       #   天干
      da-you-nian.ts    #   大游年
      tai-yi.ts         #   太乙
      shi-er-chang-sheng.ts  # 十二长生（pos）
      jiang-shen.ts     #   将神（pos）
      guan-lian-bagua.ts    # 关联八卦（pos）
      xiao-you-nian.ts     # 小游年（pos）
      index.ts          #   统一导出
    types.ts            # 公共类型定义
    index.ts            # 包入口
  tests/
  package.json
  tsconfig.json
  vite.config.ts
```

## 4. 核心类型

```typescript
/** 九宫格单宫数据 */
interface Palace {
  index: number          // 宫位索引 0-8
  position: number       // 后天宫位数 (4,9,2,3,5,7,8,1,6)
  name: string           // 宫名（巽离坤震中兑艮坎乾）
  groundGan: string      // 地盘天干
  skyGan: string         // 天盘天干
  star: StarInfo         // 九星
  door: DoorInfo         // 八门
  god: GodInfo           // 八神
  outGan: string         // 隐干
  outerGods: OuterGodLayer[]  // 外圈神煞（按需叠加）
}

/** 盘面元数据 */
interface BoardMeta {
  type: 'hour' | 'day' | 'month' | 'year' | 'minute'
  datetime: Date
  yinyang: '阴' | '阳'
  juNumber: number       // 局数 1-9
  xunHead: string        // 旬首
  ganZhi: GanZhiInfo     // 对应干支
  solarTerm: string      // 所在节气
}

/** 外圈神煞插件接口 */
interface OuterGodPlugin {
  name: string
  scope: ('time' | 'pos')[]
  apply(palaces: Palace[], meta: BoardMeta): OuterGodLayer
}

/** 外圈神煞层数据 */
interface OuterGodLayer {
  name: string
  data: Record<number, OuterGodEntry>
}
```

## 5. API 设计

### 5.1 TimeDunjia

```typescript
// 起局
const board = TimeDunjia.create({
  datetime: new Date('2026-02-22T14:00:00'),
  type: 'hour',
})

// 链式操作
const updated = board
  .moveStar({ from: 2, to: 5 })
  .applyOuterGod(yuejiang)
  .applyOuterGods([jianShen, daYouNian])

// 查询
updated.palaces        // Palace[]
updated.meta           // BoardMeta
updated.palace(3)      // 单宫

// 序列化 / 反序列化
const json = updated.toJSON()
const restored = TimeDunjia.from(json)
```

### 5.2 PosDunjia

```typescript
const posBoard = PosDunjia.create({
  datetime: new Date('2026-02-22T14:00:00'),
  type: 'year',
  angle: 185.5,
  variant: 'normal',    // 'normal' | 'guiyi' | 'heshi' | 'fanzhuan'
})

posBoard.mountain       // 山信息
posBoard.direction      // 向信息
```

### 5.3 承明 AI Tool 消费示例

```typescript
function dunjia_shiju({ datetime, type, board_id, operation, params }) {
  if (!board_id) {
    const board = TimeDunjia.create({ datetime, type })
    return { board_id: save(board), ...board.toJSON() }
  }
  const board = TimeDunjia.from(load(board_id))
  const updated = board[operation](params)
  save(updated, board_id)
  return updated.toJSON()
}
```

### 5.4 导出方式

```typescript
// 全量
import { TimeDunjia, PosDunjia, allOuterGods } from '@yhjs/dunjia'

// 按需
import { TimeDunjia } from '@yhjs/dunjia'
import { yuejiang, jianShen } from '@yhjs/dunjia/outer-gods'
```

## 6. 排盘内部实现

排盘步骤是纯函数管道，每步接收当前状态，返回新状态：

```typescript
static create(options: TimeBoardOptions): TimeDunjia {
  const meta = resolveMeta(options)
  let palaces = createEmptyPalaces()
  palaces = initGroundGan(palaces, meta)   // 地盘三奇六仪
  palaces = initSkyGan(palaces, meta)      // 天盘
  palaces = initGods(palaces, meta)        // 八神
  palaces = initStars(palaces, meta)       // 九星
  palaces = initDoors(palaces, meta)       // 八门
  palaces = initOutGan(palaces, meta)      // 隐干
  return new TimeDunjia(meta, palaces)
}
```

## 7. 对 @yhjs/lunar 的依赖

窄且明确，只使用以下接口：

```typescript
import {
  TIAN_GAN, DI_ZHI, JIA_ZI_TABLE,
  getGanZhi, getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi,
  ganZhiToIndex,
  calculateShuoQi,
} from '@yhjs/lunar'
```

不依赖天文星历、日月食、农历日期转换、城市/纪年数据等模块。

## 8. 测试策略

以原版 `chengming-mobile` 的计算结果为基准，交叉验证。

### 8.1 测试分层

| 层次 | 范围 | 方式 |
|------|------|------|
| base/ | 五行关系全组合、八卦映射、旬/六仪 60 甲子全覆盖、九宫飞布 | 单元测试 |
| model/ | 九星/八门/八神属性、原始宫位 | 单元测试 |
| board/ | 阳遁/阴遁典型局全链路、移星换斗、序列化往返 | fixture 交叉验证 |
| outer-gods/ | 每个插件独立验证、多插件叠加互不干扰 | 单元测试 + fixture |
| mountain/ | 24 山边界角度、三盘偏移、透地龙 | 单元测试 + fixture |

### 8.2 fixture 生成

在原版 `chengming-mobile` 中跑一批测试用例，将输入参数和完整盘面输出序列化为 JSON，直接作为新包的测试 fixture。

## 9. 迁移步骤

| 步骤 | 内容 | 前置依赖 |
|------|------|----------|
| 1 | 搭建 monorepo 骨架（pnpm workspace、tsconfig.base.json） | 无 |
| 2 | 现有代码搬入 packages/lunar/，确认构建和测试通过 | 步骤 1 |
| 3 | 创建 packages/dunjia/ 空包骨架，确认跨包依赖解析正常 | 步骤 2 |
| 4 | 实现 base/（五行、八卦、旬、九宫） | 步骤 3 |
| 5 | 实现 model/（九星、八门、八神） | 步骤 4 |
| 6 | 实现 board/time-dunjia.ts — 排盘核心 | 步骤 4、5 |
| 7 | 生成 fixture，交叉验证 TimeDunjia | 步骤 6 |
| 8 | 实现 outer-gods/ 插件 | 步骤 6 |
| 9 | 实现 mountain/ + board/pos-dunjia.ts | 步骤 6 |
| 10 | PosDunjia 交叉验证 | 步骤 9 |

每个步骤完成后都有可运行的测试兜底。
