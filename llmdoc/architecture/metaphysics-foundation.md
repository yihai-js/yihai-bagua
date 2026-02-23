# 术数基础模块架构

## 1. Identity

- **What it is:** 奇门遁甲排盘所需的术数基础数据层，包含五行、八卦、九宫、旬四大子模块。
- **Purpose:** 为上层 model/ 和 board/ 提供枚举常量、关系查询、宫位拓扑遍历等基础能力。

## 2. 数据层级

类型定义与基础模块的依赖方向为单向链式：

`types.ts`（Wuxing 枚举、StarInfo/DoorInfo/GodInfo/Palace 接口） --> `base/`（五行关系、八卦属性、九宫拓扑、旬数据） --> `model/`（九星/八门/八神数据数组）

- `packages/dunjia/src/types.ts`（Wuxing, Palace, StarInfo, DoorInfo, GodInfo）: 全局类型定义源头。
- `packages/dunjia/src/base/index.ts`: 桶文件，统一导出四个子模块的全部公开符号。

## 3. Core Components

- `packages/dunjia/src/base/wuxing.ts`（Wuxing, WUXING_NAMES, WuxingRelation, RELATION_TABLE, getWuxingRelation）: 从 types.ts 重导出 Wuxing 枚举（木=0 火=1 土=2 金=3 水=4），定义五行名称数组、五种关系类型（生/克/泄/耗/比）、5x5 关系查找表，以及 O(1) 关系查询函数。
- `packages/dunjia/src/base/bagua.ts`（BaguaInfo, BAGUA_LIST, getBagua, compareBagua）: 定义后天八卦序列及其先天卦名、阴阳属性、五行属性、三爻字符串；提供按索引/名称查询和爻比较功能。
- `packages/dunjia/src/base/nine-palace.ts`（PALACE_BAGUA_NAMES, PALACE_AFTER_NUMS, CENTER_PALACE, EXTRA_PALACE, CLOCK_POINTERS, traverseByClock, traverseByAfterNum, fixedIndex, getIndexByAfterNum, getOffsetPalaceNum）: 定义九宫网格拓扑、顺/逆时针遍历、后天数序遍历、中宫寄坤宫逻辑。
- `packages/dunjia/src/base/xun.ts`（XunInfo, XUN_LIST, LIUYI_LIST, getXun, getXunFromGanZhiIndex）: 定义六旬、六仪、三奇数据；提供干支索引到旬的映射。

## 4. Execution Flow (LLM Retrieval Map)

### 4.1 五行关系查询

- **1.** 调用 `getWuxingRelation(a, b)` — `packages/dunjia/src/base/wuxing.ts:31-33`
- **2.** 直接索引 `RELATION_TABLE[a][b]` 返回关系字符串 — `packages/dunjia/src/base/wuxing.ts:18-29`
- **关系循环:** 木生火、火生土、土生金、金生水、水生木；木克土、土克水、水克火、火克金、金克木。泄为生之逆，耗为克之逆，比为同元素。

### 4.2 八卦查询

- **1.** 调用 `getBagua(input)` 接受索引(0-7)或卦名字符串 — `packages/dunjia/src/base/bagua.ts:18-36`
- **2.** 从五个并行常量数组（BAGUA_LIST、BEFORE_BAGUA_LIST、YINYANG_LIST、WUXING_LIST、GUA_LIST）按索引组装 BaguaInfo。
- **后天八卦序:** `['坎','坤','震','巽','乾','兑','艮','离']`（索引 0-7）
- **先天卦名:** `['兑','坎','艮','坤','离','巽','乾','震']`（对应同一索引位）
- **三爻字符串:** `['010','000','001','110','111','011','100','101']`（0=阴爻, 1=阳爻）

### 4.3 九宫拓扑遍历

- **网格布局（数组索引 0-8）:**
  ```
  巽(0) 离(1) 坤(2)
  震(3) 中(4) 兑(5)
  艮(6) 坎(7) 乾(8)
  ```
- **后天宫数映射:** `PALACE_AFTER_NUMS = [4,9,2,3,5,7,8,1,6]` — `packages/dunjia/src/base/nine-palace.ts:2`
- **中宫寄宫:** `CENTER_PALACE=4`, `EXTRA_PALACE=2`（坤宫）。`fixedIndex(4)` 返回 2 — `packages/dunjia/src/base/nine-palace.ts:42-44`
- **顺时针遍历:** `traverseByClock(start, count, cb)` 使用 `CLOCK_POINTERS` 邻接表。正数顺时针、负数逆时针。中宫(4)拓扑上不会被外宫环路经过 — `packages/dunjia/src/base/nine-palace.ts:51-65`
- **后天数序遍历:** `traverseByAfterNum(start, count, cb)` 按 1-2-3-...-9 数序遍历，包含中宫。使用惰性初始化的 `afterNumPointers` 单例 — `packages/dunjia/src/base/nine-palace.ts:67-82`

### 4.4 旬与地盘排布

- **六旬:** `XUN_LIST = ['甲子','甲戌','甲申','甲午','甲辰','甲寅']` — `packages/dunjia/src/base/xun.ts:7`
- **六仪:** 每旬对应一个六仪天干 `['戊','己','庚','辛','壬','癸']`
- **地盘排布序列:** `LIUYI_LIST = ['戊','己','庚','辛','壬','癸','丁','丙','乙']`（9 元素：六仪 + 三奇丁丙乙）— `packages/dunjia/src/base/xun.ts:9`
- **干支索引转旬:** `getXunFromGanZhiIndex(ganZhiIndex)` 用 `Math.floor(((idx % 60) + 60) % 60 / 10)` 映射 0-59 干支索引到旬 — `packages/dunjia/src/base/xun.ts:19-22`

## 5. Design Rationale

- **Wuxing 定义在 types.ts 而非 wuxing.ts:** 避免循环依赖；types.ts 中的 Palace 等接口也依赖 Wuxing，统一定义位置可让 base/ 和 model/ 同时引用。
- **九宫索引 vs 后天数:** 内部统一使用 0-8 数组索引而非 1-9 后天数，通过 `PALACE_AFTER_NUMS` 和 `getIndexByAfterNum` 做双向转换。
- **CLOCK_POINTERS 硬编码:** 九宫顺逆时针路径是固定拓扑，硬编码邻接表比计算更高效。
- **afterNumPointers 惰性单例:** 后天数序遍历指针仅在首次调用时计算一次并缓存。
