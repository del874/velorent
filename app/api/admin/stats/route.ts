import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/admin-auth'

// GET /api/admin/stats - Get overall statistics
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total counts
    const [
      totalBookings,
      totalUsers,
      totalBikes,
      availableBikes,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.user.count(),
      prisma.bike.count(),
      prisma.bike.count({ where: { available: true } }),
    ])

    // Get total revenue (from completed bookings)
    const completedBookings = await prisma.booking.findMany({
      where: { status: 'completed' },
      select: { totalPrice: true },
    })

    const totalRevenue = completedBookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    )

    // Get active users (users with at least one booking)
    const activeUsers = await prisma.user.count({
      where: {
        bookings: {
          some: {},
        },
      },
    })

    // Get bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: true,
    })

    const statusCounts = bookingsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>)

    // Get recent bookings (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    // Get popular bikes (most booked)
    const bikeBookingCounts = await prisma.booking.groupBy({
      by: ['bikeId'],
      _count: true,
      orderBy: {
        _count: {
          bikeId: 'desc',
        },
      },
      take: 5,
    })

    const popularBikes = await Promise.all(
      bikeBookingCounts.map(async (item) => {
        const bike = await prisma.bike.findUnique({
          where: { id: item.bikeId },
          select: {
            id: true,
            name: true,
            nameEn: true,
            image: true,
          },
        })
        return {
          ...bike,
          bookingCount: item._count,
        }
      })
    )

    return NextResponse.json({
      stats: {
        totalBookings,
        totalUsers,
        activeUsers,
        totalBikes,
        availableBikes,
        totalRevenue: Math.round(totalRevenue),
        recentBookings,
        statusCounts,
        popularBikes,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
