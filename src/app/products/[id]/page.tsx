"use client";
import { useParams } from 'next/navigation';
import { productsData } from '../productsdata'; 
import HeartButton from '../../../components/heartbutton'; 
import AddToCart from '../../../components/addtocart'; 
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const product = productsData.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="container py-3 text-center" style={{ marginTop: '40px' }}>
        <h2>Product not found</h2>
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

          <hr className="my-4" />
          <div className="mb-4">
             <AddToCart product={product} />
          </div>

          {/* Wishlist Button */}
          <div className="d-grid">
             <HeartButton product={product} />
          </div>

          {/* Features */}
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