# 奇门遁甲排盘引擎架构

## 1. Identity

- **What it is:** 基于纯函数管道的奇门遁甲九宫排盘计算引擎。
- **Purpose:** 将日期时间（或罗盘角度）转换为完整的九宫盘面数据，包含地盘、天盘、八神、九星、八门、隐干六层信息。

## 2. Core Components

- `packages/dunjia/src/board/common.ts` (`resolveMeta`, `initGroundGan`, `initSkyGan`, `initGods`, `initStars`, `initDoors`, `initOutGan`, `buildBoard`, `buildBoardFromMeta`, `applyMoveStar`): 排盘管道的全部纯函数实现。每个 `init*` 函数开头调用 `clonePalaces()` 保证不可变性。
- `packages/dunjia/src/board/time-dunjia.ts` (`TimeDunjia`): 时家奇门不可变封装类，通过 `buildBoard` 起局。
- `packages/dunjia/src/board/pos-dunjia.ts` (`PosDunjia`): 山向奇门不可变封装类，通过 `resolveMeta` + `buildBoardFromMeta` 起局。
- `packages/dunjia/src/types.ts` (`Palace`, `BoardMeta`, `GroundGanResult`): 核心数据结构定义。
- `packages/dunjia/src/base/nine-palace.ts` (`traverseByClock`, `traverseByAfterNum`, `CLOCK_POINTERS`, `fixedIndex`, `CENTER_PALACE`, `EXTRA_PALACE`): 九宫拓扑遍历原语。
- `packages/dunjia/src/base/xun.ts` (`LIUYI_LIST`): 六仪三奇序列 `['戊','己','庚','辛','壬','癸','丁','丙','乙']`。
- `packages/dunjia/src/model/index.ts` (`nextStarDoorIndex`, `STARS`, `DOORS`, `GODS`): 星门神模型数据及索引导航。

## 3. Execution Flow (LLM Retrieval Map)

### 3.1 排盘管道 (7 步)

- **Step 1 - resolveMeta:** `packages/dunjia/src/board/common.ts:195-243`。输入: `TimeBoardOptions { datetime, type? }`。输出: `BoardMeta { yinyang, juNumber, ganZhi, xunHead, xunHeadGan, solarTerm, moveStarOffset: 0 }`。Date -> JD -> 四柱干支 -> 节气判阴阳 -> 局数 mod 9 -> 旬首。
- **Step 2 - initGroundGan:** `packages/dunjia/src/board/common.ts:270-329`。输入: `(palaces, meta)`。从 `juNumber` 对应宫起，阳顺/阴逆遍历九宫（`traverseByAfterNum`），放置 `LIUYI_LIST`。中宫天干寄坤宫（index 2, `EXTRA_PALACE`）的 `groundExtraGan`，然后清空中宫。输出: `GroundGanResult { palaces, headStarIndex, xunHeadGroundIndex, headStarDoorStarIndex, headStarDoorDoorIndex, isSpecialStar }`。
- **Step 3 - initSkyGan:** `packages/dunjia/src/board/common.ts:341-370`。输入: `(palaces, headStarIndex, xunHeadGroundIndex)`。两条顺时针序列同步遍历：天盘从 `fixedIndex(headStarIndex)` 起，地盘从 `fixedIndex(xunHeadGroundIndex)` 起，将地盘 `groundGan` 赋给天盘 `skyGan`。
- **Step 4 - initGods:** `packages/dunjia/src/board/common.ts:392-408`。输入: `(palaces, meta, headStarIndex)`。从 `fixedIndex(headStarIndex)` 起，阳顺/阴逆排 8 个 `GODS`（值符 -> 九天）。
- **Step 5 - initStars:** `packages/dunjia/src/board/common.ts:420-437`。输入: `(palaces, headStarIndex, headStarDoorStarIndex, isSpecialStar)`。始终顺时针，从值符星索引开始，通过 `nextStarDoorIndex` 导航（处理天禽星跳转逻辑）。
- **Step 6 - initDoors:** `packages/dunjia/src/board/common.ts:448-477`。输入: `(palaces, meta, headStarDoorDoorIndex, isSpecialStar)`。值使门 `originPalace` 加偏移（阳+/阴- `keyGanIndex`）确定起宫，顺时针排 8 门。输出: `{ palaces, headDoorIndex }`。
- **Step 7 - initOutGan:** `packages/dunjia/src/board/common.ts:490-570`。输入: `(palaces, meta, headStarIndex, headDoorIndex)`。分支 1 (正常): 地盘干从 `headStarIndex` 起复制到 `headDoorIndex` 起的 `outGan`。分支 2 (逢同求变): 以 `LIUYI_LIST` 从中宫入，通过 `traverseByAfterNum` 扩散，中宫寄坤。
- **Step 8 - 清理中宫:** `packages/dunjia/src/board/common.ts:627-638`。将 index=4 的所有内容字段清空，仅保留 `index`, `position`, `name`, `outerGods`。

