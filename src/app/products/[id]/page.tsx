"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeartButton from '../../../components/heartbutton'; 
import AddToCart from '../../../components/addtocart'; 

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id;

  useEffect(() => {
    // 1. Define the fetch function
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?id=${id}`);
        
        if (!res.ok) {
           setError("Product not found");
           setProduct(null);
        } else {
           const data = await res.json();
           setProduct(data);
           setError(null);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    // 2. Trigger the fetch if ID exists
    if (id) {
        fetchProduct();
    }
  }, [id]);


  if (loading) {
    return (
        <div className="container py-5 text-center" style={{ minHeight: '80vh', marginTop: '40px' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading product details...</p>
        </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-3 text-center" style={{ marginTop: '40px' }}>
        <h2>Product not found</h2>
        <p className="text-muted">We couldn't find a product with ID: {id}</p>
        <Link href="/products" className="btn btn-dark mt-3">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="container py-3" style={{ marginTop: '30px', minHeight: '80vh' }}>
      <div className="row g-5">
        {/* Left Column: Image */}
        <div className="col-md-6">
          <div className="ratio ratio-4x3 bg-light rounded overflow-hidden shadow-sm">
             <img 
               src={product.image} 
               alt={product.name}
               className="object-fit-cover w-100 h-100"
               onError={(e) => {
                   (e.target as HTMLImageElement).src = '/images/placeholder.png'; 
               }}
             />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="col-md-6">
          <h1 className="display-6 fw-bold mb-2">{product.name}</h1>
          
          <div className="mb-3">
             <span className="h2 text-danger fw-bold me-2">R{product.price.toFixed(2)}</span>
             <span className="text-muted">/ unit</span>
          </div>

          <p className="lead text-secondary mb-4" style={{ fontSize: '1rem' }}>
            {product.description}
          </p>

          <div className="mb-4">
            <span className="badge bg-secondary text-capitalize">
                {product.category || "Uncategorized"}
            </span>
          </div>

          <hr className="my-4" />
          
          {/* Action Buttons */}
          <div className="mb-4">
             <AddToCart product={product} />
          </div>

          <div className="d-grid">
             <HeartButton product={product} />
          </div>

          {/* Static Block */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="fw-bold">Product Features</h6>
            <ul className="mb-0 text-muted small ps-3">
               <li>Premium Quality</li>
               <li>Freshly Sourced</li>
               <li>Satisfaction Guaranteed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}