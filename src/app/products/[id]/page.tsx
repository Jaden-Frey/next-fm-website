"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { productsData, Product } from '../productsdata';

const FALLBACK_IMAGE = 'https://placehold.co/600x400/222/fff?text=Coming+Soon';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const product: Product | undefined = productsData.find(p => p.id === productId);
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>Product not found</h2>
          <p className="text-muted mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/products" className="btn btn-dark mt-3">
            <i className="bi-arrow-left me-2"></i>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Get related products
  const relatedProducts: Product[] = productsData
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(Math.max(1, isNaN(value) ? 1 : value));
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const totalPrice = product.price * quantity;
  const totalSavings = product.originalPrice 
    ? (product.originalPrice - product.price) * quantity 
    : 0;

  return (
    <>
      {/* Product section */}
      <section className="py-5">
        <div className="container px-4 px-lg-5 my-5">
          <div className="row gx-4 gx-lg-5 align-items-center">
            {/* Product Image */}
            <div className="col-md-6">
              <img 
                className="card-img-top mb-5 mb-md-0 rounded shadow-lg" 
                src={product.image} 
                alt={product.name}
                style={{
                  width: '100%', 
                  height: '500px', 
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {/* Product Details */}
            <div className="col-md-6">
              {/* Category Badge */}
              <div className="mb-3">
                <span className="badge bg-dark text-uppercase px-3 py-2">
                  {product.category}
                </span>
                {product.onSale && (
                  <span className="badge bg-danger ms-2 px-3 py-2">
                    ON SALE
                  </span>
                )}
              </div>
              
              {/* SKU */}
              <div className="small text-muted mb-2">SKU: {product.sku}</div>
              
              {/* Product Name */}
              <h1 className="display-5 fw-bolder mb-3">{product.name}</h1>
              
              {/* Price */}
              <div className="mb-4">
                {product.originalPrice && product.onSale && (
                  <div className="mb-2">
                    <span className="text-decoration-line-through text-muted fs-4">
                      R{product.originalPrice.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="d-flex align-items-baseline">
                  <span className={`fw-bold ${product.onSale ? 'text-danger' : ''}`} style={{ fontSize: '2.5rem' }}>
                    R{product.price.toFixed(2)}
                  </span>
                  <span className="text-muted ms-2">/ {product.grammage}</span>
                </div>
                {product.originalPrice && product.onSale && (
                  <div className="alert alert-success mt-2 py-2">
                    <strong>Save R{(product.originalPrice - product.price).toFixed(2)}</strong> on each unit!
                  </div>
                )}
              </div>
              
              {/* Description */}
              <p className="lead mb-4">
                {product.description}
              </p>
              
              <hr className="my-4" />
              
              {/* Quantity and Add to Cart */}
              <div className="mb-4">
                <label htmlFor="inputQuantity" className="form-label fw-bold">Quantity</label>
                <div className="d-flex align-items-center mb-3">
                  <div className="input-group" style={{maxWidth: '200px'}}>
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={decrementQuantity}
                    >
                      <i className="bi-dash"></i>
                    </button>
                    <input 
                      className="form-control text-center" 
                      id="inputQuantity" 
                      type="number" 
                      value={quantity}
                      onChange={handleQuantityChange}
                      min={1}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button"
                      onClick={incrementQuantity}
                    >
                      <i className="bi-plus"></i>
                    </button>
                  </div>
                </div>

                {/* Total Price Display */}
                {quantity > 1 && (
                  <div className="alert alert-info py-2 mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Subtotal ({quantity} x {product.grammage}):</span>
                      <strong>R{totalPrice.toFixed(2)}</strong>
                    </div>
                    {totalSavings > 0 && (
                      <div className="d-flex justify-content-between text-success">
                        <span>Total Savings:</span>
                        <strong>R{totalSavings.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>
                )}

                <button className="btn btn-dark btn-lg w-100 mb-3" type="button">
                  <i className="bi-cart-fill me-2"></i>
                  Add to cart - R{totalPrice.toFixed(2)}
                </button>

                <div className="d-grid gap-2">
                  <button className="btn btn-outline-dark" type="button">
                    <i className="bi-heart me-2"></i>
                    Add to Wishlist
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="card bg-light border-0 mb-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Product Features:</h6>
                  <ul className="mb-0">
                    <li className="mb-2">Premium quality {product.category}</li>
                    <li className="mb-2">Weight: {product.grammage}</li>
                    <li className="mb-2">Delivered fresh and vacuum sealed</li>
                    <li className="mb-2">Sourced from trusted local suppliers</li>
                    <li className="mb-2">100% quality guarantee</li>
                  </ul>
                </div>
              </div>

              {/* Back to Products */}
              <Link href="/products" className="btn btn-outline-dark">
                <i className="bi-arrow-left me-2"></i>
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related items section */}
      {relatedProducts.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container px-4 px-lg-5">
            <h2 className="fw-bolder mb-4">
              More {product.category.charAt(0).toUpperCase() + product.category.slice(1)} Products
            </h2>
            <div className="row gx-4 gx-lg-5 row-cols-1 row-cols-md-2 row-cols-lg-4">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="col mb-5">
                  <div className="card h-100 shadow-sm border-0">
                    {relatedProduct.onSale && (
                      <div 
                        className="badge bg-danger text-white position-absolute" 
                        style={{top: '0.5rem', right: '0.5rem', zIndex: 1}}
                      >
                        SALE
                      </div>
                    )}
                    
                    <Link href={`/products/${relatedProduct.id}`}>
                      <img 
                        className="card-img-top" 
                        src={relatedProduct.image} 
                        alt={relatedProduct.name}
                        style={{
                          height: '200px', 
                          objectFit: 'cover', 
                          cursor: 'pointer'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </Link>
                    
                    <div className="card-body p-4 text-center">
                      <div className="small text-muted">{relatedProduct.sku}</div>
                      <h5 className="fw-bolder mb-1">{relatedProduct.name}</h5>
                      <div className="text-muted small mb-2">{relatedProduct.grammage}</div>
                      
                      <div className="mt-2">
                        {relatedProduct.originalPrice && relatedProduct.onSale && (
                          <>
                            <span className="text-muted text-decoration-line-through me-2">
                              R{relatedProduct.originalPrice.toFixed(2)}
                            </span>
                            <br />
                          </>
                        )}
                        <span className={`fw-bold ${relatedProduct.onSale ? 'text-danger fs-5' : 'fs-5'}`}>
                          R{relatedProduct.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                      <div className="text-center">
                        <Link 
                          href={`/products/${relatedProduct.id}`}
                          className="btn btn-outline-dark w-100"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}