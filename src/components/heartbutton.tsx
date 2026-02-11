"use client";
import React from 'react';
import { useWishlist } from '../context/wishlistcontext'; 
import { Product } from '../app/products/productsdata'; 

export default function HeartButton({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isHearted = isInWishlist(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="d-grid gap-2">
      <button 
        className={`btn btn-lg ${isHearted ? "btn-success" : "btn-outline-dark"}`}
        type="button"
        onClick={handleToggle}
        style={{ transition: 'all 0.2s ease-in-out' }}
      >
        <i className={`bi ${isHearted ? "bi-check-circle-fill" : "bi-heart"} me-2`}></i>
        {isHearted ? "Added to Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
}