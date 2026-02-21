"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation'; 
import { useWishlist } from '../context/wishlistcontext'; 
import { Product } from '../app/products/productsdata'; 

export default function HeartButton({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const pathname = usePathname(); 

  const isHearted = isInWishlist(product.id);
  const isWishlistPage = pathname === '/wishlist'; 

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlistPage) {
      toggleWishlist(product);
    } else {
      if (isHearted) {
        router.push('/wishlist');
      } else {
        toggleWishlist(product);
      }
    }
  };
  
  if (isWishlistPage) {
    return (
      <div className="d-grid gap-2">
        <button 
          className="btn btn-lg btn-danger" 
          type="button"
          onClick={handleClick}
        >
          <i className="bi bi-heart-fill me-2"></i>
          Remove from Wishlist
        </button>
      </div>
    );
  }

  return (
    <div className="d-grid gap-2">
      <button 
        className={`btn btn-lg ${isHearted ? "btn-success" : "btn-outline-dark"}`}
        type="button"
        onClick={handleClick}
        style={{ transition: 'all 0.2s ease-in-out' }}
      >
        <i className={`bi ${isHearted ? "bi-check-circle-fill" : "bi-heart"} me-2`}></i>
        {isHearted ? "View in Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
}