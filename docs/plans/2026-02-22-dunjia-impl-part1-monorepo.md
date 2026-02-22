# 遁甲迁移 Part 1：Monorepo 基础设施

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有 @yhjs/lunar 项目重构为 pnpm monorepo，创建 @yhjs/dunjia 空包骨架，确保跨包依赖、构建、测试全部正常。

**Architecture:** 根目录作为 monorepo 管理层，packages/lunar/ 承载现有代码，packages/dunjia/ 作为新包。tsconfig.base.json 提供共享编译选项和 paths 映射，各包 extends 它。

**Tech Stack:** pnpm workspace, TypeScript 5.9, Vite 7.3, Vitest 4.0, @antfu/eslint-config

**原版代码位置:** `/Users/macbookair/Desktop/projects/chengming-mobile`

---

## Task 1: 创建 monorepo 根配置文件

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`

**Step 1: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

**Step 2: 创建 tsconfig.base.json**

从现有 tsconfig.json 提取共享编译选项，增加 paths 映射：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "paths": {
      "@yhjs/lunar": ["./packages/lunar/src"],
      "@yhjs/lunar/*": ["./packages/lunar/src/*"]
    }
  }
}
```

**Step 3: 改写根 tsconfig.json**

只负责根目录脚本和配置文件：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["*.ts", "*.js"],
  "exclude": ["packages", "node_modules"]
}
```

**Step 4: Commit**

```bash
git add pnpm-workspace.yaml tsconfig.base.json tsconfig.json
git commit -m "chore: 添加 monorepo 根配置（pnpm workspace + tsconfig.base）"
```

---

## Task 2: 搬迁 lunar 代码到 packages/lunar/

**Files:**
- Move: `src/` → `packages/lunar/src/`
- Move: `tests/` → `packages/lunar/tests/`
- Move: `vite.config.ts` → `packages/lunar/vite.config.ts`
- Move: `vitest.config.ts` → `packages/lunar/vitest.config.ts`
- Move: `package.json` → `packages/lunar/package.json`（需修改）
- Move: `README.md` → `packages/lunar/README.md`
- Create: `packages/lunar/tsconfig.json`

**Step 1: 创建目录并移动文件**

```bash
mkdir -p packages/lunar
git mv src packages/lunar/src
git mv tests packages/lunar/tests
git mv vite.config.ts packages/lunar/vite.config.ts
git mv vitest.config.ts packages/lunar/vitest.config.ts
git mv README.md packages/lunar/README.md
```

**Step 2: 移动并修改 package.json**

将根 package.json 移到 packages/lunar/package.json。注意：根目录还需要一个新的根 package.json（Task 3 创建）。

```bash
git mv package.json packages/lunar/package.json
```

修改 `packages/lunar/package.json`，移除 devDependencies 中的全局工具（eslint 配置会提到根级），保持包自身的构建依赖：

```json
{
  "name": "@yhjs/lunar",
  "type": "module",
  "version": "1.0.0",
  "description": "精确的中国农历与天文计算库 - 寿星万年历 TypeScript 实现",
  "license": "MIT",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./core": {
      "types": "./dist/core/index.d.ts",
      "import": "./dist/core/index.js",
      "require": "./dist/core/index.cjs"
    },
    "./lunar": {
      "types": "./dist/lunar/index.d.ts",
      "import": "./dist/lunar/index.js",
      "require": "./dist/lunar/index.cjs"
    },
    "./ephemeris": {
      "types": "./dist/ephemeris/index.d.ts",
      "import": "./dist/ephemeris/index.js",
      "require": "./dist/ephemeris/index.cjs"
    },
    "./eclipse": {
      "types": "./dist/eclipse/index.d.ts",
      "import": "./dist/eclipse/index.js",
      "require": "./dist/eclipse/index.cjs"
    },
    "./astronomy": {
      "types": "./dist/astronomy/index.d.ts",
      "import": "./dist/astronomy/index.js",
      "require": "./dist/astronomy/index.cjs"
    },
    "./data": {
      "types": "./dist/data/index.d.ts",
      "import": "./dist/data/index.js",
      "require": "./dist/data/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "engines": { "node": ">=16.0.0" },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "benchmark": "vitest run tests/performance/benchmark.test.ts",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^4.0.17",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4",
    "vitest": "^4.0.17"
  }
}
```

**Step 3: 创建 packages/lunar/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 4: 修改 packages/lunar/vite.config.ts 中的路径**

原始 vite.config.ts 使用 `resolve(__dirname, 'src/...')`，搬迁后路径不变（__dirname 是相对的），无需修改。确认一下即可。

**Step 5: 修改 packages/lunar/vitest.config.ts**

无需修改，路径是相对的。

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: 搬迁 lunar 代码到 packages/lunar/"
```

