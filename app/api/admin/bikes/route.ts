import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/admin-auth'

// GET /api/admin/bikes - Get all bikes (with pagination)
export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (type) where.type = type
    if (brand) where.brand = brand
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameEn: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Get total count
    const total = await prisma.bike.count({ where })

    // Get bikes with pagination
    const bikes = await prisma.bike.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      bikes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching bikes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bikes' },
      { status: 500 }
    )
  }
}

// POST /api/admin/bikes - Create new bike
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const admin = await getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      available = true,
    } = body

    // Validate required fields
    if (!name || !nameEn || !type || !brand || !price || !priceUnit || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create bike
    const bike = await prisma.bike.create({
      data: {
        name,
        nameEn,
        type,
        brand,
        price: parseInt(price),
        priceUnit,
        image,
        description,
        features: Array.isArray(features) ? JSON.stringify(features) : features,
        specifications:
          typeof specifications === 'object'
            ? JSON.stringify(specifications)
            : specifications,
        available,
      },
    })

    return NextResponse.json({ bike }, { status: 201 })
  } catch (error) {
    console.error('Error creating bike:', error)
    return NextResponse.json(
      { error: 'Failed to create bike' },
      { status: 500 }
    )
  }
}
