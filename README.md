# claude-statusline

> 📊 Claude Code 上下文监控 + 自动压缩保护

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/moc81966-maker/claude-statusline/releases)

在 Claude Code 终端底部实时显示上下文使用情况，当上下文快满时自动提醒或阻止发送，避免上下文溢出。

## ✨ Features

### v2.0 新增
- 🔔 **上下文保护** - 快满时自动提醒，超限时阻止发送
- 📊 **Token 数量** - 显示已用/总 token 数
- ⏱️ **会话时长** - 显示本次对话持续时间
- 💰 **费用估算** - 根据 token 用量估算花费
- ⏰ **Rate limit 倒计时** - 显示限制重置剩余时间
- ⚙️ **自定义阈值** - 可配置警告线和自动压缩线

### v1.0 功能
- 🟢🟡🔴 三色进度条可视化
- 💬 剩余消息数估算
- 🔄 对话轮数统计
- 📌 会话名称显示

## 📸 Preview

```
🟢 ████████░░░░░░░░░░░░ 58.3% │ 📊 87.5k/150k │ 💬 ~42 │ 🔄 15 │ ⏱️ 23m │ 💰 $1.31 │ ⚡ 5h:12%(45m) │ 📌 my-session
```

上下文快满时：
```
🟡 ████████████████░░░░ 78.5% ⚡ HIGH │ 📊 117.8k/150k │ 💬 ~12 │ ⚠️ 5h:85%(12m)
```

## 🚀 Installation

```bash
git clone https://github.com/moc81966-maker/claude-statusline.git
cd claude-statusline
node install.js
```

重启 Claude Code 即可生效。

## ⚙️ Configuration

安装后会在 `~/.claude/` 下创建配置文件 `claude-statusline.json`：

```json
{
  "warnThreshold": 70,
  "autoCompactThreshold": 85,
  "refreshInterval": 10,
  "showCost": true,
  "showDuration": true,
  "costPer1kInput": 0.015,
  "costPer1kOutput": 0.075
}
```

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `warnThreshold` | 70 | 警告阈值（%），超过时显示黄色警告 |
| `autoCompactThreshold` | 85 | 自动压缩阈值（%），超过时阻止发送 |
| `refreshInterval` | 10 | 刷新间隔（秒） |
| `showCost` | true | 是否显示费用估算 |
| `showDuration` | true | 是否显示会话时长 |
| `costPer1kInput` | 0.015 | 输入 token 单价（美元/千token） |
| `costPer1kOutput` | 0.075 | 输出 token 单价（美元/千token） |

### 自定义阈值示例

```json
{
  "warnThreshold": 60,
  "autoCompactThreshold": 75
}
```

## 🛡️ Context Guard

安装时会自动配置 `UserPromptSubmit` hook（上下文保护）：

- **低于警告线** - 正常通过
- **超过警告线** - 显示黄色警告，允许继续
- **超过自动压缩线** - 阻止发送，建议执行 `/compact`

你也可以手动配置 hook，编辑 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/claude-statusline/hooks/context-guard.js",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## 📖 Display Legend

| 图标 | 含义 |
|:----:|------|
| 🟢 | 安全 - Token 使用率 < 警告线 |
| 🟡 | 注意 - 超过警告线 |
| 🔴 | 警告 - 超过自动压缩线 |
| 📊 | Token 数量 (已用/总量) |
| 💬 | 剩余消息数估算 |
| 🔄 | 对话轮数 |
| ⏱️ | 会话时长 |
| 💰 | 费用估算 |
| ⚡ | 5小时 Rate limit |
| 📅 | 7天 Rate limit |
| 📌 | 会话名称 |

## 🗑️ Uninstall

1. 从 `~/.claude/settings.json` 删除 `statusLine` 配置块
2. 从 `hooks.UserPromptSubmit` 删除 context-guard hook
3. 删除配置文件 `~/.claude/claude-statusline.json`
4. 删除项目文件夹

## 🤝 Contributing

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📝 Changelog

### v2.0.0 (2026-06-08)
- ✨ 新增上下文保护 hook
- ✨ 新增 Token 数量显示
- ✨ 新增会话时长统计
- ✨ 新增费用估算
- ✨ 新增 Rate limit 倒计时
- ✨ 新增自定义配置文件
- 🎨 升级进度条为 20 格

### v1.0.0 (2026-06-08)
- 🎉 初始发布
- Token 使用百分比显示
- 剩余消息数估算
- 对话轮数统计

## 📄 License

[MIT](LICENSE) © 2026

---

<p align="center">
  Made with ❤️ for <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a>
</p>
