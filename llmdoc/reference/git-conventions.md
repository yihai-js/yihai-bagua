# Git 提交规范

本文档为 LLM 代理生成提交消息时的参考规范，基于最近 30 条提交历史推断。

## 1. 核心摘要

本项目使用 **Conventional Commits** 格式，提交消息主体使用**中文**撰写。所有 AI 辅助提交必须包含 `Co-Authored-By` 尾注。分支策略为单一 `main` 分支直接提交。

## 2. 提交消息格式

```
<type>(<scope>): <中文描述>

<可选的中文详细说明>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 2.1 类型 (type)

| 类型 | 用途 | 出现频率 |
|------|------|---------|
| `feat` | 新功能 | 最高 |
| `fix` | 缺陷修复 | 常见 |
| `test` | 测试相关 | 常见 |
| `chore` | 构建/工具链维护 | 偶尔 |
| `refactor` | 重构（无功能变更） | 偶尔 |
| `docs` | 文档变更 | 偶尔 |

### 2.2 作用域 (scope)

- 作用域对应包名或模块名，如 `dunjia`、`lunar`
- 跨包/全局变更可省略 scope，如 `chore: 集成 @antfu/eslint-config`

### 2.3 描述与正文

- **标题行**：中文动词开头，简明扼要（如 `实现`、`修复`、`添加`）
- **正文**（可选）：多行中文说明，用 `-` 列表描述关键变更点
- 早期少量提交标题直接使用中文无 type 前缀（如 `修复月球精度...`），现已统一为 conventional 格式

### 2.4 AI 协作标记

所有 AI 辅助提交在消息末尾追加空行后添加：

```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

历史中也存在 `Claude Opus 4.5` 的标记，使用当前模型版本即可。

## 3. 分支策略

- 主分支：`main`
- 当前工作模式：直接向 `main` 提交（无 PR 流程）

## 4. 真实来源

- **提交历史**：`git log --oneline -30` 查看近期提交
- **ESLint 配置**：`eslint.config.js` -- 代码质量由 `@antfu/eslint-config` 管控，提交前需通过 lint
