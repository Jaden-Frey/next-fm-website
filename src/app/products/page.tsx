"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; 
import { categories, productsData, Product } from "./productsdata";

const FALLBACK_IMAGE = 'https://placehold.co/600x400/222/fff?text=Coming+Soon';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory("all");
    }
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch("/api/products", { 
          signal: controller.signal,
          cache: 'no-store'
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        
        const normalized = (Array.isArray(data) ? data : []).map((p: any) => ({
          ...p,
          id: Number(p.id),
          price: Number(p.price),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
          image: p.image && p.image.length > 0 ? p.image : FALLBACK_IMAGE,
          onSale: Boolean(p.onSale)
        }));

        setProducts(normalized);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to load from API, using static data:", err);
          setProducts(productsData);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, []);

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-dark mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center" role="alert">
          <h4>Error Loading Products</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* HEADER SECTION */}
      <header className="py-5 bg-dark position-relative" style={{ overflow: 'hidden' }}>
        <div 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            inset: 0,
            opacity: 0.5
          }} 
        />
        <div className="container position-relative text-center text-white my-5">
          <h1 className="display-4 fw-bolder">Shop our Selections</h1>
          <p className="lead fw-normal text-white-50 mb-0">Premium Cuts, Delivered Fresh</p>
        </div>
      </header>

      {/* CATEGORY FILTER */}
      <section className="py-4 bg-light">
        <div className="container text-center">
          <div className="btn-group flex-wrap" role="group" aria-label="Category filter">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                   setSelectedCategory(cat.id);
                   window.history.pushState(null, '', `?category=${cat.id}`);
                }}
                className={`btn m-1 ${
                  selectedCategory === cat.id 
                    ? "btn-dark" 
                    : "btn-outline-dark"
                }`}
                type="button"
              >
                {cat.name}
                {cat.id !== 'all' && (
                  <span className="badge bg-secondary ms-2">
                    {products.filter(p => p.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="py-5">
        <div className="container">
          {/* Show category title */}
          <div className="mb-4">
            <h2 className="h3 fw-bold">
              {selectedCategory === 'all' 
                ? `All Products (${filteredProducts.length})`
                : `${categories.find(c => c.id === selectedCategory)?.name} Products (${filteredProducts.length})`
              }
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No products found in this category.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 row-cols-xl-4 g-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="col">
                  <div className="card h-100 shadow-sm border-0 transition-transform hover-lift">
                    {/* Sale Badge */}
                    {product.onSale && (
                      <div 
                        className="badge bg-danger text-white position-absolute top-0 end-0 m-2"
                        style={{ zIndex: 1 }}
                      >
                        SALE
                      </div>
                    )}
                    
                    {/* Product Image */}
                    <Link href={`/products/${product.id}`} className="text-decoration-none">
                      <img
                        src={product.image}
                        className="card-img-top"
                        alt={product.name}
                        style={{ 
                          height: "250px", 
                          objectFit: "cover",
                          cursor: "pointer"
                        }}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </Link>

                    <div className="card-body text-center d-flex flex-column">
                      <div className="small text-muted mb-1">{product.sku}</div>
                      <h5 className="fw-bolder mb-2">{product.name}</h5>
                      
                      {/* Price */}
                      <div className="mb-3 mt-auto">
                        {product.originalPrice && product.onSale && (
                          <span className="text-muted text-decoration-line-through me-2">
                            R{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className={`fw-bold ${product.onSale ? "text-danger fs-5" : "fs-5"}`}>
                          R{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && product.onSale && (
                          <div className="small text-success mt-1">
                            Save R{(product.originalPrice - product.price).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="card-footer bg-transparent border-top-0 pb-3 text-center">
                      <Link 
                        href={`/products/${product.id}`} 
                        className="btn btn-outline-dark w-100"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </>
  );
}