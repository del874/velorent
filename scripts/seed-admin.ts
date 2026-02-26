import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import * as bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL || 'file:./dev.db'

// Create the adapter
const adapter = new PrismaBetterSqlite3({
  url: connectionString,
})

const prisma = new PrismaClient({
  adapter,
})

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@velorent.com' },
    })

    if (existingAdmin) {
      console.log('✅ 管理员账号已存在')
      console.log('邮箱: admin@velorent.com')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 10)

    const admin = await prisma.user.create({
      data: {
        email: 'admin@velorent.com',
        name: '系统管理员',
        password: hashedPassword,
        role: 'admin',
      },
    })

    console.log('✅ 管理员账号创建成功！')
    console.log('邮箱: admin@velorent.com')
    console.log('密码: admin123456')
    console.log('用户ID:', admin.id)
    console.log('')
    console.log('⚠️  请在生产环境中修改默认密码！')
  } catch (error) {
    console.error('❌ 创建管理员失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
