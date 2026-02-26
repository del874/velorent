import { GET } from '@/app/api/bikes/route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    bike: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  },
}))

describe('GET /api/bikes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockBikes = [
    {
      id: 'bike-1',
      name: '山地车 Pro',
      nameEn: 'Mountain Bike Pro',
      type: 'mountain',
      brand: 'Giant',
      price: 50,
      priceUnit: 'hour',
      image: '/bike1.jpg',
      description: '专业山地车',
      features: '["Suspension", "Disc Brakes"]',
      specifications: '{"frame": "Carbon", "gears": "21-speed"}',
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bike-2',
      name: '城市通勤车',
      nameEn: 'City Commuter',
      type: 'city',
      brand: 'Trek',
      price: 30,
      priceUnit: 'hour',
      image: '/bike2.jpg',
      description: '舒适城市骑行',
      features: '["Basket", "Lights"]',
      specifications: '{"frame": "Aluminum", "gears": "7-speed"}',
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  it('should return all bikes', async () => {
    ;(prisma.bike.findMany as jest.Mock).mockResolvedValue(mockBikes)

    const request = new Request('http://localhost:3000/api/bikes')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockBikes)
    expect(prisma.bike.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should filter bikes by type', async () => {
    const filteredBikes = [mockBikes[0]]
    ;(prisma.bike.findMany as jest.Mock).mockResolvedValue(filteredBikes)

    const request = new Request('http://localhost:3000/api/bikes?type=mountain')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(filteredBikes)
    expect(prisma.bike.findMany).toHaveBeenCalledWith({
      where: { type: 'mountain' },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should filter bikes by availability', async () => {
    const availableBikes = mockBikes.filter(b => b.available)
    ;(prisma.bike.findMany as jest.Mock).mockResolvedValue(availableBikes)

    const request = new Request('http://localhost:3000/api/bikes?available=true')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(availableBikes)
    expect(prisma.bike.findMany).toHaveBeenCalledWith({
      where: { available: true },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should filter by brand', async () => {
    const brandBikes = [mockBikes[0]]
    ;(prisma.bike.findMany as jest.Mock).mockResolvedValue(brandBikes)

    const request = new Request('http://localhost:3000/api/bikes?brand=Giant')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(brandBikes)
    expect(prisma.bike.findMany).toHaveBeenCalledWith({
      where: { brand: 'Giant' },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should handle multiple filters', async () => {
    const filteredBikes = [mockBikes[0]]
    ;(prisma.bike.findMany as jest.Mock).mockResolvedValue(filteredBikes)

    const request = new Request(
      'http://localhost:3000/api/bikes?type=mountain&brand=Giant&available=true'
    )
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(filteredBikes)
    expect(prisma.bike.findMany).toHaveBeenCalledWith({
      where: {
        type: 'mountain',
        brand: 'Giant',
        available: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should return 500 on error', async () => {
    ;(prisma.bike.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new Request('http://localhost:3000/api/bikes')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch bikes')
  })
})

describe('GET /api/bikes/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockBike = {
    id: 'bike-1',
    name: '山地车 Pro',
    nameEn: 'Mountain Bike Pro',
    type: 'mountain',
    brand: 'Giant',
    price: 50,
    priceUnit: 'hour',
    image: '/bike1.jpg',
    description: '专业山地车',
    features: '["Suspension", "Disc Brakes"]',
    specifications: '{"frame": "Carbon", "gears": "21-speed"}',
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should return bike by id', async () => {
    ;(prisma.bike.findUnique as jest.Mock).mockResolvedValue(mockBike)

    const request = new Request('http://localhost:3000/api/bikes/bike-1')
    const response = await GET(request as any, { params: Promise.resolve({ id: 'bike-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockBike)
    expect(prisma.bike.findUnique).toHaveBeenCalledWith({
      where: { id: 'bike-1' },
    })
  })

  it('should return 404 if bike not found', async () => {
    ;(prisma.bike.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/bikes/nonexistent')
    const response = await GET(request as any, { params: Promise.resolve({ id: 'nonexistent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Bike not found')
  })

  it('should return 500 on error', async () => {
    ;(prisma.bike.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new Request('http://localhost:3000/api/bikes/bike-1')
    const response = await GET(request as any, { params: Promise.resolve({ id: 'bike-1' }) })
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch bike')
  })
})
