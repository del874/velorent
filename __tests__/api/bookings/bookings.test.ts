import { GET, POST } from '@/app/api/bookings/route'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    bike: {
      findUnique: jest.fn(),
    },
  },
}))

describe('GET /api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockBookings = [
    {
      id: 'booking-1',
      userId: 'user-1',
      bikeId: 'bike-1',
      startDate: new Date('2026-03-01T10:00:00Z'),
      endDate: new Date('2026-03-01T18:00:00Z'),
      pickupLocation: '西湖店',
      returnLocation: '西湖店',
      customerName: '张三',
      customerEmail: 'zhangsan@example.com',
      customerPhone: '13800138000',
      totalPrice: 400,
      status: 'confirmed',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      bike: {
        id: 'bike-1',
        name: '山地车 Pro',
        image: '/bike1.jpg',
        price: 50,
        priceUnit: 'hour',
      },
      user: {
        id: 'user-1',
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
      },
    },
  ]

  it('should return all bookings for admin', async () => {
    ;(prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings)

    const request = new Request('http://localhost:3000/api/bookings')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockBookings)
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: {},
      include: {
        bike: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should filter bookings by userId', async () => {
    const userBookings = [mockBookings[0]]
    ;(prisma.booking.findMany as jest.Mock).mockResolvedValue(userBookings)

    const request = new Request('http://localhost:3000/api/bookings?userId=user-1')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(userBookings)
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: {
        bike: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should filter bookings by status', async () => {
    const confirmedBookings = [mockBookings[0]]
    ;(prisma.booking.findMany as jest.Mock).mockResolvedValue(confirmedBookings)

    const request = new Request('http://localhost:3000/api/bookings?status=confirmed')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(confirmedBookings)
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: { status: 'confirmed' },
      include: {
        bike: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should return 500 on error', async () => {
    ;(prisma.booking.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new Request('http://localhost:3000/api/bookings')
    const response = await GET(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch bookings')
  })
})

describe('POST /api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockBike = {
    id: 'bike-1',
    name: '山地车 Pro',
    price: 50,
    priceUnit: 'hour',
    available: true,
  }

  const newBooking = {
    id: 'new-booking-id',
    userId: 'user-1',
    bikeId: 'bike-1',
    startDate: new Date('2026-03-01T10:00:00Z'),
    endDate: new Date('2026-03-01T18:00:00Z'),
    pickupLocation: '西湖店',
    returnLocation: '西湖店',
    customerName: '张三',
    customerEmail: 'zhangsan@example.com',
    customerPhone: '13800138000',
    totalPrice: 400,
    status: 'confirmed',
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should create a new booking successfully', async () => {
    ;(prisma.bike.findUnique as jest.Mock).mockResolvedValue(mockBike)
    ;(prisma.booking.findMany as jest.Mock).mockResolvedValue([]) // No conflicts
    ;(prisma.booking.create as jest.Mock).mockResolvedValue({
      ...newBooking,
      bike: mockBike,
      user: {
        id: 'user-1',
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000',
      },
    })

    const request = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        bikeId: 'bike-1',
        userId: 'user-1',
        startDate: '2026-03-01T10:00:00Z',
        endDate: '2026-03-01T18:00:00Z',
        pickupLocation: '西湖店',
        returnLocation: '西湖店',
        customerName: '张三',
        customerEmail: 'zhangsan@example.com',
        customerPhone: '13800138000',
        totalPrice: 400,
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.bikeId).toBe('bike-1')
    expect(data.userId).toBe('user-1')
    expect(prisma.booking.create).toHaveBeenCalled()
  })

  it('should return 404 if bike not found', async () => {
    ;(prisma.bike.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        bikeId: 'nonexistent-bike',
        userId: 'user-1',
        startDate: '2026-03-01T10:00:00Z',
        endDate: '2026-03-01T18:00:00Z',
        pickupLocation: '西湖店',
        customerName: '张三',
        customerEmail: 'zhangsan@example.com',
        customerPhone: '13800138000',
        totalPrice: 400,
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Bike not found')
  })

  it('should return 400 for date conflict', async () => {
    ;(prisma.bike.findUnique as jest.Mock).mockResolvedValue(mockBike)
    ;(prisma.booking.findMany as jest.Mock).mockResolvedValue([newBooking]) // Has conflict

    const request = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        bikeId: 'bike-1',
        userId: 'user-1',
        startDate: '2026-03-01T10:00:00Z',
        endDate: '2026-03-01T18:00:00Z',
        pickupLocation: '西湖店',
        customerName: '张三',
        customerEmail: 'zhangsan@example.com',
        customerPhone: '13800138000',
        totalPrice: 400,
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('Date conflict: This bike is already booked for the selected dates')
  })

  it('should return 400 if missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        // Missing required fields
        bikeId: 'bike-1',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })

  it('should return 500 on error', async () => {
    ;(prisma.bike.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new Request('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({
        bikeId: 'bike-1',
        userId: 'user-1',
        startDate: '2026-03-01T10:00:00Z',
        endDate: '2026-03-01T18:00:00Z',
        pickupLocation: '西湖店',
        customerName: '张三',
        customerEmail: 'zhangsan@example.com',
        customerPhone: '13800138000',
        totalPrice: 400,
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to create booking')
  })
})
