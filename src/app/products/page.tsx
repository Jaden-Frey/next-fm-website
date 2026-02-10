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
    const signal = controller.signal;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/products", { signal });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status} — ${txt || res.statusText}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Malformed response: expected an array of products.");
        }

        // Normalize products: ensure numeric fields and valid image URLs
        const normalized: Product[] = data.map((p: any) => {
          return {
            id: typeof p.id === "number" ? p.id : Number(p.id ?? p._id ?? 0),
            category: p.category ?? "uncategorized",
            name: p.name ?? "Unnamed",
            sku: p.sku ?? String(p.id ?? p._id ?? ""),
            price: typeof p.price === "number" ? p.price : Number(p.price ?? 0),
            originalPrice:
              typeof p.originalPrice === "number"
                ? p.originalPrice
                : p.originalPrice != null
                ? Number(p.originalPrice)
                : undefined,
            onSale: !!p.onSale,
            image: p.image ? String(p.image) : FALLBACK_IMAGE,
            description: p.description ?? "",
          } as Product;
        });

        setProducts(normalized);
      } catch (err: any) {
        if (err.name === "AbortError") {
          // request was cancelled — ignore
          return;
        }
        console.error("Error loading products:", err);
        setError(err.message ?? "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredProducts: Product[] =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Error loading products: {error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header
        className="py-5 bg-dark"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        ></div>

        <div className="container px-4 px-lg-5 my-5 position-relative">
          <div className="text-center text-white">
            <h1 className="display-4 fw-bolder">Shop our Selections</h1>
            <p className="lead fw-normal text-white-50 mb-0">Premium Cuts, Delivered Fresh</p>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <section className="py-4 bg-light">
        <div className="container px-4 px-lg-5">
          <div className="d-flex justify-content-center flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`btn ${selectedCategory === category.id ? "btn-dark" : "btn-outline-dark"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-5">
        <div className="container px-4 px-lg-5 mt-5">
          <div className="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
            {filteredProducts.map((product) => (
              <div key={product.id ?? product.sku} className="col mb-5">
                <div className="card h-100 border-0 shadow-sm position-relative">
                  {/* Sale Badge */}
                  {product.onSale && (
                    <div className="badge bg-dark text-white position-absolute" style={{ top: "0.5rem", right: "0.5rem" }}>
                      Sale
                    </div>
                  )}

                  {/* Product Image */}
                  <Link href={`/products/${product.id}`}>
                    {/* use img for now; switch to next/image if you add domains in next.config.js */}
                    <img
                      className="card-img-top"
                      src={product.image || FALLBACK_IMAGE}
                      alt={product.name}
                      style={{ height: "250px", objectFit: "cover", cursor: "pointer" }}
                      onError={(e) => {
                        // fallback if remote image fails
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="card-body p-4">
                    <div className="text-center">
                      <h5 className="fw-bolder">{product.name}</h5>
                      <div className="mt-2">
                        {product.originalPrice ? (
                          <span className="text-muted text-decoration-line-through me-2">R{product.originalPrice.toFixed(2)}</span>
                        ) : null}
                        <span className={product.originalPrice ? "text-danger fw-bold" : "fw-bold"}>R{product.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer p-4 pt-0 border-top-0 bg-transparent">
                    <div className="text-center">
                      <Link href={`/products/${product.id}`} className="btn btn-outline-dark mt-auto">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-12 text-center py-5">
                <p className="text-muted">No products found for this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
