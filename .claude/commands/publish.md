# Monorepo 发布

pnpm monorepo 包发布流程。使用中文交互。

## 流程

### 1. 预检

依次执行以下检查，任一失败则中止并报告原因：

- `npm whoami` — 确认 npm 已登录
- `git status` — 确认工作区干净（无未提交变更），如有未提交变更则提醒用户先提交
- `pnpm run build` — 全量构建
- `pnpm run test` — 全量测试

### 2. 包状态分析

遍历 `packages/*/package.json`，对每个包：

- 读取本地 `name` 和 `version`
- `npm view <name> version` 获取 npm 上最新版本（命令失败 = 未发布过）

输出状态表，标注每个包是"已是最新"、"版本已更新待发布"还是"未发布"。

### 3. 用户确认

用 `AskUserQuestion` 交互：

1. **选择要发布的包**（多选）— 仅列出可发布的包（本地版本 != npm 版本，或未发布过）
2. **版本号确认** — 对每个选中的包，询问是否需要调整版本号（patch/minor/major），默认使用当前版本。如需调整，执行 `npm version <type> --no-git-tag-version` 更新。

### 4. 执行发布

按依赖拓扑顺序发布（被依赖的包先发）：

**当前依赖顺序：** `@yhjs/lunar` → `@yhjs/dunjia`

对每个包执行：
```
cd packages/<name> && pnpm publish --access public --no-git-checks
```

### 5. 发布后

- `npm view <name> version` 验证每个包发布成功
- 如果有版本号变更，提交并推送：`git add packages/*/package.json pnpm-lock.yaml && git commit -m "release: ..." && git push`
- 输出发布结果汇总
