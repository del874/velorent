import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bikes - Get all bikes or filter/search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Type filter
    if (type) {
      where.type = type;
    }

    // Brand filter
    if (brand) {
      where.brand = brand;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }

    // Only show available bikes
    where.available = true;

    const bikes = await prisma.bike.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse features and specifications from JSON strings
    const formattedBikes = bikes.map((bike) => ({
      ...bike,
      features: JSON.parse(bike.features),
      specifications: JSON.parse(bike.specifications),
    }));

    return NextResponse.json(formattedBikes);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return NextResponse.json({ error: 'Failed to fetch bikes' }, { status: 500 });
  }
}

// POST /api/bikes - Create a new bike (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    const bike = await prisma.bike.create({
      data: {
        name,
        nameEn,
        type,
        brand,
        price,
        priceUnit,
        image,
        description,
        features: JSON.stringify(features),
        specifications: JSON.stringify(specifications),
      },
    });

    return NextResponse.json(bike, { status: 201 });
  } catch (error) {
    console.error('Error creating bike:', error);
    return NextResponse.json({ error: 'Failed to create bike' }, { status: 500 });
  }
}
