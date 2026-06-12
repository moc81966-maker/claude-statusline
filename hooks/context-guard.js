#!/usr/bin/env node
// context-guard.js - 上下文保护 hook
// 当上下文快满时提醒用户或自动触发压缩

const fs = require('fs');
const path = require('path');
const os = require('os');

// 加载配置
function loadConfig() {
  const configPath = path.join(__dirname, '..', 'config.default.json');
  const userConfigPath = path.join(os.homedir(), '.claude', 'claude-statusline.json');
  let config = {};
  try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch {}
  try {
    const userConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
    config = { ...config, ...userConfig };
  } catch {}
  return config;
}

// 读取上下文状态
function getContextState() {
  const statePath = path.join(os.tmpdir(), 'claude-statusline-state.json');
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    return null;
  }
}

// 主逻辑
let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input); } catch {}

  const config = loadConfig();
  const state = getContextState();

  // 从 hook 输入或状态文件获取上下文使用率
  let usedPercentage = 0;
  if (data.context_window && data.context_window.used_percentage) {
    usedPercentage = data.context_window.used_percentage;
  } else if (state && state.used && state.total) {
    usedPercentage = (state.used / state.total) * 100;
  }

  const warnThreshold = config.warnThreshold || 70;
  const autoCompactThreshold = config.autoCompactThreshold || 85;

  // 超过自动压缩阈值 - 阻止并建议压缩
  if (usedPercentage >= autoCompactThreshold) {
    const result = {
      decision: 'block',
      reason: `🔴 上下文使用率 ${usedPercentage.toFixed(1)}% 已超过阈值 ${autoCompactThreshold}%！\n建议执行 /compact 压缩上下文后再继续。`
    };
    console.log(JSON.stringify(result));
    process.exit(0);
  }

  // 超过警告阈值 - 显示警告但允许继续
  if (usedPercentage >= warnThreshold) {
    const result = {
      decision: 'approve',
      reason: `🟡 注意：上下文使用率 ${usedPercentage.toFixed(1)}%，接近上限。建议适时执行 /compact。`
    };
    console.log(JSON.stringify(result));
    process.exit(0);
  }

  // 正常情况 - 静默通过
  console.log(JSON.stringify({ decision: 'approve' }));
});
