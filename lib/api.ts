const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export interface Bike {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  brand: string;
  price: number;
  priceUnit: string;
  image: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bikeId: string;
  bike: Bike;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Bikes API
export async function getBikes(params?: {
  search?: string;
  type?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Bike[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.brand) searchParams.append('brand', params.brand);
  if (params?.minPrice) searchParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());

  const response = await fetch(`${API_BASE}/api/bikes?${searchParams.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bikes');
  }

  return response.json();
}

export async function getBike(id: string): Promise<Bike> {
  const response = await fetch(`${API_BASE}/api/bikes/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bike');
  }

  return response.json();
}

// Bookings API
export async function createBooking(data: {
  bikeId: string;
  userId?: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
}): Promise<Booking> {
  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking');
  }

  return response.json();
}

export async function getBookings(params?: {
  email?: string;
  status?: string;
}): Promise<Booking[]> {
  const searchParams = new URLSearchParams();
  if (params?.email) searchParams.append('email', params.email);
  if (params?.status) searchParams.append('status', params.status);

  const response = await fetch(`${API_BASE}/api/bookings?${searchParams.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return response.json();
}

export async function getBooking(id: string): Promise<Booking> {
  const response = await fetch(`${API_BASE}/api/bookings/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch booking');
  }

  return response.json();
}

export async function cancelBooking(id: string): Promise<Booking> {
  const response = await fetch(`${API_BASE}/api/bookings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to cancel booking');
  }

  return response.json();
}