---

## Task 3: 创建根 package.json 和 eslint 配置

**Files:**
- Create: `package.json`（根级）
- Modify: `eslint.config.js`（更新 ignores）

**Step 1: 创建根 package.json**

```json
{
  "name": "@yhjs/monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r run build",
    "test": "pnpm -r run test:run",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  },
  "devDependencies": {
    "@antfu/eslint-config": "^7.4.3",
    "eslint": "^10.0.0",
    "typescript": "^5.9.3"
  }
}
```

**Step 2: 更新 eslint.config.js**

```js
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  ignores: [
    'src-legacy/**',
    '**/dist/**',
  ],
})
```

**Step 3: Commit**

```bash
git add package.json eslint.config.js
git commit -m "chore: 创建 monorepo 根 package.json 和 eslint 配置"
```

---

## Task 4: 安装依赖并验证 lunar 构建和测试

**Step 1: 重新安装依赖**

```bash
pnpm install
```

**Step 2: 验证 lunar 构建**

```bash
cd packages/lunar && pnpm run build
```

Expected: 构建成功，dist/ 目录生成。

**Step 3: 验证 lunar 测试**

```bash
cd packages/lunar && pnpm run test:run
```

Expected: 所有测试通过。

**Step 4: 验证 lint**

```bash
cd ../.. && pnpm run lint
```

Expected: 无错误（或仅有可忽略的警告）。

**Step 5: 修复任何问题**

如果构建或测试失败，逐个修复。常见问题：
- tsconfig.json 的 extends 路径不对
- vitest 找不到测试文件（检查 include 路径）
- eslint 配置路径问题

**Step 6: Commit**（如果有修复）

```bash
git add -A
git commit -m "fix: 修复 monorepo 搬迁后的构建和测试问题"
```

---

## Task 5: 创建 @yhjs/dunjia 包骨架

**Files:**
- Create: `packages/dunjia/package.json`
- Create: `packages/dunjia/tsconfig.json`
- Create: `packages/dunjia/vite.config.ts`
- Create: `packages/dunjia/vitest.config.ts`
- Create: `packages/dunjia/src/index.ts`
- Create: `packages/dunjia/src/types.ts`

**Step 1: 创建 packages/dunjia/package.json**

```json
{
  "name": "@yhjs/dunjia",
  "type": "module",
  "version": "0.1.0",
  "description": "奇门遁甲排盘计算库 - 时家奇门与山向奇门",
  "license": "MIT",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./outer-gods": {
      "types": "./dist/outer-gods/index.d.ts",
      "import": "./dist/outer-gods/index.js",
      "require": "./dist/outer-gods/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "engines": { "node": ">=16.0.0" },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@yhjs/lunar": "workspace:*"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^4.0.17",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4",
    "vitest": "^4.0.17"
  }
}
```

**Step 2: 创建 packages/dunjia/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: 创建 packages/dunjia/vite.config.ts**

```ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/**/*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'outer-gods/index': resolve(__dirname, 'src/outer-gods/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        if (format === 'es')
          return `${entryName}.js`
        return `${entryName}.cjs`
      },
    },
    rollupOptions: {
      external: [/@yhjs\/lunar/],
      output: {
        exports: 'named',
      },
    },
  },
})
```

