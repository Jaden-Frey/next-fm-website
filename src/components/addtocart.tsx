"use client";
import React, { useState } from "react";
import { useCart } from "../context/cartcontext";
import { Product } from "../app/products/productsdata";

interface AddToCartProps {
  product: Product;
}

export default function AddToCart({ product }: AddToCartProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    setMessage(null);

    try {
      const result = await addToCart(product, quantity);
      
      if (result.success) {
        setMessage(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
        // Reset quantity after successful add
        setQuantity(1);
      } else {
        setMessage('Failed to add to cart');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setIsAdding(false);
      // Clear message after 
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="position-relative">
      {/* Success/Error Message */}
      {message && (
        <div 
          className="position-absolute start-50 translate-middle-x rounded shadow-sm text-center py-2 px-3"
          style={{ 
            zIndex: 1050, 
            top: '-60px',
            backgroundColor: message.includes('Failed') ? '#f8d7da' : '#d4edda',
            color: message.includes('Failed') ? '#721c24' : '#155724',
            border: message.includes('Failed') ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
            fontSize: '0.9rem',
            fontWeight: '500',
            minWidth: '250px'
          }}
        >
          {message}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="mb-3">
        <label className="form-label fw-bold">Quantity:</label>
        <div className="d-flex align-items-center gap-3">
          <div className="btn-group" role="group">
            <button 
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isAdding}
            >
              <i className="bi bi-dash"></i>
            </button>
            <input 
              type="text" 
              className="form-control text-center" 
              value={quantity}
              readOnly
              style={{ width: '70px' }}
            />
            <button 
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handleQuantityChange(1)}
              disabled={isAdding}
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
          <span className="text-muted">/ unit</span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button 
        className="btn btn-dark btn-lg w-100"
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isAdding ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Adding...
          </>
        ) : (
          <>
            <i className="bi bi-cart-plus me-2"></i>
            Add to Cart • R{(product.price * quantity).toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
}