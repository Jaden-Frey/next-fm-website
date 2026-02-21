"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartTotal: number;
  itemCount: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const initialize = async () => {
      if (isSignedIn) {
        const pendingGuestId = localStorage.getItem('guestId');
        
        if (pendingGuestId) {
          try {
            await fetch('/api/cart/merge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guestId: pendingGuestId })
            });
            localStorage.removeItem('guestId');
            setGuestId(null);
          } catch (err) {
            console.error("Merge failed", err);
          }
        }
        await fetchCart();
      } 
      
      else {
        let id = localStorage.getItem('guestId');
        if (!id) {
          id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('guestId', id);
        }
        setGuestId(id);
        await fetchCart();
      }
    };

    initialize();
  }, [isLoaded, isSignedIn]);

  const fetchCart = async () => {
    const headers: any = {};
    
    if (!isSignedIn) {
       const currentGuestId = guestId || localStorage.getItem('guestId');
       if (!currentGuestId) return; 
       headers['x-guest-id'] = currentGuestId;
    }

    try {
      const res = await fetch('/api/cart', { headers });
      const data = await res.json();
      if (data.items) {
        setCart(data.items);
        setCartTotal(data.totalAmount || data.total || 0);
      }
    } catch (error) {
      console.error("Fetch cart error", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    const headers: any = { 'Content-Type': 'application/json' };
    
    if (!isSignedIn) {
        const currentGuestId = guestId || localStorage.getItem('guestId');
        if (currentGuestId) headers['x-guest-id'] = currentGuestId;
    }

    await fetch('/api/cart', {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        productId: product.id, 
        name: product.name,
        price: product.price,
        image: product.image,
        quantity 
      })
    });
    await fetchCart();
  };

  const removeFromCart = async (productId: number) => {
    const headers: any = {};
    if (!isSignedIn) {
        const currentGuestId = guestId || localStorage.getItem('guestId');
        if (currentGuestId) headers['x-guest-id'] = currentGuestId;
    }

    await fetch(`/api/cart?productId=${productId}`, { method: 'DELETE', headers });
    await fetchCart();
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (!isSignedIn) {
        const currentGuestId = guestId || localStorage.getItem('guestId');
        if (currentGuestId) headers['x-guest-id'] = currentGuestId;
    }

    await fetch('/api/cart', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ productId, quantity })
    });
    await fetchCart();
  };

  const clearCart = async () => {
    setCart([]);
    setCartTotal(0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      cartTotal, 
      itemCount: cart.reduce((a, b) => a + b.quantity, 0), 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}