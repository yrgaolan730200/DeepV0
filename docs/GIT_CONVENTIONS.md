# Git 提交规范

## 为什么用中文大白话

vSeek 是一个面向中文开发者的本地工具项目。commit message 用中文大白话：

- 更直观，一眼看懂这次改了什么
- 不需要记忆 chore/feat/fix 等英文前缀
- 和项目文档、注释、提示词的中文风格一致

## Commit Message 规范

### 格式

```
用中文大白话描述这次改动
```

### 正确示例

- 搭好 P0 的前后端骨架
- 稳定 P0 骨架，修好基础检查
- 接入 DeepSeek，生成项目文件
- 让 Studio 显示真实文件树和代码
- 接入本地预览，让生成页面跑起来
- 实现多轮修改项目文件
- 加入构建检查和自动修错
- 加入版本回退功能
- 加入 Docker 沙箱隔离
- 加入 ZIP 导出功能
- 加入中文提交规范，避免以后写英文提交信息
- 修复生成文件的路径安全检查
- 更新 ROADMAP 和架构文档

### 错误示例（不要这样写）

- chore: establish P0 studio-server skeleton
- feat: implement P1 DeepSeek project generation
- fix: update route schema validation
- docs: add git conventions

### 规则

- commit message 要短、清楚、像人话
- 优先说明"这次做了什么"
- 不要使用 chore/feat/fix/docs/refactor/test/build/ci/style/perf 英文前缀
- 如果 commit 只改一个模块或文件，可以在前面加模块名（如"修复 server 路由校验问题"）

## 分支命名规则

分支名使用英文小写 + 连字符：

```
p1-deepseek-generation
p2-live-preview
p3-project-management
fix-route-validation
```

## Tag 命名规则

Tag 名使用英文小写 + 连字符，和对应分支名区分：

```
p1-deepseek-generation    (tag，和分支同名 — 不推荐)
milestone-p1-generation   (tag，带 milestone 前缀 — 推荐)
```

**重要：分支名和 tag 名不要完全相同。** 如果 branch 名和 tag 名相同，`git push origin <name>` 会出现 refspec 歧义，需要手动指定 `refs/heads/` 或 `refs/tags/`。

## 提交前检查清单

```bash
# 1. 检查工作区
git status --short

# 2. 确认没有敏感文件
git diff --cached --name-only | grep -E "\.env$|node_modules|\.next|dist" && echo "WARNING: sensitive files staged!"

# 3. 运行类型检查和构建
pnpm typecheck && pnpm build

# 4. 提交
git add .
git commit -m "你的中文大白话 commit message"
```

## Commit 模板

项目根目录 `.gitmessage` 是 commit 模板。配置后每次 `git commit` 会预填充模板中的提示文字。

```bash
git config commit.template .gitmessage
```

## Commit Message 校验

项目提供 `scripts/validate-commit-message.js` 脚本，在 commit-msg hook 中自动运行。

安装 hook：

```bash
pnpm install:hooks
```

校验规则：

- 第一行以英文 Conventional Commit 前缀开头 → 报错
- 第一行没有任何中文字符 → 报错
- merge commit（以"Merge"或"合并"开头）→ 放行
