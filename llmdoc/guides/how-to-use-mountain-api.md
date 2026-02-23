# How to 使用二十四山向 API

从罗盘角度获取山向信息、执行三盘查询、计算三元局数的操作指南。所有函数从 `packages/dunjia/src/mountain` 导入。

1. **从角度获取山向索引和信息：** 调用 `getMountainIndexFromAngle(angle)` 得到 0-23 的索引，再调用 `getMountainInfo(index)` 获取完整的 `MountainInfo` 对象（含 name、wuxing、yinyang、najia）。参见 `packages/dunjia/src/mountain/mountain.ts:208-224`。

2. **三盘查询（人盘/地盘/天盘）：** 调用 `getMountainDetailFromAngle(angle, panType)` 获取指定盘面的山向详情。`panType` 取值：`'human'`（无偏移）、`'ground'`（+7.5 度偏移）、`'sky'`（+15 度偏移）。返回 `MountainDetail`，含 `index`、`start`、`end` 角度范围。参见 `packages/dunjia/src/mountain/mountain.ts:233-242`。

3. **获取对向（坐山与朝向）：** 调用 `getOppositeAngle(angle)` 获取 180 度对面角度，或 `getOppositeMountain(index)` 获取对面山向索引（+12 mod 24）。参见 `packages/dunjia/src/mountain/mountain.ts:247-256`。

4. **计算三元局数：** 分两步执行。先获取人盘山向详情：`const human = getMountainDetailFromAngle(angle, 'human')`。再计算局数：`const numData = getNumData(angle, human)`。返回的 `NumData` 含 `isSolar`（阳遁/阴遁）、`numOffset`（0=上元, 1=中元, 2=下元）、`num`（局数 1-9）。参见 `packages/dunjia/src/mountain/mountain.ts:271-294`。

5. **双山五行查询：** 调用 `getZhiMountain(index)` 获取该山向对应的地支名称。偶数索引自动映射到下一个奇数索引的名称。参见 `packages/dunjia/src/mountain/mountain.ts:261-264`。

6. **与 PosDunjia 集成：** `packages/dunjia/src/board/pos-dunjia.ts` 是本模块的主要消费者。PosDunjia 在 `create()` 时接收 `angle` 参数，内部调用 `getMountainDetailFromAngle`、`getMountainInfo`、`getNumData`、`getOppositeAngle`、`getOppositeMountain` 完成山向奇门排盘。直接使用 mountain API 时无需关注 PosDunjia 的内部流程；但如需扩展排盘逻辑，参见 `/llmdoc/architecture/mountain-compass-system.md` 中的执行流程。

7. **验证：** 运行 `pnpm --filter dunjia run test:run` 执行全部 37 个山向测试用例，确认 API 行为与预期一致。
