# 外圈神煞插件系统架构

## 1. Identity

- **What it is:** 基于 `OuterGodPlugin` 接口的可扩展外圈神煞层系统。
- **Purpose:** 在排盘管道完成后，以叠加层（layer）的方式向九宫盘面添加额外的神煞数据（如十二建神），不影响核心盘面字段。

## 2. Core Components

- `packages/dunjia/src/types.ts` (`OuterGodPlugin`, `OuterGodLayer`, `OuterGodEntry`): 插件合约及数据结构定义。
- `packages/dunjia/src/outer-gods/jian-shen.ts` (`jianShen`): 十二建神插件实现，当前唯一的插件。
- `packages/dunjia/src/outer-gods/index.ts`: 插件聚合出口，单一 re-export `jianShen`。
- `packages/dunjia/src/board/time-dunjia.ts` (`TimeDunjia.applyOuterGod`): 插件应用入口，调用 `plugin.apply()` 并追加 layer。
- `packages/dunjia/src/board/pos-dunjia.ts` (`PosDunjia.applyOuterGod`): 与 TimeDunjia 相同的插件应用逻辑。

## 3. Execution Flow (LLM Retrieval Map)

### 3.1 OuterGodPlugin 接口

`packages/dunjia/src/types.ts:131-138`

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 神煞名称（如 `'十二建神'`） |
| `scope` | `('time'\|'pos')[]` | 声明适用的盘面类型（仅声明性，无框架层面强制） |
| `apply` | `(palaces, meta) => OuterGodLayer` | 接收当前宫位和元数据，返回一个 layer |

### 3.2 OuterGodLayer / OuterGodEntry

`packages/dunjia/src/types.ts:143-158`

- `OuterGodLayer`: `{ name: string, data: Record<number, OuterGodEntry> }`。`data` 的 key 为宫位索引（0-8），中宫(4)通常不出现。
- `OuterGodEntry`: `{ name: string, extra?: Record<string, unknown> }`。`extra` 为开放类型，插件可存储任意结构化数据。

### 3.3 插件应用流程

1. **调用:** `board.applyOuterGod(plugin)` -- `packages/dunjia/src/board/time-dunjia.ts:45-52`
2. **计算:** 调用 `plugin.apply([...this.palaces], this.meta)` 获得 `OuterGodLayer`
3. **叠加:** 对每个宫 `p`，创建新宫 `{ ...p, outerGods: [...p.outerGods, layer] }`
4. **返回:** 新的不可变实例。层是累加的，多次调用产生多层。

### 3.4 jianShen 插件实现 (十二建神)

`packages/dunjia/src/outer-gods/jian-shen.ts:29-69`

**12 -> 9 宫映射机制:**

- `ZHI_TO_PALACE = [7, 6, 6, 3, 0, 0, 1, 2, 2, 5, 8, 8]` -- 12 地支索引映射到 9 宫索引。中宫(4)永不出现。4 个宫各接收 2 个地支，4 个宫各接收 1 个。
- `JIANCHU_NAMES = ['建','除','满','平','定','执','破','危','成','收','开','闭']`
- `IS_GROUND_DOOR`: 除(1)、定(4)、破(6)、开(10) 标记为地户。

**算法流程:**

1. 从 `meta.ganZhi[1]` 提取地支字符，查找 `ZHI_NAMES` 索引作为起点
2. 循环 12 次：`zhiIndex = (startZhiIndex + i) % 12`，通过 `ZHI_TO_PALACE[zhiIndex]` 确定目标宫
3. 首次放入某宫时初始化 `OuterGodEntry`；后续同宫追加到 `extra.allEntries` 和 `extra.isGroundDoor`
4. 返回 `{ name: '十二建神', data }`

### 3.5 如何编写新插件

1. 在 `packages/dunjia/src/outer-gods/` 下创建新文件，导出符合 `OuterGodPlugin` 接口的对象
2. 实现 `apply(palaces, meta)` 函数，返回 `OuterGodLayer`。`data` 的 key 为目标宫索引，value 为 `OuterGodEntry`
3. 设置 `scope` 声明适用范围（`'time'`/`'pos'` 或两者）
4. 在 `packages/dunjia/src/outer-gods/index.ts` 中添加 re-export
5. 在 `packages/dunjia/src/index.ts` 中添加公共 API 导出
6. 参考 `packages/dunjia/tests/outer-gods/jian-shen.test.ts` 编写测试，验证: layer 名称正确、data 键不包含中宫(4)、entry 数据完整

## 4. Design Rationale

- **后置叠加:** 插件在管道完成后应用，不干扰核心排盘逻辑。`outerGods` 数组是 `Palace` 上唯一的扩展点。
- **累加不可变:** 每次 `applyOuterGod` 返回新实例，layer 只追加不覆盖。同一插件可多次应用（测试已验证）。
- **开放 extra:** `OuterGodEntry.extra` 为 `Record<string, unknown>`，允许插件存储任意附加数据而无需修改类型定义。
