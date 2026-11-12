'use client';

import React, { createContext, useContext, useState } from 'react';

interface WishlistContextType {
  wishlist: any[];
  toggleWishlist: (product: any) => void;
  isWishlisted: (id: any) => boolean;
  totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<any[]>([]);

  const toggleWishlist = (product: any) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isWishlisted = (id: any) => wishlist.some((item) => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, totalWishlist: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist harus digunakan di dalam WishlistProvider');
  return context;
}