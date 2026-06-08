#!/usr/bin/env node
// claude-statusline 安装脚本

const fs = require('fs');
const path = require('path');
const os = require('os');

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const SCRIPT_PATH = path.join(__dirname, 'statusline.js');

function install() {
  console.log('📦 Installing claude-statusline...\n');

  // 检查 settings.json 是否存在
  let settings = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
      console.log('✅ Found existing settings.json');
    } catch (e) {
      console.error('❌ Failed to parse settings.json:', e.message);
      process.exit(1);
    }
  } else {
    console.log('📝 Creating new settings.json');
  }

  // 检查是否已安装
  if (settings.statusLine && settings.statusLine.command && settings.statusLine.command.includes('claude-statusline')) {
    console.log('⚠️  claude-statusline is already installed');
    console.log('   Current command:', settings.statusLine.command);
    process.exit(0);
  }

  // 添加 statusLine 配置
  settings.statusLine = {
    type: 'command',
    command: `node ${SCRIPT_PATH.replace(/\\/g, '/')}`,
    refreshInterval: 10
  };

  // 写入配置
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
    console.log('✅ Added statusLine to settings.json');
  } catch (e) {
    console.error('❌ Failed to write settings.json:', e.message);
    process.exit(1);
  }

  console.log('\n🎉 Installation complete!');
  console.log('📌 Restart Claude Code to see the statusline');
  console.log('\nTo uninstall, remove the "statusLine" block from:');
  console.log('  ' + SETTINGS_PATH);
}

install();
