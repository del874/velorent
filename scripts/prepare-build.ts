#!/usr/bin/env tsx

/**
 * Vercel 构建准备脚本
 *
 * 在 Vercel 构建前运行，确保 Prisma 配置正确
 */

import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || '';

console.log('🔧 Preparing build configuration...');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   Database:', databaseUrl.startsWith('postgresql://') ? 'PostgreSQL' : 'SQLite');

// 读取 schema 文件
let schema = fs.readFileSync(schemaPath, 'utf-8');

// 在生产环境使用 PostgreSQL
if (isProduction && databaseUrl.startsWith('postgresql://')) {
  console.log('   ✅ Configuring for PostgreSQL (production)');

  // 替换 provider
  schema = schema.replace(
    /provider = "sqlite"/,
    'provider = "postgresql"'
  );
  schema = schema.replace(
    /\/\/ provider = "postgresql"/,
    'provider = "postgresql"'
  );
  schema = schema.replace(
    /provider = "postgresql"\n    \/\/ provider = "postgresql"/,
    'provider = "postgresql"'
  );
} else {
  console.log('   ✅ Configuring for SQLite (development)');

  // 确保 provider 是 sqlite
  schema = schema.replace(
    /provider = "postgresql"/,
    'provider = "sqlite"'
  );
}

// 写回文件
fs.writeFileSync(schemaPath, schema, 'utf-8');

console.log('   ✅ Schema configuration complete');
console.log('');
