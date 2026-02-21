"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../app/products/productsdata'; 

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => Promise<{ success: boolean; action: string }>;
  isInWishlist: (id: string | number | undefined) => boolean;
  loading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guestId', guestId);
    console.log('[Wishlist] Created new guest ID:', guestId);
  } else {
    console.log('[Wishlist] Using existing guest ID:', guestId);
  }
  return guestId;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const guestId = getGuestId();

  // Fetch wishlist from MongoDB 
  const fetchWishlist = async () => {
    if (!guestId) {
      setLoading(false);
      return;
    }

    try {
      console.log('[Wishlist] Fetching from API with guest ID:', guestId);
      
      const response = await fetch('/api/wishlist', {
        headers: {
          'x-guest-id': guestId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Wishlist] Fetched data:', data);
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[Wishlist] Error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [guestId]);

  // Toggle wishlist item (add/remove) via MongoDB API
  const toggleWishlist = async (product: Product): Promise<{ success: boolean; action: string }> => {
    try {
      console.log('[Wishlist] Toggling product:', product.id, product.name);
      console.log('[Wishlist] Using guest ID:', guestId);

      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-id': guestId,
        },
        body: JSON.stringify({ productId: product.id }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Wishlist] Toggle result:', result);
      await fetchWishlist();

      return { success: true, action: result.action };
    } catch (error) {
      console.error('[Wishlist] Error toggling wishlist:', error);
      return { success: false, action: 'error' };
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (id: string | number | undefined) => {
    if (!id) return false;
    return wishlist.some((p) => p.id === id);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      toggleWishlist, 
      isInWishlist, 
      loading,
      refreshWishlist: fetchWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}