# @yhjs/liuren — 大六壬排盘库迁移设计

> 从 chengming-mobile 迁移六壬算法到 @yhjs/monorepo

## 1. 概述

**包名:** `@yhjs/liuren` (v0.1.0)
**定位:** 独立包，与 bazi/dunjia 平级
**架构:** 纯函数流水线（与 dunjia 一致）
**依赖:** `@yhjs/lunar` + `@yhjs/bagua`

**源代码参考（chengming-mobile）：**
- `class/stage/liuren.js` — 六壬排盘核心类（~396行）
- `class/stage/baseStage.js` — 地支十二宫基类
- `class/bagua/guiGod.js` — 十二神将数据
- `class/bagua/zhi.js` — 月将全名、天三门标记
- `class/bagua/gan.js` — 十天干寄宫表（liurenZhiList）
- `class/relation/timeGod.js` — 天乙贵人、太阴、旺相休囚等神煞
- `class/date/cmDate.js` — 月将初始化（initStar）

## 2. 模块划分

```
packages/liuren/src/
├── types.ts        — 核心类型（ZhiPalace, LiurenBoard, LegendResult, 等）
├── yuejiang.ts     — 月将计算（节气→月将地支）+ 天盘排布
├── guigod.ts       — 十二神将数据 + 贵神排布（阴阳贵人）
├── legend.ts       — 三传计算（干传/支传，含伏吟处理）
├── outer.ts        — 外层排布（外天干/十二建/十二宫/太阴）
├── destiny.ts      — 时运命计算
├── board.ts        — 流水线组合入口 buildLiurenBoard()
└── index.ts        — 公共导出
```

## 3. 核心数据类型

```typescript
/** 十二神将信息 */
interface GuiGodInfo {
  readonly name: string        // 贵人/螣蛇/朱雀/...
  readonly index: number       // 0-11
}

/** 地支十二宫（单个宫位） */
interface ZhiPalace {
  readonly zhi: Zhi                    // 地盘地支
  readonly tianpan: Zhi                // 天盘月将
  readonly guiGod: GuiGodInfo | null   // 十二神将
  readonly outerGan: Gan | null        // 外天干
  readonly jianChu: string | null      // 十二建
  readonly twelvePalace: string | null // 十二宫
  readonly taiyin: boolean             // 是否太阴
}

/** 三传结果 */
interface LegendResult {
  readonly ganLegend: readonly [Zhi, Zhi, Zhi]  // 干传三步
  readonly zhiLegend: readonly [Zhi, Zhi, Zhi]  // 支传三步
}

/** 时运命结果 */
interface DestinyResult {
  readonly time: Zhi      // 时辰地支
  readonly destiny: Zhi   // 月将地支
  readonly live: Zhi      // 宿命/生肖地支
}

/** 排盘元数据 */
interface LiurenMeta {
  readonly datetime: Date
  readonly fourPillars: { year: GanZhi; month: GanZhi; day: GanZhi; hour: GanZhi }
  readonly yuejiang: Zhi           // 月将地支
  readonly keyGanZhi: GanZhi       // 用神干支
  readonly guiGodType: 'yang' | 'yin'  // 实际使用的贵人类型
}

/** 输入参数 */
interface LiurenOptions {
  datetime: Date
  keyGanZhi: GanZhi                       // 用神干支
  keyShengXiao?: Zhi                      // 宿命地支（可选）
  guiGodType?: 'auto' | 'yang' | 'yin'   // 贵人类型，默认 auto
}

/** 完整排盘结果 */
interface LiurenBoard {
  readonly meta: LiurenMeta
  readonly palaces: readonly ZhiPalace[]  // 12宫
  readonly legend: LegendResult           // 三传
  readonly destiny: DestinyResult         // 时运命
}
```

## 4. 排盘流水线

```
buildLiurenBoard(options: LiurenOptions): LiurenBoard
  ├── 1. resolveMeta()        — 解析日期→四柱/JD/月将地支
  ├── 2. initPalaces()        — 创建空白十二宫地盘
  ├── 3. setTianpan()         — 从月将+时支排天盘
  ├── 4. setGuiGods()         — 排十二神将（阴阳贵人）
  ├── 5. setOuterGan()        — 排外天干（十干寄宫）
  ├── 6. setJianChu()         — 排十二建
  ├── 7. setTwelvePalaces()   — 排十二宫
  ├── 8. setTaiyin()          — 标记太阴宫位
  ├── 9. computeLegend()      — 计算三传（干传+支传）
  └── 10. computeDestiny()    — 计算时运命
```

每一步都是纯函数，接收前一步的状态，返回新的不可变状态。

