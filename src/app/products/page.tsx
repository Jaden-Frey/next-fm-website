// src/app/products/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { categories, Product } from "./productsdata"; 

const FALLBACK_IMAGE = "/images/fallback.png"; 

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchProducts() {
      setLoading(true);
      try {
        // Fetching from your API (which pulls from MongoDB)
        const res = await fetch("/api/products", { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        
        const normalized = (Array.isArray(data) ? data : []).map((p: any) => ({
           ...p,
           id: Number(p.id),
           price: Number(p.price),
           // CRITICAL: If p.image is valid, use it. If null/empty, use fallback.
           image: p.image && p.image.length > 0 ? p.image : FALLBACK_IMAGE
        }));

        setProducts(normalized);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Load error:", err);
          setError("Failed to load products");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, []);

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (error) return <div className="text-center py-5 text-danger">{error}</div>;

  return (
    <>
      {/* HEADER SECTION */}
      <header className="py-5 bg-dark position-relative" style={{ overflow: 'hidden' }}>
         <div style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute", inset: 0, opacity: 0.5
         }} />
         <div className="container position-relative text-center text-white my-5">
            <h1 className="display-4 fw-bolder">Shop our Selections</h1>
            <p className="lead fw-normal text-white-50 mb-0">Premium Cuts, Delivered Fresh</p>
         </div>
      </header>

      {/* CATEGORY FILTER */}
      <section className="py-4 bg-light">
        <div className="container text-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn m-1 ${selectedCategory === cat.id ? "btn-dark" : "btn-outline-dark"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section className="py-5">
        <div className="container">
          <div className="row row-cols-1 row-cols-md-3 row-cols-xl-4 g-4 justify-content-center">
            {filteredProducts.map((product) => (
              <div key={product.id} className="col">
                <div className="card h-100 shadow-sm border-0">
                  {/* Sale Badge */}
                  {product.onSale && (
                    <div className="badge bg-dark position-absolute top-0 end-0 m-2">Sale</div>
                  )}
                  
                  {/* Product Image */}
                  <Link href={`/products/${product.id}`}>
                    <img
                      src={product.image}
                      className="card-img-top"
                      alt={product.name}
                      style={{ height: "250px", objectFit: "cover" }}
                      onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                    />
                  </Link>

                  <div className="card-body text-center">
                    <h5 className="fw-bolder">{product.name}</h5>
                    <div className="mb-3">
                       {product.originalPrice && (
                         <span className="text-muted text-decoration-line-through me-2">
                           R{product.originalPrice}
                         </span>
                       )}
                       <span className={product.onSale ? "text-danger fw-bold" : "fw-bold"}>
                         R{product.price}
                       </span>
                    </div>
                  </div>
                  
                  <div className="card-footer bg-transparent border-top-0 pb-3 text-center">
                     <Link href={`/products/${product.id}`} className="btn btn-outline-dark">
                       View Details
                     </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}