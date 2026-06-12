#!/usr/bin/env node
// claude-statusline v2.0 - Claude Code 上下文监控状态栏
// https://github.com/moc81966-maker/claude-statusline

const fs = require('fs');
const path = require('path');
const os = require('os');

// 加载配置
function loadConfig() {
  const configPath = path.join(__dirname, 'config.default.json');
  const userConfigPath = path.join(os.homedir(), '.claude', 'claude-statusline.json');
  let config = {};
  try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch {}
  try {
    const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
    config = { ...config, ...userConfig };
  } catch {}
  return config;
}

// 写入上下文状态供 hook 读取
function writeContextState(used, total, threshold) {
  const statePath = path.join(os.tmpdir(), 'claude-statusline-state.json');
  try {
    fs.writeFileSync(statePath, JSON.stringify({
      used,
      total,
      threshold,
      timestamp: Date.now()
    }));
  } catch {}
}

// 格式化 token 数量
function formatTokens(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

// 格式化时间
function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60}m`;
  if (m > 0) return `${m}m${s % 60}s`;
  return `${s}s`;
}

// 格式化 rate limit 重置时间
function formatResetTime(resetsAt) {
  if (!resetsAt) return '';
  const diff = new Date(resetsAt).getTime() - Date.now();
  if (diff <= 0) return 'ready';
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h${m % 60}m`;
  return `${m}m`;
}

// 估算费用 (基于 Claude 3.5 Sonnet 价格)
function estimateCost(usedTokens, config) {
  const inputCost = (usedTokens / 1000) * (config.costPer1kInput || 0.015);
  return inputCost.toFixed(2);
}

// 主逻辑
let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input); } catch {}

  const config = loadConfig();
  const parts = [];

  // 1. Token 使用百分比 + 进度条
  const ctx = data.context_window;
  if (ctx) {
    const used = ctx.used_percentage ?? 0;
    const total = ctx.total ?? 0;
    const current = ctx.current_usage ?? 0;

    // 三色进度条
    const filled = Math.round(used / 5); // 20格更精细
    let bar = '';
    for (let i = 0; i < 20; i++) {
      if (i < filled) {
        if (i < 12) bar += '█'; // 绿色区
        else if (i < 16) bar += '▓'; // 黄色区
        else bar += '░'; // 红色区
      } else {
        bar += '░';
      }
    }

    // 状态指示
    let icon = '🟢';
    let status = '';
    if (used >= (config.autoCompactThreshold || 85)) {
      icon = '🔴';
      status = ' ⚠️ FULL';
    } else if (used >= (config.warnThreshold || 70)) {
      icon = '🟡';
      status = ' ⚡ HIGH';
    }

    parts.push(`${icon} ${bar} ${used.toFixed(1)}%${status}`);

    // 实际 token 数
    if (total > 0) {
      parts.push(`📊 ${formatTokens(current)}/${formatTokens(total)}`);
    }

    // 写入状态供 hook 使用
    writeContextState(current, total, config.autoCompactThreshold || 85);
  }

  // 2. 剩余消息数估算
  if (ctx && ctx.total && ctx.current_usage) {
    const remainingTokens = ctx.total - ctx.current_usage;
    const estimatedMsgs = Math.max(0, Math.floor(remainingTokens / 6000));
    parts.push(`💬 ~${estimatedMsgs}`);
  }

  // 3. 对话轮数
  const turns = data.turn_count ?? data.conversation_turns ?? data.turns ?? null;
  if (turns !== null) {
    parts.push(`🔄 ${turns}`);
  }

  // 4. 会话时长
  if (config.showDuration !== false) {
    const startTime = data.session_start_time ?? data.startTime ?? null;
    if (startTime) {
      const duration = Date.now() - new Date(startTime).getTime();
      parts.push(`⏱️ ${formatDuration(duration)}`);
    }
  }

  // 5. 费用估算
  if (config.showCost !== false && ctx && ctx.current_usage) {
    const cost = estimateCost(ctx.current_usage, config);
    parts.push(`💰 $${cost}`);
  }

  // 6. Rate limits
  if (data.rate_limits) {
    const h5 = data.rate_limits['5h'];
    if (h5) {
      const pct = h5.used_percentage ?? 0;
      const reset = formatResetTime(h5.resets_at);
      let rateIcon = '⚡';
      if (pct > 80) rateIcon = '⚠️';
      parts.push(`${rateIcon} 5h:${pct}%${reset ? '(' + reset + ')' : ''}`);
    }
    const d7 = data.rate_limits['7d'];
    if (d7) {
      const pct = d7.used_percentage ?? 0;
      parts.push(`📅 7d:${pct}%`);
    }
  }

  // 7. Session name
  if (data.session_name) {
    parts.push(`📌 ${data.session_name}`);
  }

  // 输出
  if (parts.length === 0) {
    console.log('⏳ Waiting for context data...');
  } else {
    console.log(parts.join(' │ '));
  }
});