### 3.2 buildBoard vs buildBoardFromMeta

- `buildBoard(options)` (`common.ts:581-641`): 调用 `resolveMeta(options)` 后执行 Step 2-8。入口: `TimeDunjia.create()`。
- `buildBoardFromMeta(meta)` (`common.ts:654-713`): 接受预构建的 `BoardMeta`，跳过 `resolveMeta`，直接 Step 2-8。入口: `PosDunjia.create()`，用于山向局覆盖 `yinyang` 和 `juNumber`。

### 3.3 applyMoveStar (移星换斗)

`packages/dunjia/src/board/common.ts:733-803`。顺时针旋转 8 个外宫数据：

1. 计算 `effectiveOffset = (newOffset - prevOffset) mod 8`
2. 从 index 0 起构建顺时针序列 `fullOrder`，确定目标起点 `fullOrder[effectiveOffset]`
3. 通过 `tempCache` 缓冲 9 个字段（`groundGan`, `skyGan`, `god`, `star`, `door`, `outGan` 及各 `Extra` 变体），避免就地覆盖
4. 中宫(index 4)不参与旋转

### 3.4 九宫拓扑

`packages/dunjia/src/base/nine-palace.ts`

- **索引布局:** index 0-8 对应 巽(4)、离(9)、坤(2)、震(3)、中(5)、兑(7)、艮(8)、坎(1)、乾(6)。括号内为后天宫位数 `PALACE_AFTER_NUMS`。
- **CLOCK_POINTERS:** 每个 index 的 `[顺时针下一个, 逆时针下一个]`，定义 8 外宫的空间环形遍历。
- **中宫寄坤:** `CENTER_PALACE=4`, `EXTRA_PALACE=2`。`fixedIndex(4)` 返回 2。中宫的天干数据在计算后寄存到坤宫的 `*ExtraGan` 字段。

### 3.5 Palace 数据结构 (14 字段)

`packages/dunjia/src/types.ts:25-52` -- `Palace` 接口:

| 字段 | 类型 | 说明 |
|------|------|------|
| `index` | `number` | 宫位索引 0-8 |
| `position` | `number` | 后天宫位数 |
| `name` | `string` | 八卦宫名 |
| `groundGan` | `string` | 地盘天干 |
| `groundExtraGan` | `string \| null` | 地盘寄宫干 |
| `skyGan` | `string` | 天盘天干 |
| `skyExtraGan` | `string \| null` | 天盘寄宫干 |
| `star` | `StarInfo \| null` | 九星 |
| `door` | `DoorInfo \| null` | 八门 |
| `god` | `GodInfo \| null` | 八神 |
| `outGan` | `string \| null` | 隐干 |
| `outExtraGan` | `string \| null` | 隐干寄宫 |
| `outerGods` | `OuterGodLayer[]` | 外圈神煞层（插件扩展点） |

## 4. Design Rationale

- **纯函数管道:** 每个 `init*` 函数通过 `clonePalaces()` 浅拷贝输入，保证无副作用。管道方向严格单向，步骤之间仅通过 `GroundGanResult` 和 `headDoorIndex` 传递中间状态。
- **中宫寄坤:** 中宫(index 4)参与计算但最终清空，其天干数据寄存到坤宫(index 2)的 `*ExtraGan` 字段，这是奇门遁甲"中五寄坤二"的传统规则。
- **GroundGanResult 桥接:** 此结构是管道各阶段之间唯一的辅助数据载体（除 `palaces` 数组本身外），避免了全局状态。
