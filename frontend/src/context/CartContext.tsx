'use client';

import React, { createContext, useContext, useState } from 'react';

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
  removeFromCart: (id: any) => void;
  updateQuantity: (id: any, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: any, quantity = 1, variant = 'Standard') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id && item.variant === variant);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
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

  // Fungsi khusus untuk Beli Cepat (mengosongkan keranjang lalu isi dengan 1 produk pilihan)
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

  const removeFromCart = (id: any) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: any, quantity: number) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
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