import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const connectionString = process.env.DATABASE_URL || 'file:./dev.db';

// Create the adapter
const adapter = new PrismaBetterSqlite3({
  url: connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Starting seed...');

  // Create bikes
  const bikes = await prisma.bike.createMany({
    data: [
      {
        name: '城市巡游者 E-1',
        nameEn: 'City Cruiser E-1',
        type: 'electric',
        brand: 'Velo',
        price: 12,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        description: '电动助力 • 60km 续航',
        features: JSON.stringify(['电动助力', '60km续航', '舒适座椅', '前置车篮']),
        specifications: JSON.stringify({
          frame: '铝合金',
          gears: '7速',
          weight: '18kg',
          range: '60km',
        }),
      },
      {
        name: '经典公路系列',
        nameEn: 'Classic Road Series',
        type: 'road',
        brand: 'Velo',
        price: 8,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1485965120184-e224f7a1dcfe?w=800&q=80',
        description: '人力驱动 • 轻量化设计',
        features: JSON.stringify(['轻量化', '碳纤维车架', '21速变速', '公路轮胎']),
        specifications: JSON.stringify({
          frame: '碳纤维',
          gears: '21速',
          weight: '8kg',
        }),
      },
      {
        name: '城市折叠款',
        nameEn: 'City Folding Bike',
        type: 'folding',
        brand: 'Velo',
        price: 10,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
        description: '可折叠 • 便携通勤',
        features: JSON.stringify(['可折叠', '便携设计', '7速变速', '后置货架']),
        specifications: JSON.stringify({
          frame: '铝合金',
          gears: '7速',
          weight: '12kg',
        }),
      },
      {
        name: '全能载物版',
        nameEn: 'Cargo Utility Bike',
        type: 'cargo',
        brand: 'Velo',
        price: 15,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?w=800&q=80',
        description: '大容量载货 • 稳重可靠',
        features: JSON.stringify(['大容量载货', '加长车架', '强力刹车', '防滑轮胎']),
        specifications: JSON.stringify({
          frame: '高强度钢',
          gears: '7速',
          weight: '25kg',
        }),
      },
      {
        name: '山地越野 X5',
        nameEn: 'Mountain Trail X5',
        type: 'mountain',
        brand: 'TrailBlazer',
        price: 18,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
        description: '全地形适应 • 专业级配置',
        features: JSON.stringify(['全地形适应', '前叉避震', '27.5寸轮胎', '液压碟刹']),
        specifications: JSON.stringify({
          frame: '铝合金',
          gears: '27速',
          weight: '14kg',
        }),
      },
      {
        name: '城市轻便版踏',
        nameEn: 'City Lite Step',
        type: 'city',
        brand: 'Velo',
        price: 6,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
        description: '简单实用 • 城市通勤',
        features: JSON.stringify(['低跨点设计', '舒适骑行', '防盗锁', 'LED车灯']),
        specifications: JSON.stringify({
          frame: '铝合金',
          gears: '单速',
          weight: '14kg',
        }),
      },
      {
        name: '电子踏板车 Pro',
        nameEn: 'E-Scooter Pro',
        type: 'electric',
        brand: 'EcoRide',
        price: 20,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1600103333626-dfbf4dd6a8db?w=800&q=80',
        description: '智能电动 • 极速出行',
        features: JSON.stringify(['电动助力', '智能仪表', '可折叠', 'APP控制']),
        specifications: JSON.stringify({
          frame: '镁合金',
          gears: '电动',
          weight: '12kg',
          range: '40km',
        }),
      },
      {
        name: '异形大轮 FatTire',
        nameEn: 'FatTire Cruiser',
        type: 'mountain',
        brand: 'TrailBlazer',
        price: 22,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1583467875263-d50dec37a88c?w=800&q=80',
        description: '特殊地形 • 越野体验',
        features: JSON.stringify(['宽胎设计', '雪地沙滩适用', '强力电机', '长续航']),
        specifications: JSON.stringify({
          frame: '高强度钢',
          gears: '电动',
          weight: '28kg',
          range: '50km',
        }),
      },
      {
        name: '深度越野 4x4',
        nameEn: 'Extreme 4x4',
        type: 'mountain',
        brand: 'TrailBlazer',
        price: 25,
        priceUnit: 'hour',
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80',
        description: '专业级越野 • 极限挑战',
        features: JSON.stringify(['全避震系统', '专业变速', '强化车架', '越野轮胎']),
        specifications: JSON.stringify({
          frame: '碳纤维',
          gears: '30速',
          weight: '13kg',
        }),
      },
    ],
  });

  console.log(`Created ${bikes.count} bikes`);

  // Create a sample booking
  const firstBike = await prisma.bike.findFirst();
  if (firstBike) {
    const booking = await prisma.booking.create({
      data: {
        bikeId: firstBike.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        pickupLocation: '市中心站点',
        returnLocation: '市中心站点',
        customerName: '测试用户',
        customerEmail: 'test@example.com',
        customerPhone: '13800138000',
        totalPrice: 24,
        status: 'confirmed',
      },
    });
    console.log(`Created sample booking: ${booking.id}`);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
