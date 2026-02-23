# 编码规范

本文档提供项目编码规范的高层摘要及配置文件指引。

## 1. 核心摘要

本项目是 pnpm monorepo (`@yhjs/monorepo`)，使用 ESM 模块系统、TypeScript strict 模式、@antfu/eslint-config 代码风格。核心设计原则：不可变数据 (`Object.freeze`, `readonly`, `as const`)、纯函数管道、私有构造器 + 静态工厂方法 (`private constructor` + `static create`/`static from`)。

## 2. 配置源

- **ESLint:** `eslint.config.js` -- `@antfu/eslint-config`, `type: 'lib'`。隐含规则：无分号、单引号、自动排序导入、2 空格缩进。
- **TypeScript:** `tsconfig.base.json` -- `strict: true`, `target: ES2020`, `module: ESNext`, `moduleResolution: bundler`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`。
- **根 package.json:** `package.json` -- `type: "module"`, pnpm workspace。
- **子包 package.json:** `packages/dunjia/package.json` -- 双格式导出 (`import` -> `.js`, `require` -> `.cjs`), `engines: node>=16`。
- **构建:** `packages/dunjia/vite.config.ts` -- Vite library 模式, `formats: ['es', 'cjs']`, `vite-plugin-dts` (含 `rollupTypes`)。
- **测试:** `packages/dunjia/vitest.config.ts` -- Vitest, `globals: true`, 测试文件: `tests/**/*.test.ts`, coverage: v8。

## 3. 关键规则速查

| 类别 | 规则 |
|---|---|
| 分号 | 不使用分号 |
| 引号 | 单引号 |
| 缩进 | 2 空格 |
| 导入排序 | 自动 (eslint-config 内置) |
| 模块系统 | ESM (`type: "module"`) |
| 输出格式 | 双格式: `.js` (ESM) + `.cjs` (CJS) |
| TS 严格性 | `strict` + `noImplicitReturns` + `noUnusedLocals` + `noUnusedParameters` |
| 数据不可变 | `readonly` 数组/属性, `as const` 断言, 构造器内 `Object.freeze` |
| 类实例化 | `private constructor` + `static create()` / `static from()` |
| 常量数据 | `readonly T[]` 类型 + 模块级 `const` 导出 |
| 纯函数 | 优先导出纯函数，避免副作用 |
| 测试位置 | `tests/` 目录，文件名 `*.test.ts`，镜像 `src/` 结构 |
| 测试框架 | Vitest (`globals: true`，无需显式 import `describe`/`it`) |

## 4. 依赖管理原则

按类别分层，全局共享工具放根 workspace，与包产物直接相关的依赖留在子包：

| 层级 | 依赖 | 说明 |
|---|---|---|
| **根 workspace** | `typescript`, `vite`, `vitest`, `@vitest/coverage-v8`, `eslint`, `@antfu/eslint-config` | 构建工具、测试框架、代码质量工具，所有子包共享同一版本 |
| **子包** | `@types/node`, `vite-plugin-dts` | 类型声明和构建插件，直接影响包的 `.d.ts` 产物，不同包可能需要不同版本 |
| **子包** | runtime `dependencies` | 如 `@yhjs/lunar: workspace:*`，仅声明运行时依赖 |

**原则：** 添加新依赖时，构建/测试/lint 工具加到根 `package.json`；类型声明、构建插件、运行时依赖加到子包 `package.json`。

## 5. 代码模式示例参考

- **私有构造器 + 静态工厂:** `packages/dunjia/src/board/time-dunjia.ts:15-30`, `packages/dunjia/src/board/pos-dunjia.ts:52-76`
- **readonly + Object.freeze:** `packages/dunjia/src/board/pos-dunjia.ts:52-72`
- **as const 常量表:** `packages/dunjia/src/base/bagua.ts:12-16`
- **readonly 数组导出:** `packages/dunjia/src/model/star.ts:4`, `packages/dunjia/src/model/door.ts:4`, `packages/dunjia/src/model/god.ts:4`
- **纯函数导出:** `packages/dunjia/src/base/bagua.ts:18-36` (`getBagua`)
