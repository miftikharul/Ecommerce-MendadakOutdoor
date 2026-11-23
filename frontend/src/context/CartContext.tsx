'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartProductInput {
  id: string | number;
  name: string;
  price: number;
  quantity?: number;
  variant?: string;
  weight?: number;
  image?: string;
}

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  variant: string;
  weight: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProductInput, quantity?: number, variant?: string) => void;
  buyNow: (product: CartProductInput, quantity?: number, variant?: string) => void;
  removeFromCart: (id: string | number, variant?: string) => void;
  updateQuantity: (id: string | number, quantity: number, variant?: string) => void;
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
          const parsed: unknown = JSON.parse(savedCart);
          return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
        } catch (e) {
          console.error('Gagal memparsing cart dari localStorage', e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: CartProductInput, quantity = 1, variant = 'Standard') => {
    const resolvedVariant = variant || product.variant || 'Standard';
    const resolvedQty = typeof quantity === 'number' && !Number.isNaN(quantity) ? Math.max(1, quantity) : 1;
    const resolvedPrice = typeof product.price === 'number' && !Number.isNaN(product.price) ? product.price : 0;
    const resolvedWeight = typeof product.weight === 'number' && !Number.isNaN(product.weight) ? product.weight : 1000;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.variant === resolvedVariant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + resolvedQty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: resolvedPrice,
          quantity: resolvedQty,
          variant: resolvedVariant,
          weight: resolvedWeight,
          image: product.image || '',
        },
      ];
    });
  };

  const buyNow = (product: CartProductInput, quantity = 1, variant = 'Standard') => {
    const resolvedVariant = variant || product.variant || 'Standard';
    const resolvedQty = typeof quantity === 'number' && !Number.isNaN(quantity) ? Math.max(1, quantity) : 1;
    const resolvedPrice = typeof product.price === 'number' && !Number.isNaN(product.price) ? product.price : 0;
    const resolvedWeight = typeof product.weight === 'number' && !Number.isNaN(product.weight) ? product.weight : 1000;

    setCart([
      {
        id: product.id,
        name: product.name,
        price: resolvedPrice,
        quantity: resolvedQty,
        variant: resolvedVariant,
        weight: resolvedWeight,
        image: product.image || '',
      },
    ]);
  };

  const removeFromCart = (id: string | number, variant = 'Standard') => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.variant === variant)));
  };

  const updateQuantity = (id: string | number, quantity: number, variant = 'Standard') => {
    const safeQty = typeof quantity === 'number' && !Number.isNaN(quantity) ? Math.max(0, quantity) : 1;
    setCart((prev) =>
      prev.map((item) => (item.id === id && item.variant === variant ? { ...item, quantity: safeQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, buyNow, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus digunakan di dalam CartProvider');
  return context;
}