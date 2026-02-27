#!/bin/bash

# VeloRent 一键部署脚本
# 使用 Vercel + Supabase 部署到生产环境

set -e  # 遇到错误立即退出

echo "==================================="
echo "  VeloRent 一键部署脚本"
echo "==================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查必要的工具
echo -e "${YELLOW}检查环境...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: npm 未安装${NC}"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI 未安装，正在安装...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✓ 环境检查完成${NC}"
echo ""

# 步骤 1: 生成 JWT_SECRET
echo -e "${YELLOW}步骤 1/5: 生成 JWT_SECRET${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo -e "${GREEN}✓ JWT_SECRET 已生成${NC}"
echo ""

# 步骤 2: 获取 Supabase 连接字符串
echo -e "${YELLOW}步骤 2/5: 配置 Supabase 数据库${NC}"
echo "你的 Supabase 项目 URL: https://prdogiudshkywudfbanx.supabase.co"
echo ""
echo "请按照以下步骤获取数据库连接字符串："
echo "1. 访问: https://supabase.com/dashboard/project/prdogiudshkywudfbanx/settings/database"
echo "2. 找到 'Connection string' 部分"
echo "3. 选择 'URI' 标签"
echo "4. 复制连接字符串，格式如: postgresql://postgres:[YOUR-PASSWORD]@db.prdogiudshkywudfbanx.supabase.co:5432/postgres"
echo "5. 将 [YOUR-PASSWORD] 替换为你的实际数据库密码"
echo ""

read -p "请粘贴你的 Supabase 连接字符串: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}错误: 连接字符串不能为空${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Supabase 连接字符串已配置${NC}"
echo ""

# 步骤 3: 创建 .env.production 文件
echo -e "${YELLOW}步骤 3/5: 创建环境变量文件${NC}"

cat > .env.production << EOF
DATABASE_URL="$DATABASE_URL"
JWT_SECRET="$JWT_SECRET"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://velorent.vercel.app"
EOF

echo -e "${GREEN}✓ 环境变量文件已创建${NC}"
echo ""

# 步骤 4: 登录 Vercel（如果未登录）
echo -e "${YELLOW}步骤 4/5: 检查 Vercel 登录状态${NC}"

if ! vercel whoami &> /dev/null; then
    echo "需要登录 Vercel..."
    vercel login
fi

echo -e "${GREEN}✓ Vercel 已登录${NC}"
echo ""

# 步骤 5: 部署到 Vercel
echo -e "${YELLOW}步骤 5/5: 部署到 Vercel${NC}"
echo "正在部署，请稍候..."
echo ""

# 设置环境变量并部署
vercel env add DATABASE_URL production <<< "$DATABASE_URL" 2>/dev/null || true
vercel env add JWT_SECRET production <<< "$JWT_SECRET" 2>/dev/null || true
vercel env add NODE_ENV production <<< "production" 2>/dev/null || true
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://velorent.vercel.app" 2>/dev/null || true

# 部署
echo "开始部署..."
vercel --prod

echo ""
echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
echo "📝 部署信息:"
echo "  - 数据库: Supabase (https://prdogiudshkywudfbanx.supabase.co)"
echo "  - 应用: Vercel"
echo ""
echo "🎯 下一步:"
echo "  1. 访问你的应用 URL（上面显示的 vercel.app 地址）"
echo "  2. 注册一个新用户"
echo "  3. 在 Supabase SQL Editor 中运行以下命令设置为管理员:"
echo ""
echo "     UPDATE \"User\" SET \"role\" = 'admin' WHERE \"email\" = 'YOUR_EMAIL@example.com';"
echo ""
echo "  4. 使用管理员账号登录后访问 /admin 管理后台"
echo ""
echo -e "${YELLOW}⚠️  重要提示:${NC}"
echo "  - 请妥善保存你的 JWT_SECRET: $JWT_SECRET"
echo "  - 请妥善保存你的数据库密码"
echo ""
