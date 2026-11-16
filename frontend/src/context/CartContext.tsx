'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: any;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  weight?: number;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number, variant?: string) => void;
  buyNow: (product: any, quantity?: number, variant?: string) => void;
  removeFromCart: (id: any, variant?: string) => void;
  updateQuantity: (id: any, quantity: number, variant?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (e) {
          console.error('Gagal memparsing cart dari localStorage', e);
        }
      }
    }
    return [];
  });

  // Simpan keranjang ke localStorage setiap kali ada perubahan
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, quantity = 1, variant = 'Standard') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id && item.variant === variant);
      if (existingIndex > -1) {
        const updated = [...prev];
        // Salin objek state ({ ...item }) guna menghindari duplikasi nilai saat dev mode
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          quantity, 
          variant, 
          weight: product.weight || 1.0,
          image: product.image || ''
        }];
      }
    });
  };

  // Fungsi khusus untuk Beli Cepat
  const buyNow = (product: any, quantity = 1, variant = 'Standard') => {
    setCart([{
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      variant,
      weight: product.weight || 1.0,
      image: product.image || ''
    }]);
  };

  // Ubah logika hapus menggunakan kunci kombinasi id + variant
  const removeFromCart = (id: any, variant = 'Standard') => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.variant === variant)));
  };

  // Ubah logika update jumlah menggunakan kunci kombinasi id + variant serta salin objek state
  const updateQuantity = (id: any, quantity: number, variant = 'Standard') => {
    setCart((prev) => 
      prev.map((item) => (item.id === id && item.variant === variant ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, buyNow, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus digunakan di dalam CartProvider');
  return context;
}
