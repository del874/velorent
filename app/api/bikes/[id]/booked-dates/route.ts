import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bikes/[id]/booked-dates - Get booked date ranges for a bike
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch all active bookings for this bike
    const bookings = await prisma.booking.findMany({
      where: {
        bikeId: id,
        status: {
          in: ['pending', 'confirmed', 'active'],
        },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    // Format the booked date ranges
    const bookedDates = bookings.map(booking => ({
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
    }));

    return NextResponse.json(bookedDates);
  } catch (error) {
    console.error('Error fetching booked dates:', error);
    return NextResponse.json({ error: 'Failed to fetch booked dates' }, { status: 500 });
  }
}
