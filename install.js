#!/usr/bin/env node
// claude-statusline v2.0 安装脚本

const fs = require('fs');
const path = require('path');
const os = require('os');

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const SCRIPT_PATH = path.join(__dirname, 'statusline.js');
const HOOK_PATH = path.join(__dirname, 'hooks', 'context-guard.js');
const USER_CONFIG_PATH = path.join(os.homedir(), '.claude', 'claude-statusline.json');
const DEFAULT_CONFIG_PATH = path.join(__dirname, 'config.default.json');

function install() {
  console.log('📦 Installing claude-statusline v2.0...\n');

  // 读取或创建 settings.json
  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
      console.log('✅ Found existing settings.json');
    } catch (e) {
      console.error('❌ Failed to parse settings.json:', e.message);
      process.exit(1);
    }
  }

  // 检查是否已安装
  if (settings.statusLine && settings.statusLine.command && settings.statusLine.command.includes('claude-statusline')) {
    console.log('⚠️  Updating existing claude-statusline installation...');
  }

  // 添加 statusLine 配置
  settings.statusLine = {
    type: 'command',
    command: `node ${SCRIPT_PATH.replace(/\\/g, '/')}`,
    refreshInterval: 10
  };

  // 添加 UserPromptSubmit hook (上下文保护)
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.UserPromptSubmit) settings.hooks.UserPromptSubmit = [];

  // 检查是否已存在
  const hookExists = settings.hooks.UserPromptSubmit.some(h =>
    h.hooks && h.hooks.some(hook => hook.command && hook.command.includes('context-guard'))
  );

  if (!hookExists) {
    settings.hooks.UserPromptSubmit.push({
      matcher: '',
      hooks: [{
        type: 'command',
        command: `node ${HOOK_PATH.replace(/\\/g, '/')}`,
        shell: 'powershell',
        timeout: 5
      }]
    });
    console.log('✅ Added context-guard hook');
  }

  // 写入 settings.json
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
    console.log('✅ Updated settings.json');
  } catch (e) {
    console.error('❌ Failed to write settings.json:', e.message);
    process.exit(1);
  }

  // 创建用户配置文件（如果不存在）
  if (!fs.existsSync(USER_CONFIG_PATH)) {
    try {
      const defaultConfig = fs.readFileSync(DEFAULT_CONFIG_PATH, 'utf8');
      fs.writeFileSync(USER_CONFIG_PATH, defaultConfig);
      console.log('✅ Created user config: ' + USER_CONFIG_PATH);
    } catch (e) {
      console.log('⚠️  Could not create user config:', e.message);
    }
  } else {
    console.log('ℹ️  User config already exists');
  }

  console.log('\n🎉 Installation complete!');
  console.log('\n📌 重启 Claude Code 生效');
  console.log('\n⚙️  配置文件: ' + USER_CONFIG_PATH);
  console.log('   可自定义阈值、费用单价等参数');
  console.log('\n🗑️  卸载: 删除 settings.json 中的 statusLine 和 UserPromptSubmit hook');
}

install();
