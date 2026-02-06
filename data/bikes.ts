import { Bike } from '@/types';

export const bikes: Bike[] = [
  {
    id: '1',
    name: '城市巡游者 E-1',
    nameEn: 'City Cruiser E-1',
    type: 'electric',
    brand: 'Velo',
    price: 12,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    description: '电动助力 • 60km 续航',
    features: ['电动助力', '60km续航', '舒适座椅', '前置车篮'],
    specifications: {
      frame: '铝合金',
      gears: '7速',
      weight: '18kg',
      range: '60km'
    }
  },
  {
    id: '2',
    name: '经典公路系列',
    nameEn: 'Classic Road Series',
    type: 'road',
    brand: 'Velo',
    price: 8,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1485965120184-e224f7a1dcfe?w=800&q=80',
    description: '人力驱动 • 轻量化设计',
    features: ['轻量化', '碳纤维车架', '21速变速', '公路轮胎'],
    specifications: {
      frame: '碳纤维',
      gears: '21速',
      weight: '8kg'
    }
  },
  {
    id: '3',
    name: '城市折叠款',
    nameEn: 'City Folding Bike',
    type: 'folding',
    brand: 'Velo',
    price: 10,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
    description: '可折叠 • 便携通勤',
    features: ['可折叠', '便携设计', '7速变速', '后置货架'],
    specifications: {
      frame: '铝合金',
      gears: '7速',
      weight: '12kg'
    }
  },
  {
    id: '4',
    name: '全能载物版',
    nameEn: 'Cargo Utility Bike',
    type: 'cargo',
    brand: 'Velo',
    price: 15,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?w=800&q=80',
    description: '大容量载货 • 稳重可靠',
    features: ['大容量载货', '加长车架', '强力刹车', '防滑轮胎'],
    specifications: {
      frame: '高强度钢',
      gears: '7速',
      weight: '25kg'
    }
  },
  {
    id: '5',
    name: '山地越野 X5',
    nameEn: 'Mountain Trail X5',
    type: 'mountain',
    brand: 'TrailBlazer',
    price: 18,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=800&q=80',
    description: '全地形适应 • 专业级配置',
    features: ['全地形适应', '前叉避震', '27.5寸轮胎', '液压碟刹'],
    specifications: {
      frame: '铝合金',
      gears: '27速',
      weight: '14kg'
    }
  },
  {
    id: '6',
    name: '城市轻便版踏',
    nameEn: 'City Lite Step',
    type: 'city',
    brand: 'Velo',
    price: 6,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&q=80',
    description: '简单实用 • 城市通勤',
    features: ['低跨点设计', '舒适骑行', '防盗锁', 'LED车灯'],
    specifications: {
      frame: '铝合金',
      gears: '单速',
      weight: '14kg'
    }
  },
  {
    id: '7',
    name: '电子踏板车 Pro',
    nameEn: 'E-Scooter Pro',
    type: 'electric',
    brand: 'EcoRide',
    price: 20,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1600103333626-dfbf4dd6a8db?w=800&q=80',
    description: '智能电动 • 极速出行',
    features: ['电动助力', '智能仪表', '可折叠', 'APP控制'],
    specifications: {
      frame: '镁合金',
      gears: '电动',
      weight: '12kg',
      range: '40km'
    }
  },
  {
    id: '8',
    name: '异形大轮 FatTire',
    nameEn: 'FatTire Cruiser',
    type: 'mountain',
    brand: 'TrailBlazer',
    price: 22,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1583467875263-d50dec37a88c?w=800&q=80',
    description: '特殊地形 • 越野体验',
    features: ['宽胎设计', '雪地沙滩适用', '强力电机', '长续航'],
    specifications: {
      frame: '高强度钢',
      gears: '电动',
      weight: '28kg',
      range: '50km'
    }
  },
  {
    id: '9',
    name: '深度越野 4x4',
    nameEn: 'Extreme 4x4',
    type: 'mountain',
    brand: 'TrailBlazer',
    price: 25,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80',
    description: '专业级越野 • 极限挑战',
    features: ['全避震系统', '专业变速', '强化车架', '越野轮胎'],
    specifications: {
      frame: '碳纤维',
      gears: '30速',
      weight: '13kg'
    }
  }
];

export const bikeTypes = [
  { value: 'city', label: '城市车' },
  { value: 'road', label: '公路车' },
  { value: 'mountain', label: '山地车' },
  { value: 'folding', label: '折叠车' },
  { value: 'cargo', label: '载货车' },
  { value: 'electric', label: '电动车' }
] as const;

export const brands = ['Velo', 'TrailBlazer', 'EcoRide', 'Specialized', 'Giant'];

export const locations = [
  '市中心站点',
  '火车站广场',
  '科技园区',
  '大学城',
  '滨江公园',
  '商业步行街',
  '体育馆',
  '国际机场'
];