### 4.1 月将计算（yuejiang.ts）

从 `@yhjs/lunar` 的 `calculateLunarYear(jd).zhongQi` 获取节气 JD 数组，找到出生 JD 所在的节气区间（偶数索引=中气），映射到月将地支。

月将对应表：雨水后→亥(登明)，春分后→戌(河魁)，谷雨后→酉(从魁)，...，大寒后→子(神后)。即中气索引递增时，月将地支索引递减。

### 4.2 天盘排布（yuejiang.ts）

以时支为定位点，月将落在时支对应宫位，然后顺时针排布其余11个天盘地支。

### 4.3 十二神将（guigod.ts）

十二神将：贵人、螣蛇、朱雀、六合、勾陈、青龙、天空、白虎、太常、玄武、太阴、天后。

阴阳贵人判断：时支 index 3~8（卯~申）默认用阳贵人，否则用阴贵人。支持手动覆盖。

贵人起排规则：
1. 从天干贵人表查得贵人地支（与 bazi 的天乙贵人表相同）
2. 贵人地支落宫的天盘地支即为贵人起点
3. 落亥到辰（index 11,0,1,2,3,4）→ 顺排
4. 落巳到戌（index 5,6,7,8,9,10）→ 逆排

### 4.4 三传计算（legend.ts）

**干传：** 以用神天干寄宫地支（GAN_JIGONG[gan.index]）为起点，在天盘中找该地支对应宫位的天盘地支作为初传，连续取三步。

**支传：** 以用神地支为起点，同样连续取三步天盘地支。

**伏吟处理：** 当某位的天盘=地盘时：
- 首传取寄宫地支
- 后续传取相刑地支
- 自刑者取相冲地支

### 4.5 时运命（destiny.ts）

三个字段：
- `time`：时辰地支
- `destiny`：时支对应宫位的天盘月将地支
- `live`：宿命/生肖地支（默认用时支，可由用户指定）

## 5. 关键数据表

| 数据表 | 用途 | 来源 |
|--------|------|------|
| `YUEJIANG_MAP` | 中气索引→月将地支索引 | CMDate.initStar + dateConfig |
| `GUI_GOD_NAMES` | 十二神将名称 | guiGod.js godList |
| `GUI_GOD_ZHI` | 神将→地支映射 | guiGod.js godZhiList |
| `GAN_JIGONG` | 十干寄宫地支索引 | gan.js liurenZhiList = [2,4,5,7,5,7,8,10,11,1] |
| `XING_TABLE` | 地支相刑表 | 新增（伏吟三传用） |
| `CHONG_TABLE` | 地支相冲表 | 可从 bagua zhiRelation 获取 |
| `TIANMEN_LIST` | 天三门标记 | zhi.js isSkyDoorList |
| `YUEJIANG_NAMES` | 月将全名 | zhi.js yuejiangList |

## 6. 依赖关系

```
@yhjs/liuren
  ├── @yhjs/lunar   — gregorianToJD, J2000, calculateLunarYear
  │                   getYearGanZhi, getMonthGanZhi, getDayGanZhi, getHourGanZhi
  └── @yhjs/bagua   — Gan, Zhi, GanZhi, ganZhi(), gan(), zhi()
                      tenGod(), wuxingRelation(), zhiRelation()
```

不依赖 @yhjs/dunjia 或 @yhjs/bazi。与 dunjia 有部分算法重叠（如贵人排布），但各自独立实现，不共享代码。

## 7. 与 dunjia 的共享方法处理

原版 chengming-mobile 中 `Liuren` 的多个静态方法（setYuejiang、setGuiGods、setLiurenGan、setJianchu、setTwelvePalaces、setTaiyin）同时被奇门遁甲调用。新版采用**各自独立**策略：liuren 和 dunjia 各自包含自己的实现，允许代码重复。原因：
1. 两个包的算法可能独立演进
2. 避免包间耦合
3. liuren 的实现可能需要针对六壬语境做调整

## 8. 测试策略

每个子模块独立测试 + 端到端测试。重点验证场景：

1. **月将计算** — 各中气后的月将地支是否正确
2. **天盘排布** — 以已知时辰+月将验证12宫天盘
3. **阴阳贵人** — 卯时~申时自动选阳贵、其他选阴贵
4. **十二神将排布** — 顺排/逆排逻辑
5. **三传** — 用已知案例验证干传/支传结果
6. **伏吟** — 天盘=地盘时的特殊取传逻辑
7. **端到端** — buildLiurenBoard() 从日期到完整结果

测试数据从 chengming-mobile 运行实际排盘截取对照。
