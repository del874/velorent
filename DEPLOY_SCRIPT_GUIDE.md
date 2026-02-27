# 一键部署指南

本指南将帮助你使用自动化脚本将 VeloRent 部署到 Vercel + Supabase。

---

## 前置要求

在运行部署脚本之前，请确保：

- [x] 已安装 Node.js (18+)
- [x] 已安装 npm
- [x] 代码已推送到 GitHub
- [x] Supabase 项目已创建（已完成 ✅）
- [ ] 需要获取 Supabase 数据库密码

---

## 部署步骤

### 方法 1: 使用 npm 脚本（推荐所有平台）

```bash
cd bike-app
npm run deploy
```

这个方法在 Windows、Mac 和 Linux 上都能正常工作。

### 方法 2: Windows 批处理脚本

```bash
cd bike-app
npm run deploy:win
```

或者直接双击 `scripts\deploy-production.bat`

### 方法 3: Unix/Mac Shell 脚本

```bash
cd bike-app
npm run deploy:unix
```

或者直接运行：
```bash
bash scripts/deploy-production.sh
```

---

## 脚本运行流程

脚本会自动完成以下步骤：

### ✅ 步骤 1: 环境检查
- 检查 Node.js 和 npm 是否安装
- 检查并自动安装 Vercel CLI

### ✅ 步骤 2: 生成 JWT_SECRET
- 自动生成一个安全的 32 字节随机密钥

### ✅ 步骤 3: 配置数据库
- 提示你输入 Supabase 连接字符串
- 验证连接字符串格式

### ✅ 步骤 4: 创建环境变量文件
- 自动生成 `.env.production` 文件

### ✅ 步骤 5: Vercel 登录
- 检查登录状态
- 如未登录，引导你完成登录

### ✅ 步骤 6: 部署
- 自动配置所有环境变量到 Vercel
- 触发生产环境部署

---

## 获取 Supabase 连接字符串

脚本会提示你输入 Supabase 连接字符串。按以下步骤获取：

1. 访问: https://supabase.com/dashboard/project/prdogiudshkywudfbanx/settings/database
2. 找到 **Connection string** 部分
3. 选择 **URI** 标签
4. 复制连接字符串，格式如：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.prdogiudshkywudfbanx.supabase.co:5432/postgres
   ```
5. 将 `[YOUR-PASSWORD]` 替换为你的实际数据库密码

**如何获取数据库密码：**

如果你忘记了密码：
1. 访问 https://supabase.com/dashboard/project/prdogiudshkywudfbanx/settings/database
2. 在 **Database password** 部分
3. 点击 **Reset Database Password**
4. 保存新密码！

---

## 部署后设置

部署完成后，你需要：

### 1. 访问应用

脚本会输出你的应用 URL，格式如：
```
https://velorent-xxx.vercel.app
```

### 2. 创建管理员账号

1. 在应用中注册一个新用户
2. 访问 Supabase SQL Editor: https://supabase.com/dashboard/project/prdogiudshkywudfbanx/sql/new
3. 运行以下 SQL：

```sql
UPDATE "User" SET "role" = 'admin' WHERE "email" = 'YOUR_EMAIL@example.com';
```

将 `YOUR_EMAIL@example.com` 替换为你的注册邮箱。

### 3. 登录管理后台

1. 使用管理员账号登录
2. 访问 `/admin` 进入管理后台
3. 开始管理自行车和订单！

---

## 故障排除

### 问题: 命令找不到

```
错误: 'tsx' 不是内部或外部命令
```

**解决:**
```bash
npm install -g tsx
```

### 问题: Vercel 登录失败

**解决:**
1. 手动访问 https://vercel.com
2. 使用 GitHub 登录
3. 重新运行脚本

### 问题: 数据库连接失败

**检查:**
- DATABASE_URL 是否正确（没有拼写错误）
- 数据库密码是否正确
- Supabase 项目是否处于 Active 状态

### 问题: 环境变量未设置

**手动设置:**
1. 访问 Vercel 控制台
2. 进入 velorent 项目
3. Settings → Environment Variables
4. 手动添加以下变量：
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_APP_URL` = `https://velorent.vercel.app`

---

## 重要提示

⚠️ **请妥善保存以下信息：**

1. **JWT_SECRET** - 脚本生成后会显示，请保存到安全的地方
2. **数据库密码** - 用于 DATABASE_URL
3. **Vercel 账号** - 用于管理部署

这些信息丢失后无法恢复！

---

## 下一步

部署成功后，你可以：

1. **添加测试数据**
   ```bash
   npm run db:seed
   ```

2. **监控应用**
   - Vercel Dashboard: 查看部署日志和性能
   - Supabase Dashboard: 监控数据库使用情况

3. **配置自定义域名**（可选）
   - 在 Vercel 控制台添加你的域名
   - 更新 DNS 记录

---

## 需要帮助？

如果遇到问题：

1. 查看完整部署指南: `DEPLOYMENT.md`
2. 查看快速开始: `QUICKSTART.md`
3. 检查脚本输出中的错误信息

---

**祝你部署顺利！** 🚀