注意 `external: [/@yhjs\/lunar/]`，确保 lunar 不被打包进 dunjia 的产物。

**Step 4: 创建 packages/dunjia/vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@yhjs/lunar': resolve(__dirname, '../lunar/src'),
    },
  },
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['tests/**', '*.config.ts'],
    },
  },
})
```

**Step 5: 创建 packages/dunjia/src/types.ts**

```ts
/**
 * 五行枚举
 */
export enum Wuxing {
  木 = 0,
  火 = 1,
  土 = 2,
  金 = 3,
  水 = 4,
}

/**
 * 阴阳类型
 */
export type YinYang = '阴' | '阳'

/**
 * 九宫格单宫数据
 */
export interface Palace {
  /** 宫位索引 0-8 */
  index: number
  /** 后天宫位数 (4,9,2,3,5,7,8,1,6) */
  position: number
  /** 宫名（巽离坤震中兑艮坎乾） */
  name: string
  /** 地盘天干 */
  groundGan: string
  /** 地盘天干（寄宫，中宫寄坤时存在） */
  groundExtraGan: string | null
  /** 天盘天干 */
  skyGan: string
  /** 天盘天干（寄宫） */
  skyExtraGan: string | null
  /** 九星 */
  star: StarInfo | null
  /** 八门 */
  door: DoorInfo | null
  /** 八神 */
  god: GodInfo | null
  /** 隐干 */
  outGan: string | null
  /** 隐干（寄宫） */
  outExtraGan: string | null
  /** 外圈神煞层 */
  outerGods: OuterGodLayer[]
}

/**
 * 九星信息
 */
export interface StarInfo {
  /** 全名（天蓬星等） */
  name: string
  /** 简称（蓬等） */
  shortName: string
  /** 五行 */
  wuxing: Wuxing
  /** 原始后天宫位数 */
  originPalace: number
}

/**
 * 八门信息
 */
export interface DoorInfo {
  /** 全名（休门等） */
  name: string
  /** 简称（休等） */
  shortName: string
  /** 五行 */
  wuxing: Wuxing
  /** 原始后天宫位数 */
  originPalace: number
}

/**
 * 八神信息
 */
export interface GodInfo {
  /** 全名（值符等） */
  name: string
  /** 简称（符等） */
  shortName: string
  /** 五行 */
  wuxing: Wuxing
}

/**
 * 盘面元数据
 */
export interface BoardMeta {
  /** 局类型 */
  type: 'hour' | 'day' | 'month' | 'year' | 'minute'
  /** 起局时间 */
  datetime: Date
  /** 阴阳遁 */
  yinyang: YinYang
  /** 局数 1-9 */
  juNumber: number
  /** 旬首名称 */
  xunHead: string
  /** 旬首六仪 */
  xunHeadGan: string
  /** 定局干支 */
  ganZhi: string
  /** 所在节气 */
  solarTerm: string
  /** 移星换斗偏移量 */
  moveStarOffset: number
}

/**
 * TimeDunjia 创建选项
 */
export interface TimeBoardOptions {
  /** 起局时间 */
  datetime: Date
  /** 局类型，默认 'hour' */
  type?: 'hour' | 'day' | 'month' | 'year' | 'minute'
}

/**
 * 外圈神煞插件接口
 */
export interface OuterGodPlugin {
  /** 神煞名称 */
  name: string
  /** 适用范围 */
  scope: ('time' | 'pos')[]
  /** 应用到盘面 */
  apply: (palaces: Palace[], meta: BoardMeta) => OuterGodLayer
}

/**
 * 外圈神煞层数据
 */
export interface OuterGodLayer {
  /** 神煞名称 */
  name: string
  /** 每宫的神煞数据，key 为宫位索引 */
  data: Record<number, OuterGodEntry>
}

/**
 * 外圈神煞单条数据
 */
export interface OuterGodEntry {
  /** 名称 */
  name: string
  /** 附加信息 */
  extra?: Record<string, unknown>
}

