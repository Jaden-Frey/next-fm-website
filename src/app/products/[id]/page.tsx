"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { productsData, Product } from '../productsdata';

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
          <Link href="/products" className="btn btn-dark mt-3">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Get related products from the same category
  const relatedProducts: Product[] = productsData
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(Math.max(1, isNaN(value) ? 1 : value));
  };

  return (
    <>
      {/* Product section */}
      <section className="py-5">
        <div className="container px-4 px-lg-5 my-5">
          <div className="row gx-4 gx-lg-5 align-items-center">
            <div className="col-md-6">
              <img 
                className="card-img-top mb-5 mb-md-0 rounded" 
                src={product.image} 
                alt={product.name}
                style={{width: '100%', height: '500px', objectFit: 'cover'}}
              />
            </div>
            <div className="col-md-6">
              {/* Category Badge */}
              <div className="mb-2">
                <span className="badge bg-dark text-uppercase">
                  {product.category}
                </span>
              </div>
              
              {/* SKU */}
              <div className="small mb-1">SKU: {product.sku}</div>
              
              {/* Product Name */}
              <h1 className="display-5 fw-bolder">{product.name}</h1>
              
              {/* Price */}
              <div className="fs-5 mb-4 mt-3">
                {product.originalPrice && (
                  <>
                    <span className="text-decoration-line-through text-muted">
                      R{product.originalPrice.toFixed(2)}
                    </span>
                    {' '}
                  </>
                )}
                <span className={product.originalPrice ? 'text-danger fw-bold fs-3' : 'fw-bold fs-3'}>
                  R{product.price.toFixed(2)}
                </span>
                {product.onSale && product.originalPrice && (
                  <span className="badge bg-danger ms-2">
                    SAVE R{(product.originalPrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className="lead">
                {product.description}
              </p>
              
              {/* Quantity and Add to Cart */}
              <div className="d-flex align-items-center mb-4">
                <div className="me-3">
                  <label htmlFor="inputQuantity" className="form-label mb-1 small">Quantity</label>
                  <input 
                    className="form-control text-center" 
                    id="inputQuantity" 
                    type="number" 
                    value={quantity}
                    onChange={handleQuantityChange}
                    min={1}
                    style={{width: '80px'}} 
                  />
                </div>
                <div className="mt-4">
                  <button className="btn btn-dark btn-lg" type="button">
                    <i className="bi-cart-fill me-2"></i>
                    Add to cart - R{(product.price * quantity).toFixed(2)}
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">Product Features:</h6>
                <ul className="mb-0 small">
                  <li>Premium quality meat</li>
                  <li>Delivered fresh</li>
                  <li>Vacuum sealed for freshness</li>
                  <li>Sourced from trusted suppliers</li>
                </ul>
              </div>

              {/* Back to Products */}
              <div className="mt-4">
                <Link href="/products" className="btn btn-outline-dark">
                  <i className="bi-arrow-left me-2"></i>
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related items section */}
      {relatedProducts.length > 0 && (
        <section className="py-5 bg-light">
          <div className="container px-4 px-lg-5 mt-5">
            <h2 className="fw-bolder mb-4">More {product.category} products</h2>
            <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
              
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="col mb-5">
                  <div className="card h-100">
                    {relatedProduct.onSale && (
                      <div className="badge bg-dark text-white position-absolute" style={{top: '0.5rem', right: '0.5rem'}}>
                        Sale
                      </div>
                    )}
                    
                    <Link href={`/products/${relatedProduct.id}`}>
                      <img 
                        className="card-img-top" 
                        src={relatedProduct.image} 
                        alt={relatedProduct.name}
                        style={{height: '200px', objectFit: 'cover', cursor: 'pointer'}}
                      />
                    </Link>
                    
                    <div className="card-body p-4">
                      <div className="text-center">
                        <h5 className="fw-bolder">{relatedProduct.name}</h5>
                        
                        <div className="mt-2">
                          {relatedProduct.originalPrice && (
                            <span className="text-muted text-decoration-line-through">
                              R{relatedProduct.originalPrice.toFixed(2)}
                            </span>
                          )}
                          {' '}
                          <span className={relatedProduct.originalPrice ? 'text-danger' : ''}>
                            R{relatedProduct.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                      <div className="text-center">
                        <Link 
                          href={`/products/${relatedProduct.id}`}
                          className="btn btn-outline-dark mt-auto"
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