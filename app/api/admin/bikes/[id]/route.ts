import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/admin-auth'

// GET /api/admin/bikes/[id] - Get bike by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bike = await prisma.bike.findUnique({
      where: { id },
    })

    if (!bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 })
    }

    return NextResponse.json({ bike })
  } catch (error) {
    console.error('Error fetching bike:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bike' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/bikes/[id] - Update bike
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      nameEn,
      type,
      brand,
      price,
      priceUnit,
      image,
      description,
      features,
      specifications,
      available,
    } = body

    // Check if bike exists
    const existingBike = await prisma.bike.findUnique({
      where: { id },
    })

    if (!existingBike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 })
    }

    // Update bike
    const bike = await prisma.bike.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(type !== undefined && { type }),
        ...(brand !== undefined && { brand }),
        ...(price !== undefined && { price: parseInt(price) }),
        ...(priceUnit !== undefined && { priceUnit }),
        ...(image !== undefined && { image }),
        ...(description !== undefined && { description }),
        ...(features !== undefined && {
          features: Array.isArray(features) ? JSON.stringify(features) : features,
        }),
        ...(specifications !== undefined && {
          specifications:
            typeof specifications === 'object'
              ? JSON.stringify(specifications)
              : specifications,
        }),
        ...(available !== undefined && { available }),
      },
    })

    return NextResponse.json({ bike })
  } catch (error) {
    console.error('Error updating bike:', error)
    return NextResponse.json(
      { error: 'Failed to update bike' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/bikes/[id] - Delete bike
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if bike exists
    const existingBike = await prisma.bike.findUnique({
      where: { id },
    })

    if (!existingBike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 })
    }

    // Check if bike has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        bikeId: id,
        status: { in: ['confirmed', 'active'] },
      },
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bike with active bookings' },
        { status: 400 }
      )
    }

    // Delete bike
    await prisma.bike.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Bike deleted successfully' })
  } catch (error) {
    console.error('Error deleting bike:', error)
    return NextResponse.json(
      { error: 'Failed to delete bike' },
      { status: 500 }
    )
  }
}
