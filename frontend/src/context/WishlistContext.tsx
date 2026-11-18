'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  wishlist: any[];
  toggleWishlist: (product: any) => void;
  isWishlisted: (id: any) => boolean;
  totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<any[]>([]);

  // 1. Ambil data tersimpan dari localStorage saat pertama kali aplikasi dimuat
  useEffect(() => {
    const savedWishlist = localStorage.getItem('mendadak_outdoor_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (err) {
        console.error('Gagal memparsing wishlist dari localStorage:', err);
      }
    }
  }, []);

  // 2. Fungsi toggle yang memperbarui state SEKALIGUS menyimpan ke localStorage
  const toggleWishlist = (product: any) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      let updatedList = [];

      if (exists) {
        updatedList = prev.filter((item) => item.id !== product.id);
      } else {
        updatedList = [...prev, product];
      }

      // Simpan permanen ke localStorage
      localStorage.setItem('mendadak_outdoor_wishlist', JSON.stringify(updatedList));
      return updatedList;
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