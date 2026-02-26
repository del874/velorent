# 数据库设计修复总结

## 修复日期
2026-02-26

## 问题描述

### 原始问题
1. **Booking 模型缺少与 User 的关联**
   - 代码中使用了 `userId` 字段，但 Prisma Schema 中未定义
   - 无法通过数据库关系查询用户的预订

2. **用户体验问题**
   - 用户登录后仍需手动填写姓名、邮箱、电话
   - 预订信息与用户账户没有关联

## 修复方案

### 1. 数据库 Schema 更新

#### Booking 模型变更
```prisma
model Booking {
  id              String   @id @default(cuid())
  userId          String?  // 新增：关联用户ID
  user            User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  bikeId          String
  bike            Bike     @relation(fields: [bikeId], references: [id])
  // ... 保留 customerName, customerEmail, customerPhone 作为快照
}
```

#### User 模型变更
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  phone     String?  // 新增：用户电话
  password  String?
  role      String   @default("user")
  bookings  Booking[] // 新增：用户的预订列表
}
```

### 2. 迁移执行
```bash
npx prisma migrate dev --name add_booking_user_relation
```

迁移内容：
- 为 User 表添加 `phone` 列
- 为 Booking 表添加 `userId` 列（可为空，兼容历史数据）
- 创建外键约束：`Booking.userId -> User.id`
- 设置删除策略：`ON DELETE SET NULL`

### 3. API 代码更新

#### `/api/bookings/route.ts`
- GET 请求：包含关联的用户信息
- POST 请求：创建预订时关联 userId

#### `/api/bookings/[id]/route.ts`
- GET/PATCH：返回预订时包含用户信息
- DELETE：取消预订（标记为 cancelled）

#### `/api/auth/me` 和 `getCurrentUser`
- 从数据库查询完整用户信息（包括 phone）
- 返回格式保持兼容

### 4. 前端优化

#### `context/auth-context.tsx`
- User 接口添加 `phone` 字段

#### `app/bikes/[id]/page.tsx`
- 用户登录后自动填充姓名、邮箱、电话
- 表单仍允许修改（支持临时联系人）

## 测试验证

### 1. 数据库验证
```bash
# 启动 Prisma Studio
npx prisma studio

# 检查表结构
- User 表应该有 phone 列
- Booking 表应该有 userId 列
- Booking.userId 应该有外键约束
```

### 2. API 测试

#### 测试用户注册（带电话）
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "password": "123456"
  }'
```

#### 测试获取当前用户
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

应该返回：
```json
{
  "user": {
    "userId": "...",
    "email": "test@example.com",
    "name": "测试用户",
    "phone": null
  }
}
```

#### 测试创建预订
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "bikeId": "BIKE_ID",
    "userId": "USER_ID",
    "startDate": "2026-03-01T10:00:00.000Z",
    "endDate": "2026-03-01T18:00:00.000Z",
    "pickupLocation": "西湖店",
    "customerName": "测试用户",
    "customerEmail": "test@example.com",
    "customerPhone": "13800138000",
    "totalPrice": 200
  }'
```

### 3. 前端测试

1. **测试自动填充**
   - 访问 http://localhost:3000/login
   - 登录账户
   - 访问任意车型详情页
   - 预订表单应自动填充用户信息

2. **测试预订创建**
   - 选择日期和地点
   - 确认用户信息已自动填充
   - 提交预订
   - 检查预订是否关联到用户

3. **测试用户预订列表**
   - 访问 http://localhost:3000/bookings
   - 应显示当前用户的所有预订

## 向后兼容性

### 历史数据
- ✅ `userId` 设置为可选（String?）
- ✅ 保留 customerName, customerEmail, customerPhone 字段
- ✅ 删除用户时设置为 NULL（不删除预订记录）

### API 兼容性
- ✅ GET /api/bookings 仍支持通过 email 查询
- ✅ POST /api/bookings 仍接受 customer 信息
- ✅ 返回数据结构扩展（包含 user 对象）

## 后续改进建议

### 高优先级
1. **用户个人信息编辑**
   - 允许用户修改姓名、电话
   - API: PATCH /api/auth/me

2. **修改密码功能**
   - 需要验证旧密码
   - API: PATCH /api/auth/password

3. **预订验证**
   - 只能查看/取消自己的预订
   - 添加权限检查

### 中优先级
4. **优化用户体验**
   - 显示 "已自动填充" 提示
   - 添加"保存我的信息"选项

5. **数据一致性**
   - 用户修改信息时，是否更新历史预订？
   - 建议保留预订时的快照（当前设计）

6. **测试完善**
   - API 单元测试
   - 集成测试
   - E2E 测试更新

## 文件清单

### 修改的文件
```
prisma/schema.prisma                        # 数据库模型
prisma/migrations/.../migration.sql          # 迁移脚本
lib/auth.ts                                  # JWTPayload 类型
lib/auth-api.ts                              # getCurrentUser 函数
context/auth-context.tsx                     # User 接口
app/api/bookings/route.ts                    # 预订列表 API
app/api/bookings/[id]/route.ts               # 单个预订 API
app/bikes/[id]/page.tsx                      # 车型详情页（前端）
```

### 新增文件
```
DATABASE_FIX_SUMMARY.md                      # 本文档
```

## 回滚方案

如果需要回滚：

```bash
# 回滚数据库迁移
npx prisma migrate resolve --rolled-back [migration_name]

# 或手动回滚
npx prisma migrate reset  # ⚠️ 警告：删除所有数据

# 恢复代码
git checkout [commit_hash]
```

## 总结

✅ **修复完成**
- Booking 与 User 现已正确关联
- 用户信息可自动填充
- 保留了历史数据和向后兼容性
- API 和前端均已更新

🎯 **测试通过**
- 数据库迁移成功
- 开发服务器正常启动
- API 代码编译无错误

📋 **下一步**
- 测试前端预订流程
- 添加用户信息编辑功能
- 完善测试覆盖

---

**修复者**: Claude (Senior Fullstack Assistant)
**审核**: 待审核
**状态**: ✅ 已完成
