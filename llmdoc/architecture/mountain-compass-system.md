# 二十四山向罗盘系统架构

## 1. Identity

- **What it is:** 二十四山向罗盘计算模块，提供山向数据查询、角度转换、三盘偏移和三元局数计算。
- **Purpose:** 作为山向奇门遁甲（PosDunjia）的基础数据层，将罗盘角度映射为山向信息，并计算排盘所需的局数。

## 2. Core Components

- `packages/dunjia/src/mountain/mountain.ts` (全部实现): 包含全部常量、类型定义和核心函数。唯一外部依赖为 `../types` 的 `Wuxing` 枚举。
- `packages/dunjia/src/mountain/index.ts` (barrel): 无逻辑的重导出文件，分离值导出与类型导出。
- `packages/dunjia/tests/mountain/mountain.test.ts` (37 tests): 覆盖数据完整性、角度转换、三盘偏移、对向计算、双山五行、三元局数。

### 2.1 数据常量（四套平行数组）

所有数组 24 元素，索引对齐。Index 0 = 0 度（癸），每 +1 索引 = +15 度。

| 常量 | 类型 | 说明 |
|---|---|---|
| `MOUNTAIN_NAMES` | `string[24]` | 山名序列：癸丑艮寅甲卯乙辰巽巳丙午丁未坤申庚酉辛戌乾亥壬子 |
| `MOUNTAIN_WUXING` | `number[24]` | 五行编码（木=0, 火=1, 土=2, 金=3, 水=4） |
| `MOUNTAIN_YINYANG` | `number[24]` | 阴阳编码（1=阳, 0=阴） |
| `MOUNTAIN_NAJIA` | `string[24]` | 纳甲八卦名（坎兑艮离乾震坤巽之一） |

附加常量：`PALACE_NAMES_8`（八宫名）、`PALACE_HUANGQUAN`（八宫黄泉煞）。

### 2.2 类型定义

| 类型 | 关键字段 | 用途 |
|---|---|---|
| `MountainInfo` | index, name, angle, wuxing, yinyang, najia | 完整山向属性查询结果 |
| `MountainDetail` | index, start, end | 含角度范围的山向定位，用于三元局数计算 |
| `PanType` | `'human' \| 'ground' \| 'sky'` | 三盘选择 |
| `NumData` | isSolar, numOffset, num | 三元局数计算结果 |

## 3. Execution Flow (LLM Retrieval Map)

### 3.1 角度到山向转换

- **1.** 输入罗盘角度，调用 `getMountainIndexFromAngle` (`mountain.ts:208-210`)。公式：`floor(normalize(angle) / 15)`，返回 0-23。
- **2.** 以索引调用 `getMountainInfo` (`mountain.ts:215-224`)，从四套平行数组读取属性，返回 `MountainInfo`。

### 3.2 三盘偏移系统

- **1.** 调用 `getMountainDetailFromAngle(angle, panType)` (`mountain.ts:233-242`)。
- **2.** 将 `panType` 映射为偏移量：`human=0`, `ground=1*7.5`, `sky=2*7.5`。
- **3.** 从输入角度减去偏移量后再做 `floor(tempAngle / 15)` 得到山向索引。
- **4.** 返回的 `start`/`end` 已加回偏移量，表示该盘中该山向的实际角度范围。

### 3.3 对向计算

- `getOppositeAngle(angle)` (`mountain.ts:247-249`): 返回 `(angle + 180) % 360`。
- `getOppositeMountain(index)` (`mountain.ts:254-256`): 返回 `(index + 12) % 24`，自身的逆运算。

### 3.4 双山五行

- `getZhiMountain(index)` (`mountain.ts:261-264`): 偶数索引返回 `MOUNTAIN_NAMES[index+1]`，奇数返回 `MOUNTAIN_NAMES[index]`。每对天干-地支共享地支名。

### 3.5 三元局数计算

- **1.** 调用 `getNumData(angle, humanMountain)` (`mountain.ts:271-294`)。`humanMountain` 须由 `getMountainDetailFromAngle(angle, 'human')` 预先获取。
- **2.** 阴阳遁判定：`humanMountain.index` 在 9(巳)-20(乾) 为阴遁，其余为阳遁。
- **3.** 分组：`groupIndex = floor(((index+26) % 24) / 3)`，查 `upStart = [1,8,3,4,9,2,7,6]` 得起始局数。
- **4.** 元偏移：`numOffset = floor(angleSub(angle, start) / 5)`，每 5 度为一元（上/中/下）。
- **5.** 阳遁正向叠加、阴遁反向叠加，经模 9 运算（范围 1-9）得最终 `num`。

## 4. Design Rationale

- **单一索引对齐设计：** 所有 24 元素数组共享索引，避免映射表，O(1) 查询。
- **三盘统一偏移：** 三种罗盘盘面通过简单角度减法实现，无需维护三套独立数据。
- **私有 `angleSub`：** 仅在 `getNumData` 内部使用，保持模块公共 API 精简。
- **下游消费者：** `packages/dunjia/src/board/pos-dunjia.ts` (PosDunjia) 导入本模块的 6 个核心函数构建山向奇门盘面。
