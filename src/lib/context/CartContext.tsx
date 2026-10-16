'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductItem, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductItem, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  itemCount: number;
  deliveryDistrict: string;
  setDeliveryDistrict: (district: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryDistrict, setDeliveryDistrict] = useState('Moulvibazar');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('need_electro_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedDistrict = localStorage.getItem('need_electro_delivery_district');
      if (savedDistrict) {
        setDeliveryDistrict(savedDistrict);
      }
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('need_electro_cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const handleSetDistrict = (district: string) => {
    setDeliveryDistrict(district);
    try {
      localStorage.setItem('need_electro_delivery_district', district);
    } catch {
      // ignore
    }
  };

  const addToCart = (product: ProductItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    setDiscountPercent(0);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'NEEDELECTRO10') {
      setCouponCode(clean);
      setDiscountPercent(0.1); // 10% off
      return true;
    }
    if (clean === 'MOULVIBAZAR' || clean === 'WELCOME') {
      setCouponCode(clean);
      setDiscountPercent(0.05); // 5% off
      return true;
    }
    return false;
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const discount = Math.round(subtotal * discountPercent);

  // Dynamic regional delivery charge:
  // Local (Moulvibazar): ৳60 (free over ৳10,000)
  // Nationwide (Any other district): ৳120 (free over ৳15,000)
  const isLocal = deliveryDistrict.toLowerCase().includes('moulvibazar');
  const freeThreshold = isLocal ? 10000 : 15000;
  const baseRate = isLocal ? 60 : 120;
  const deliveryCharge = items.length > 0 ? (subtotal >= freeThreshold ? 0 : baseRate) : 0;
  const total = Math.max(0, subtotal - discount + deliveryCharge);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        deliveryCharge,
        total,
        couponCode,
        applyCoupon,
        itemCount,
        deliveryDistrict,
        setDeliveryDistrict: handleSetDistrict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
