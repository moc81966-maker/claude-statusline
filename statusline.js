#!/usr/bin/env node
// claude-statusline - Claude Code 上下文使用量监控状态栏
// https://github.com/YOUR_USERNAME/claude-statusline

let input = '';
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(input); } catch {}

  const parts = [];

  // Token 使用百分比 + 进度条
  const ctx = data.context_window;
  if (ctx) {
    const used = ctx.used_percentage ?? 0;

    // 进度条 (10格)
    const filled = Math.round(used / 10);
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    // 颜色指示
    let icon = '🟢';
    if (used > 80) icon = '🔴';
    else if (used > 60) icon = '🟡';

    parts.push(`${icon} ${bar} ${used.toFixed(1)}%`);
  }

  // 剩余消息数估算 (平均 6k tokens/条)
  if (ctx && ctx.total && ctx.current_usage) {
    const remainingTokens = ctx.total - ctx.current_usage;
    const estimatedMsgs = Math.max(0, Math.floor(remainingTokens / 6000));
    parts.push(`💬 ~${estimatedMsgs} msgs`);
  }

  // 对话轮数
  const turns = data.turn_count ?? data.conversation_turns ?? data.turns ?? null;
  if (turns !== null) {
    parts.push(`🔄 ${turns} turns`);
  }

  // Rate limits
  if (data.rate_limits) {
    const h5 = data.rate_limits['5h'];
    if (h5 && h5.used_percentage !== undefined) {
      let rateIcon = '⚡';
      if (h5.used_percentage > 80) rateIcon = '⚠️';
      parts.push(`${rateIcon} 5h:${h5.used_percentage}%`);
    }
  }

  // Session name
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
