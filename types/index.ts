export interface Bike {
  id: string;
  name: string;
  nameEn: string;
  type: BikeType;
  brand: string;
  price: number;
  priceUnit: 'hour' | 'day';
  image: string;
  description: string;
  features: string[];
  specifications: {
    frame: string;
    gears: string;
    weight: string;
    range?: string; // For e-bikes
  };
}

export type BikeType = 'city' | 'road' | 'mountain' | 'folding' | 'cargo' | 'electric';

export interface FilterOptions {
  types: BikeType[];
  priceRange: [number, number];
  brands: string[];
}

export interface Booking {
  id: string;
  bikeId: string;
  userId?: string;
  bikeName: string;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  returnLocation: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface CartItem {
  bike: Bike;
  startDate: Date | null;
  endDate: Date | null;
  pickupLocation: string;
}
