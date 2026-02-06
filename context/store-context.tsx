'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Bike, CartItem, FilterOptions, BikeType } from '@/types';

interface StoreContextType {
  cart: CartItem | null;
  addToCart: (bike: Bike) => void;
  updateCartDates: (startDate: Date, endDate: Date) => void;
  updateCartLocation: (location: string) => void;
  clearCart: () => void;
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const defaultFilters: FilterOptions = {
  types: [],
  priceRange: [0, 100],
  brands: []
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = useCallback((bike: Bike) => {
    setCart({
      bike,
      startDate: null,
      endDate: null,
      pickupLocation: ''
    });
  }, []);

  const updateCartDates = useCallback((startDate: Date, endDate: Date) => {
    setCart(prev => prev ? { ...prev, startDate, endDate } : null);
  }, []);

  const updateCartLocation = useCallback((location: string) => {
    setCart(prev => prev ? { ...prev, pickupLocation: location } : null);
  }, []);

  const clearCart = useCallback(() => {
    setCart(null);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        updateCartDates,
        updateCartLocation,
        clearCart,
        filters,
        setFilters,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
