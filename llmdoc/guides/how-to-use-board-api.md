# How to 使用排盘 API

使用 `TimeDunjia` 和 `PosDunjia` 类进行奇门遁甲排盘的操作指南。两个类共享相同的不可变链式 API 设计（类似 dayjs 风格），所有变更操作均返回新实例。

1. **TimeDunjia 时家起局:** 调用 `TimeDunjia.create({ datetime, type? })` 创建盘面。`type` 默认 `'hour'`，可选 `'day'`/`'month'`/`'year'`/`'minute'`。内部调用 `buildBoard()` 执行完整管道。参见 `packages/dunjia/src/board/time-dunjia.ts:24-27`。

2. **PosDunjia 山向起局:** 调用 `PosDunjia.create({ datetime, angle, posType?, trans? })`。`angle` 为罗盘度数，`posType` 默认 `'year'`（`'dragon'` 映射为 `'year'`），`trans` 默认 `'正盘'`（可选 `'归一'`/`'合十'`/`'反转'`）。内部先 `resolveMeta` 取四柱数据，再用罗盘推导的阴阳/局数覆盖，最后 `buildBoardFromMeta`。参见 `packages/dunjia/src/board/pos-dunjia.ts:76-119`。

3. **移星换斗 (.moveStar):** 调用 `board.moveStar(offset)` 获得新实例，8 个外宫数据顺时针旋转 `offset` 步。`offset` 为累计偏移量（0-7），引擎内部计算与前次偏移的差值。参见 `packages/dunjia/src/board/time-dunjia.ts:38-42`。

4. **应用外圈神煞 (.applyOuterGod / .applyOuterGods):** 调用 `board.applyOuterGod(jianShen)` 应用单个插件，或 `board.applyOuterGods([plugin1, plugin2])` 批量应用。每次调用在每个宫的 `outerGods` 数组追加一个 `OuterGodLayer`。插件需符合 `OuterGodPlugin` 接口。注意 `scope` 字段仅为声明性标记，调用方需自行判断适用性。参见 `packages/dunjia/src/board/time-dunjia.ts:45-57`。

5. **单宫查询与序列化:** `board.palace(index)` 返回指定宫的 `Palace` 对象。`board.toJSON()` 返回 `DunjiaBoardData` 纯对象（`datetime` 可能变为 ISO 字符串），适用于持久化。`TimeDunjia.from(data)` / `PosDunjia.from(data)` 从序列化数据恢复实例（内部 `new Date()` 还原时间）。参见 `packages/dunjia/src/board/time-dunjia.ts:59-70`。

6. **链式调用模式:** 所有变更方法返回新实例，原实例不变（`Object.freeze` 保护 `meta` 和 `palaces`），支持链式写法：`TimeDunjia.create(opts).moveStar(2).applyOuterGod(jianShen).toJSON()`。

7. **验证:** 运行 `packages/dunjia/tests/board/common.test.ts` 和 `packages/dunjia/tests/outer-gods/jian-shen.test.ts` 确认管道各阶段和插件系统正常工作。
