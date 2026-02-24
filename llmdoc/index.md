# @yhjs/monorepo LLM 文档索引

`@yhjs/monorepo` 是一个 pnpm monorepo，包含 `@yhjs/lunar`（农历天文计算）、`@yhjs/bagua`（术数基础）、`@yhjs/dunjia`（奇门遁甲排盘）、`@yhjs/bazi`（八字排盘）和 `@yhjs/liuren`（大六壬排盘）五个 TypeScript 库，为"承明 AI"玄学计算后端提供核心算法支持。

---

## overview/ -- 项目与模块概览

> retrieve: 了解项目整体定位、技术栈、包结构、模块职责时查阅此分类。

| 文档 | 描述 |
|------|------|
| `overview/project-overview.md` | 项目全局概览：monorepo 结构、五个核心包（lunar/bagua/dunjia/bazi/liuren）的功能定位、技术栈、包间依赖、目录结构、遗留代码来源 |
| `overview/lunar-package-overview.md` | `@yhjs/lunar` 包概览：六个子模块（core/data/ephemeris/lunar/eclipse/astronomy）的职责划分、模块依赖链、关键技术特征 |
| `overview/bazi-package-overview.md` | `@yhjs/bazi` 包概览：六个子模块（types/pillar/analysis/dayun/liunian/shensha）的职责划分、依赖 lunar+bagua、关键技术特征 |
| `overview/liuren-package-overview.md` | `@yhjs/liuren` 包概览：八个子模块（types/yuejiang/guigod/outer/legend/destiny/pillar/board）的职责划分、13步排盘流水线、依赖 lunar+bagua、关键技术特征 |

---

## architecture/ -- 系统架构（LLM 检索地图）

> retrieve: 需要理解内部实现机制、追踪执行流程、定位源码文件时查阅此分类。

| 文档 | 描述 |
|------|------|
| `architecture/board-engine-architecture.md` | 排盘引擎架构：7 步纯函数管道（resolveMeta -> initGroundGan -> ... -> 清理中宫）、buildBoard/buildBoardFromMeta 入口、移星换斗、九宫拓扑、Palace 14 字段结构 |
| `architecture/outer-god-plugin-system.md` | 外圈神煞插件系统：OuterGodPlugin 接口、OuterGodLayer 叠加机制、jianShen 十二建神实现、新插件编写指南 |
| `architecture/metaphysics-foundation.md` | 术数基础模块架构：五行关系查询、后天八卦序列、九宫拓扑遍历（顺逆时针/后天数序）、六旬与地盘排布序列 |
| `architecture/mountain-compass-system.md` | 二十四山向罗盘系统：四套平行数组、角度-山向转换、三盘偏移、对向计算、三元局数算法 |
| `architecture/lunar-module-architecture.md` | `@yhjs/lunar` 内部模块架构：core/data/ephemeris/lunar/eclipse/astronomy 六层的核心组件、农历日期转换流程、天文位置计算流程 |

---

## guides/ -- 操作指南

> retrieve: 需要调用 API、执行具体操作、理解集成方式时查阅此分类。

| 文档 | 描述 |
|------|------|
| `guides/how-to-use-board-api.md` | 排盘 API 使用指南：TimeDunjia/PosDunjia 起局、moveStar 移星换斗、applyOuterGod 插件应用、toJSON 序列化、链式调用模式 |
| `guides/how-to-use-mountain-api.md` | 二十四山向 API 使用指南：角度查山向、三盘查询、对向计算、三元局数计算、双山五行、与 PosDunjia 的集成 |
| `guides/how-lunar-integrates-with-dunjia.md` | lunar 与 dunjia 集成指南：依赖声明、核心导入符号清单、节气数据用于阴阳遁判定、干支数据驱动排盘、完整数据流图 |

---

## reference/ -- 参考资料

> retrieve: 需要查询编码规范、提交格式、数据常量表时查阅此分类。

| 文档 | 描述 |
|------|------|
| `reference/coding-conventions.md` | 编码规范：ESM + TypeScript strict、@antfu/eslint-config 规则、不可变数据模式、纯函数管道、私有构造器 + 静态工厂 |
| `reference/git-conventions.md` | Git 提交规范：Conventional Commits 格式、中文描述、type/scope 用法、Co-Authored-By 标记、单 main 分支策略 |
| `reference/stars-doors-gods-data.md` | 九星/八门/八神数据速查：STARS(9)/DOORS(9)/GODS(8) 完整属性表、后天数转索引函数、天禽星/中门特殊跳转逻辑 |

---

*共 15 篇文档。最后更新: 2026-02-25。*