/**
 * 序列化后的盘面数据
 */
export interface DunjiaBoardData {
  meta: BoardMeta
  palaces: Palace[]
}
```

**Step 6: 创建 packages/dunjia/src/outer-gods/index.ts**

```ts
// 外圈神煞插件统一导出
// 后续逐步添加各插件
export {}
```

**Step 7: 创建 packages/dunjia/src/index.ts**

```ts
// 类型导出
export type {
  BoardMeta,
  DoorInfo,
  DunjiaBoardData,
  GodInfo,
  OuterGodEntry,
  OuterGodLayer,
  OuterGodPlugin,
  Palace,
  StarInfo,
  TimeBoardOptions,
  YinYang,
} from './types'

export { Wuxing } from './types'
```

**Step 8: Commit**

```bash
git add packages/dunjia/
git commit -m "feat(dunjia): 创建 @yhjs/dunjia 包骨架和类型定义"
```

---

## Task 6: 验证跨包依赖和构建

**Step 1: 安装依赖**

```bash
pnpm install
```

确认 pnpm 正确建立了 workspace 链接。

**Step 2: 验证 dunjia 包可以 import lunar**

创建临时测试文件 `packages/dunjia/tests/smoke.test.ts`：

```ts
import { describe, expect, it } from 'vitest'
import { TIAN_GAN } from '@yhjs/lunar'

describe('cross-package import', () => {
  it('should import TIAN_GAN from @yhjs/lunar', () => {
    expect(TIAN_GAN).toHaveLength(10)
    expect(TIAN_GAN[0]).toBe('甲')
  })
})
```

**Step 3: 运行测试**

```bash
cd packages/dunjia && pnpm run test:run
```

Expected: 测试通过，证明跨包 import 正常工作。

**Step 4: 验证 dunjia 构建**

```bash
cd packages/dunjia && pnpm run build
```

Expected: 构建成功，dist/ 生成，lunar 没有被打包进产物。

**Step 5: 验证根级全量构建和测试**

```bash
cd ../.. && pnpm run build && pnpm run test
```

Expected: 两个包都构建和测试通过。

**Step 6: 修复任何问题并 commit**

```bash
git add -A
git commit -m "test(dunjia): 验证跨包依赖解析正常"
```

---

## Task 7: 清理根目录遗留文件

**Step 1: 清理已移动到 packages/lunar/ 的根目录残留**

检查根目录是否还有 src/、tests/、dist/ 等不应存在的目录或文件。

需要保留的根目录文件：
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `tsconfig.json`
- `eslint.config.js`
- `package.json`
- `pnpm-lock.yaml`
- `.gitignore`
- `.git/`
- `.claude/`
- `.vscode/`
- `docs/`
- `packages/`
- `src-legacy/`（暂时保留，后续可清理）
- `favicon.ico`（可移到 lunar 或删除）

需要移除或移动的：
- 根目录的 `dist/`（已在 .gitignore 中）
- 根目录的 `node_modules/`（会被 pnpm 重新管理）

**Step 2: 更新 .gitignore**

确保 .gitignore 覆盖所有包的 dist 和 node_modules：

```
.idea
out
*.iml
/server/*
/index.htm
/indexmp.htm

node_modules
dist
coverage

src/.DS_Store
.DS_Store

*.local.*
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: 清理 monorepo 搬迁后的根目录"
```

---

## 完成标志

Part 1 完成后，项目状态应为：

- [x] `pnpm-workspace.yaml` 配置正确
- [x] `tsconfig.base.json` 含 paths 映射
- [x] `packages/lunar/` 构建和测试全部通过
- [x] `packages/dunjia/` 能 import `@yhjs/lunar` 的导出
- [x] `packages/dunjia/` 构建成功（只导出类型）
- [x] `pnpm run build` 和 `pnpm run test` 在根目录全量通过
- [x] 根目录干净，无遗留文件

接下来进入 Part 2：遁甲算法实现。
