import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bikes/[id] - Get a single bike by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bike = await prisma.bike.findUnique({
      where: { id },
    });

    if (!bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    // Parse features and specifications from JSON strings
    const formattedBike = {
      ...bike,
      features: JSON.parse(bike.features),
      specifications: JSON.parse(bike.specifications),
    };

    return NextResponse.json(formattedBike);
  } catch (error) {
    console.error('Error fetching bike:', error);
    return NextResponse.json({ error: 'Failed to fetch bike' }, { status: 500 });
  }
}

// PATCH /api/bikes/[id] - Update a bike (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { features, specifications, ...rest } = body;

    const bike = await prisma.bike.update({
      where: { id },
      data: {
        ...rest,
        ...(features && { features: JSON.stringify(features) }),
        ...(specifications && { specifications: JSON.stringify(specifications) }),
      },
    });

    return NextResponse.json(bike);
  } catch (error) {
    console.error('Error updating bike:', error);
    return NextResponse.json({ error: 'Failed to update bike' }, { status: 500 });
  }
}

// DELETE /api/bikes/[id] - Delete a bike (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.bike.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Bike deleted successfully' });
  } catch (error) {
    console.error('Error deleting bike:', error);
    return NextResponse.json({ error: 'Failed to delete bike' }, { status: 500 });
  }
}
