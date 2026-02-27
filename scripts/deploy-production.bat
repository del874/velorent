@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM VeloRent 一键部署脚本 (Windows)
REM 使用 Vercel + Supabase 部署到生产环境

echo ===================================
echo   VeloRent 一键部署脚本
echo ===================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] Node.js 未安装
    pause
    exit /b 1
)

REM 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] npm 未安装
    pause
    exit /b 1
)

REM 检查并安装 Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [信息] Vercel CLI 未安装，正在安装...
    call npm install -g vercel
)

echo [完成] 环境检查完成
echo.

REM 步骤 1: 生成 JWT_SECRET
echo [步骤 1/5] 生成 JWT_SECRET
for /f "delims=" %%i in ('node -e "console.log(require(''crypto'').randomBytes(32).toString(''base64''))"') do set JWT_SECRET=%%i
echo [完成] JWT_SECRET 已生成
echo.

REM 步骤 2: 获取 Supabase 连接字符串
echo [步骤 2/5] 配置 Supabase 数据库
echo 你的 Supabase 项目 URL: https://prdogiudshkywudfbanx.supabase.co
echo.
echo 请按照以下步骤获取数据库连接字符串:
echo 1. 访问: https://supabase.com/dashboard/project/prdogiudshkywudfbanx/settings/database
echo 2. 找到 'Connection string' 部分
echo 3. 选择 'URI' 标签
echo 4. 复制连接字符串
echo 5. 将 [YOUR-PASSWORD] 替换为你的实际数据库密码
echo.

set /p DATABASE_URL="请粘贴你的 Supabase 连接字符串: "

if "!DATABASE_URL!"=="" (
    echo [错误] 连接字符串不能为空
    pause
    exit /b 1
)

echo [完成] Supabase 连接字符串已配置
echo.

REM 步骤 3: 创建 .env.production 文件
echo [步骤 3/5] 创建环境变量文件

(
echo DATABASE_URL=!DATABASE_URL!
echo JWT_SECRET=!JWT_SECRET!
echo NODE_ENV=production
echo NEXT_PUBLIC_APP_URL=https://velorent.vercel.app
) > .env.production

echo [完成] 环境变量文件已创建
echo.

REM 步骤 4: 登录 Vercel
echo [步骤 4/5] 检查 Vercel 登录状态

vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 需要登录 Vercel...
    call vercel login
)

echo [完成] Vercel 已登录
echo.

REM 步骤 5: 部署到 Vercel
echo [步骤 5/5] 部署到 Vercel
echo 正在部署，请稍候...
echo.

REM 设置环境变量
echo !DATABASE_URL! | vercel env add DATABASE_URL production
echo !JWT_SECRET! | vercel env add JWT_SECRET production
echo production | vercel env add NODE_ENV production
echo https://velorent.vercel.app | vercel env add NEXT_PUBLIC_APP_URL production

REM 部署
echo 开始部署...
call vercel --prod

echo.
echo ===================================
echo   部署完成！
echo ===================================
echo.
echo 部署信息:
echo   - 数据库: Supabase (https://prdogiudshkywudfbanx.supabase.co)
echo   - 应用: Vercel
echo.
echo 下一步:
echo   1. 访问你的应用 URL（上面显示的 vercel.app 地址）
echo   2. 注册一个新用户
echo   3. 在 Supabase SQL Editor 中运行以下命令设置为管理员:
echo.
echo      UPDATE "User" SET "role" = 'admin' WHERE "email" = 'YOUR_EMAIL@example.com';
echo.
echo   4. 使用管理员账号登录后访问 /admin 管理后台
echo.
echo ⚠️  重要提示:
echo   - 请妥善保存你的 JWT_SECRET
echo   - 请妥善保存你的数据库密码
echo.

pause
