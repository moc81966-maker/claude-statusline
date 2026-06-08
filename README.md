# claude-statusline

> 📊 Claude Code 上下文使用量监控状态栏

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

在 Claude Code 终端底部实时显示 Token 使用百分比、剩余消息数、对话轮数等信息，让你随时掌握上下文消耗情况。

## ✨ Features

- 🟢🟡🔴 三色指示灯，直观显示上下文使用率
- █████░░░░░ 进度条可视化
- 💬 剩余消息数估算
- 🔄 对话轮数统计
- ⚡ Rate limit 使用率监控
- 📌 当前会话名称显示
- 每 10 秒自动刷新

## 📸 Preview

```
🟢 ██████░░░░ 58.3% │ 💬 ~42 msgs │ 🔄 15 turns │ ⚡ 5h:12%
```

## 🚀 Installation

### 方式一：一键安装（推荐）

```bash
git clone https://github.com/moc81966-maker/claude-statusline.git
cd claude-statusline
node install.js
```

### 方式二：手动配置

1. 克隆仓库到本地：

```bash
git clone https://github.com/moc81966-maker/claude-statusline.git
```

2. 编辑 `~/.claude/settings.json`，添加 `statusLine` 配置：

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /你的路径/claude-statusline/statusline.js",
    "refreshInterval": 10
  }
}
```

3. 重启 Claude Code 即可生效

## 📖 Display Legend

| 图标 | 含义 | 说明 |
|:----:|------|------|
| 🟢 | 安全 | Token 使用率 < 60% |
| 🟡 | 注意 | Token 使用率 60-80% |
| 🔴 | 警告 | Token 使用率 > 80% |
| 💬 | 剩余消息 | 基于 6k token/条估算 |
| 🔄 | 对话轮数 | 当前会话交互次数 |
| ⚡ | Rate Limit | 5 小时窗口使用率 |
| 📌 | 会话名 | 通过 /rename 设置的名称 |

## ⚙️ Configuration

修改 `~/.claude/settings.json` 中的参数：

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /path/to/statusline.js",
    "refreshInterval": 10  // 刷新间隔（秒），可自行调整
  }
}
```

## 🗑️ Uninstall

从 `~/.claude/settings.json` 中删除整个 `statusLine` 配置块：

```diff
- "statusLine": {
-   "type": "command",
-   "command": "node ...",
-   "refreshInterval": 10
- },
```

## 🤝 Contributing

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 📝 Changelog

### v1.0.0 (2026-06-08)
- 🎉 初始发布
- Token 使用百分比显示
- 剩余消息数估算
- 对话轮数统计
- Rate limit 监控

## 📄 License

[MIT](LICENSE) © 2026

---

<p align="center">
  Made with ❤️ for <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a>
</p>
