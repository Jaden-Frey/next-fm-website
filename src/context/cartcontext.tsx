"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../app/products/productsdata';

interface CartItem extends Product {
  quantity: number;
  cartItemId?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartTotal: number;
  itemCount: number;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<{ success: boolean; message: string }>;
  removeFromCart: (productId: number) => Promise<{ success: boolean }>;
  updateQuantity: (productId: number, quantity: number) => Promise<{ success: boolean }>;
  clearCart: () => Promise<{ success: boolean }>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Utility to get or create guest ID
function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guestId', guestId);
    console.log('[Cart] Created new guest ID:', guestId);
  } else {
    console.log('[Cart] Using existing guest ID:', guestId);
  }
  return guestId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const guestId = getGuestId();

  // Calculate item count
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch cart from MongoDB on mount
  const fetchCart = async () => {
    if (!guestId) {
      setLoading(false);
      return;
    }

    try {
      console.log('[Cart] Fetching from API with guest ID:', guestId);
      
      const response = await fetch('/api/cart', {
        headers: {
          'x-guest-id': guestId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Cart] Fetched data:', data);
      
      setCart(data.items || []);
      setCartTotal(data.total || 0);
    } catch (error) {
      console.error('[Cart] Error fetching cart:', error);
      setCart([]);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [guestId]);

  // Add item to cart
  const addToCart = async (product: Product, quantity: number = 1): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('[Cart] Adding product:', product.id, product.name);
      console.log('[Cart] Quantity:', quantity);
      console.log('[Cart] Using guest ID:', guestId);

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': guestId,
        },
        body: JSON.stringify({ 
          productId: product.id,
          quantity 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Cart] Add result:', result);

      // Refresh cart after adding
      await fetchCart();

      return { 
        success: true, 
        message: `Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart` 
      };
    } catch (error) {
      console.error('[Cart] Error adding to cart:', error);
      return { 
        success: false, 
        message: 'Failed to add item to cart' 
      };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: number): Promise<{ success: boolean }> => {
    try {
      console.log('[Cart] Removing product:', productId);

      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'x-guest-id': guestId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh cart after removing
      await fetchCart();

      return { success: true };
    } catch (error) {
      console.error('[Cart] Error removing from cart:', error);
      return { success: false };
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: number, quantity: number): Promise<{ success: boolean }> => {
    try {
      console.log('[Cart] Updating quantity for product:', productId, 'to:', quantity);

      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': guestId,
        },
        body: JSON.stringify({ 
          productId,
          quantity 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh cart after updating
      await fetchCart();

      return { success: true };
    } catch (error) {
      console.error('[Cart] Error updating quantity:', error);
      return { success: false };
    }
  };

  // Clear entire cart
  const clearCart = async (): Promise<{ success: boolean }> => {
    try {
      console.log('[Cart] Clearing cart');
      
      // Remove all items one by one
      for (const item of cart) {
        await removeFromCart(item.id);
      }

      return { success: true };
    } catch (error) {
      console.error('[Cart] Error clearing cart:', error);
      return { success: false };
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart,
      cartTotal,
      itemCount,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}