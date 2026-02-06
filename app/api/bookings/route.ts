import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bookings - Get all bookings or filter by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    const where: any = {};

    if (email) {
      where.customerEmail = email;
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        bike: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bikeId,
      userId,
      startDate,
      endDate,
      pickupLocation,
      returnLocation,
      customerName,
      customerEmail,
      customerPhone,
      totalPrice,
    } = body;

    // Check if bike exists and is available
    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
    });

    if (!bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    if (!bike.available) {
      return NextResponse.json({ error: 'Bike is not available' }, { status: 400 });
    }

    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        bikeId,
        status: { in: ['pending', 'confirmed', 'active'] },
        OR: [
          {
            AND: [
              { startDate: { lte: new Date(endDate) } },
              { endDate: { gte: new Date(startDate) } },
            ],
          },
        ],
      },
    });

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Bike is already booked for the selected dates' },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bikeId,
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        pickupLocation,
        returnLocation,
        customerName,
        customerEmail,
        customerPhone,
        totalPrice,
        status: 'confirmed',
      },
      include: {
        bike: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
