"use client";
import React, { useState } from 'react';
import { useCart } from '../context/cartcontext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export default function AddToCart({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    setIsAdding(true);
    setMessage(null);

    try {
      // FIX: Just await the function. Do not assign it to a variable.
      await addToCart(product, quantity);

      // If we reach this line, it was successful
      setMessage(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart successfully`);
      setQuantity(1); 

    } catch (error) {
      console.error("Add to cart error:", error);
      setMessage("Failed to add item to cart");
    } finally {
      setIsAdding(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div>
      {/* Quantity Selector */}
      <div className="mb-3">
        <label className="form-label fw-bold">Quantity:</label>
        <div className="input-group" style={{ maxWidth: '150px' }}>
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
          >-</button>
          <input 
            type="number" 
            className="form-control text-center" 
            value={quantity} 
            readOnly 
          />
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => setQuantity(prev => prev + 1)}
          >+</button>
        </div>
      </div>

      {/* Add Button */}
      <button 
        className="btn btn-dark w-100 py-2" 
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {isAdding ? "Adding..." : `Add to Cart • R${(product.price * quantity).toFixed(2)}`}
      </button>

      {/* Success/Error Message */}
      {message && (
        <div className={`alert mt-3 ${message.includes("Failed") ? "alert-danger" : "alert-success"}`} role="alert">
          {message}
        </div>
      )}
    </div>
  );
}