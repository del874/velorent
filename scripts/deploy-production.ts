#!/usr/bin/env tsx

/**
 * VeloRent 一键部署脚本
 *
 * 使用方法:
 *   npx tsx scripts/deploy-production.ts
 *
 * 功能:
 *   - 生成 JWT_SECRET
 *   - 配置 Supabase 数据库连接
 *   - 自动部署到 Vercel
 *   - 配置所有环境变量
 */

import * as readline from 'readline';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message: string, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command: string, cwd?: string): string {
  try {
    return execSync(command, {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  } catch (error) {
    throw new Error(`命令执行失败: ${command}`);
  }
}

async function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  log('===================================', 'blue');
  log('  VeloRent 一键部署脚本', 'blue');
  log('===================================', 'blue');
  log('');

  // 检查环境
  log('检查环境...', 'yellow');

  try {
    exec('node --version');
    exec('npm --version');
  } catch (error) {
    log('错误: Node.js 或 npm 未安装', 'red');
    process.exit(1);
  }

  // 检查 Vercel CLI
  try {
    exec('vercel --version');
  } catch (error) {
    log('Vercel CLI 未安装，正在安装...', 'yellow');
    exec('npm install -g vercel');
  }

  log('✓ 环境检查完成', 'green');
  log('');

  // 步骤 1: 生成 JWT_SECRET
  log('步骤 1/5: 生成 JWT_SECRET', 'yellow');
  const JWT_SECRET = crypto.randomBytes(32).toString('base64');
  log('✓ JWT_SECRET 已生成', 'green');
  log('');

  // 步骤 2: 获取 Supabase 连接字符串
  log('步骤 2/5: 配置 Supabase 数据库', 'yellow');
  log('你的 Supabase 项目 URL: https://prdogiudshkywudfbanx.supabase.co');
  log('');
  log('请按照以下步骤获取数据库连接字符串:');
  log('1. 访问: https://supabase.com/dashboard/project/prdogiudshkywudfbanx/settings/database');
  log('2. 找到 "Connection string" 部分');
  log('3. 选择 "URI" 标签');
  log('4. 复制连接字符串，格式如: postgresql://postgres:[YOUR-PASSWORD]@db.prdogiudshkywudfbanx.supabase.co:5432/postgres');
  log('5. 将 [YOUR-PASSWORD] 替换为你的实际数据库密码');
  log('');

  const DATABASE_URL = await question('请粘贴你的 Supabase 连接字符串: ');

  if (!DATABASE_URL) {
    log('错误: 连接字符串不能为空', 'red');
    process.exit(1);
  }

  // 验证连接字符串格式
  if (!DATABASE_URL.startsWith('postgresql://')) {
    log('错误: 连接字符串格式不正确', 'red');
    log('应该以 postgresql:// 开头', 'red');
    process.exit(1);
  }

  log('✓ Supabase 连接字符串已配置', 'green');
  log('');

  // 步骤 3: 创建 .env.production 文件
  log('步骤 3/5: 创建环境变量文件', 'yellow');

  const envContent = [
    `DATABASE_URL="${DATABASE_URL}"`,
    `JWT_SECRET="${JWT_SECRET}"`,
    `NODE_ENV="production"`,
    `NEXT_PUBLIC_APP_URL="https://velorent.vercel.app"`,
  ].join('\n');

  fs.writeFileSync(
    path.join(process.cwd(), '.env.production'),
    envContent
  );

  log('✓ 环境变量文件已创建: .env.production', 'green');
  log('');

  // 步骤 4: 检查 Vercel 登录状态
  log('步骤 4/5: 检查 Vercel 登录状态', 'yellow');

  try {
    exec('vercel whoami');
  } catch (error) {
    log('需要登录 Vercel...', 'yellow');
    exec('vercel login');
  }

  log('✓ Vercel 已登录', 'green');
  log('');

  // 步骤 5: 部署到 Vercel
  log('步骤 5/5: 部署到 Vercel', 'yellow');
  log('正在配置环境变量...', 'yellow');

  try {
    // 配置环境变量
    log(`  配置 DATABASE_URL...`, 'yellow');
    exec(`echo "${DATABASE_URL}" | vercel env add DATABASE_URL production`);

    log(`  配置 JWT_SECRET...`, 'yellow');
    exec(`echo "${JWT_SECRET}" | vercel env add JWT_SECRET production`);

    log(`  配置 NODE_ENV...`, 'yellow');
    exec(`echo "production" | vercel env add NODE_ENV production`);

    log(`  配置 NEXT_PUBLIC_APP_URL...`, 'yellow');
    exec(`echo "https://velorent.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production`);

    log('✓ 环境变量配置完成', 'green');
  } catch (error) {
    log('警告: 环境变量配置可能失败，请手动在 Vercel 控制台检查', 'yellow');
  }

  log('');
  log('开始部署...', 'yellow');
  log('');

  try {
    exec('vercel --prod', path.join(process.cwd(), '..'));
  } catch (error) {
    log('部署可能遇到问题，请检查上方输出', 'yellow');
  }

  log('');
  log('===================================', 'green');
  log('  部署完成！', 'green');
  log('===================================', 'green');
  log('');
  log('📝 部署信息:', 'blue');
  log('  - 数据库: Supabase (https://prdogiudshkywudfbanx.supabase.co)');
  log('  - 应用: Vercel');
  log('');
  log('🎯 下一步:', 'blue');
  log('  1. 访问你的应用 URL（上面显示的 vercel.app 地址）');
  log('  2. 注册一个新用户');
  log('  3. 在 Supabase SQL Editor 中运行以下命令设置为管理员:');
  log('');
  log('     UPDATE "User" SET "role" = \'admin\' WHERE "email" = \'YOUR_EMAIL@example.com\';', 'yellow');
  log('');
  log('  4. 使用管理员账号登录后访问 /admin 管理后台');
  log('');
  log('⚠️  重要提示:', 'yellow');
  log(`  - 请妥善保存你的 JWT_SECRET: ${JWT_SECRET}`);
  log('  - 请妥善保存你的数据库密码');
  log('');
}

// 运行主函数
main().catch((error) => {
  log(`错误: ${error.message}`, 'red');
  process.exit(1);
});
