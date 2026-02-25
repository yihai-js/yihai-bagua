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

1. 读取本地 `name` 和 `version`
2. `npm view <name> version` 获取 npm 上最新版本（命令失败 = 未发布过）
3. **变更检测**：对于 npm 版本 = 本地版本的包，检查自上次发布以来是否有代码变更：
   - 如果存在对应的 git tag（`@yhjs/<pkg>@<version>`），执行 `git diff <tag> -- packages/<name>/src/` 检测变更
   - 如果不存在 tag，用 `git log --oneline --since="上次发布时间" -- packages/<name>/src/` 辅助判断
   - 有变更 → 标记为"版本号未更新但有代码变更，需要 bump"
4. **依赖传播**：如果某个底层包需要发布，检查所有依赖它的包是否也需要同步发布（即使自身代码无变更，依赖链变了也需要发新版）

输出状态表，每个包标注以下状态之一：

| 状态 | 含义 |
|------|------|
| ✅ 已是最新 | npm 版本 = 本地版本，且无代码变更 |
| 🆕 未发布 | npm 上不存在 |
| 📦 版本已更新待发布 | 本地版本 > npm 版本 |
| ⚠️ 有变更未 bump | npm 版本 = 本地版本，但有代码变更 |
| 🔗 依赖链需同步 | 自身无变更，但所依赖的包需要发布 |

### 3. 用户确认

用 `AskUserQuestion` 交互：

1. **选择要发布的包**（多选）— 列出所有可发布的包（🆕/📦/⚠️/🔗），并标注推荐发布原因
2. **版本号确认** — 对每个选中的包，询问版本号策略（patch/minor/major/保持当前），默认推荐：
   - 🆕 未发布 → 使用当前版本
   - 📦 版本已更新 → 使用当前版本
   - ⚠️ 有变更未 bump → 建议 patch
   - 🔗 依赖链同步 → 建议 patch

   如需调整，执行 `npm version <type> --no-git-tag-version` 更新。

### 4. 执行发布

**按依赖拓扑顺序发布**（被依赖的包先发，无依赖关系的包可并行）：

依赖图：
```
bagua (无依赖)
  ↑
lunar (依赖 bagua)
  ↑
dunjia / bazi / liuren (均依赖 bagua + lunar，互不依赖)
```

发布顺序：`bagua → lunar → dunjia / bazi / liuren`

对每个包执行：
```
cd packages/<name> && pnpm publish --access public --no-git-checks
```

### 5. 发布后

1. **验证**：`npm view <name> version` 验证每个包发布成功（新发布的包可能有传播延迟，publish 命令返回 `+` 即视为成功）
2. **提交版本变更**：`git add packages/*/package.json pnpm-lock.yaml && git commit -m "release: ..." && git push`
3. **打 tag**：为每个发布的包创建 git tag 并推送
   ```
   git tag @yhjs/<pkg>@<version>   # 每个发布的包
   git push --tags
   ```
4. **输出发布结果汇总表**
