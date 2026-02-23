# 九星、八门、八神数据参考

## 1. Core Summary

model/ 模块定义了奇门遁甲的三类盘面实体数据：九星（STARS, 9 元素）、八门（DOORS, 9 元素，含中门）、八神（GODS, 8 元素，无 originPalace）。星与门按洛书后天宫数一一对应，共享相同的五行属性。模块还提供后天数到数组索引的转换函数，以及处理天禽星/中门特殊跳转的遍历函数。

## 2. Source of Truth

- **九星数据:** `packages/dunjia/src/model/star.ts`（STARS, starIndexFromAfterNum）- 9 个 StarInfo 对象，字段：name / shortName / wuxing / originPalace。
- **八门数据:** `packages/dunjia/src/model/door.ts`（DOORS, doorIndexFromAfterNum）- 9 个 DoorInfo 对象，结构与 STARS 完全一致。
- **八神数据:** `packages/dunjia/src/model/god.ts`（GODS）- 8 个 GodInfo 对象，仅有 name / shortName / wuxing，无 originPalace。
- **遍历逻辑:** `packages/dunjia/src/model/index.ts`（nextStarDoorIndex, prevStarDoorIndex）- 处理天禽星/中门的特殊索引跳转。
- **类型定义:** `packages/dunjia/src/types.ts`（StarInfo, DoorInfo, GodInfo）- 三类接口的规范定义。
- **Related Architecture:** `/llmdoc/architecture/metaphysics-foundation.md` - 基础模块的整体架构。

## 3. 数据速查

### 3.1 STARS 数组（9 元素）

| 索引 | name   | shortName | wuxing | originPalace |
|------|--------|-----------|--------|--------------|
| 0    | 天蓬星 | 蓬        | 水(4)  | 1            |
| 1    | 天任星 | 任        | 土(2)  | 8            |
| 2    | 天冲星 | 冲        | 木(0)  | 3            |
| 3    | 天辅星 | 辅        | 木(0)  | 4            |
| 4    | 天英星 | 英        | 火(1)  | 9            |
| 5    | 天芮星 | 芮        | 土(2)  | 2            |
| 6    | 天柱星 | 柱        | 金(3)  | 7            |
| 7    | 天心星 | 心        | 金(3)  | 6            |
| 8    | 天禽星 | 禽        | 土(2)  | 5 (中宫)     |

### 3.2 DOORS 数组（9 元素）

| 索引 | name | shortName | wuxing | originPalace |
|------|------|-----------|--------|--------------|
| 0    | 休门 | 休        | 水(4)  | 1            |
| 1    | 生门 | 生        | 土(2)  | 8            |
| 2    | 伤门 | 伤        | 木(0)  | 3            |
| 3    | 杜门 | 杜        | 木(0)  | 4            |
| 4    | 景门 | 景        | 火(1)  | 9            |
| 5    | 死门 | 死        | 土(2)  | 2            |
| 6    | 惊门 | 惊        | 金(3)  | 7            |
| 7    | 开门 | 开        | 金(3)  | 6            |
| 8    | 中门 | 中        | 土(2)  | 5 (中宫)     |

### 3.3 GODS 数组（8 元素）

| 索引 | name | shortName | wuxing |
|------|------|-----------|--------|
| 0    | 值符 | 符        | 木(0)  |
| 1    | 腾蛇 | 蛇        | 火(1)  |
| 2    | 太阴 | 阴        | 金(3)  |
| 3    | 六合 | 六        | 木(0)  |
| 4    | 白虎 | 白        | 金(3)  |
| 5    | 玄武 | 玄        | 水(4)  |
| 6    | 九地 | 地        | 土(2)  |
| 7    | 九天 | 天        | 火(1)  |

## 4. 关键函数

### 4.1 后天数转索引

- `starIndexFromAfterNum(num)` — `packages/dunjia/src/model/star.ts:16-19`: 遍历 STARS 查找 `originPalace === num` 的条目，返回数组索引；未找到返回 0。
- `doorIndexFromAfterNum(num)` — `packages/dunjia/src/model/door.ts:16-19`: 逻辑与 starIndexFromAfterNum 完全相同。

### 4.2 星门遍历跳转

`packages/dunjia/src/model/index.ts:11-29` 定义了两个函数，处理天禽星(索引 8)/中门(索引 8) 在排盘中的特殊遍历逻辑：

- **nextStarDoorIndex(index, isSpecial):** 普通模式 `(index+1)%8`；特殊模式下 `8->6`（跳到天柱/惊门）、`4->8`（跳到天禽/中门）。
- **prevStarDoorIndex(index, isSpecial):** 普通模式 `(index+7)%8`；特殊模式下 `8->4`、`6->8`。

### 4.3 关键设计要点

- STARS 和 DOORS 均为 **9 元素**（非 8），因为天禽星和中门代表中宫。
- GODS 仅 **8 元素**，无 originPalace 字段；八神在排盘时按位置动态分配，不固定绑定宫位。
- STARS[i] 和 DOORS[i] 的 originPalace 和 wuxing **逐索引完全一致**，星门按洛书宫位一一绑定。
