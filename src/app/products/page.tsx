"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AdminProductModal from "../../components/adminproductmodal";

const FALLBACK_IMAGE = "https://placehold.co/600x400/222/fff?text=No+Image";

const CATEGORY_DEFINITIONS = [
  { id: "all",     label: "All Products", color: "#ffffff" },
  { id: "beef",    label: "Beef",         color: "#e05252" },
  { id: "chicken", label: "Chicken",      color: "#f0c040" },
  { id: "pork",    label: "Pork",         color: "#5bbfde" },
  { id: "lamb",    label: "Lamb",         color: "#4caf7a" },
];

interface Product {
  _id?: string;
  id: number;
  name: string;
  price: number;
  cost?: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  onSale: boolean;
  sku?: string;
}

function ViewDetailsButton({ href, isAI }: { href: string; isAI: boolean }) {
  const [hovered, setHovered] = useState(false);

  const base: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "10px 0",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "0.875rem",
    letterSpacing: "0.02em",
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
    transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  };

  const defaultIdle: React.CSSProperties = {
    ...base,
    background: "#ffffff",
    color: "#1e1e1e",
    border: "1.5px solid #1e1e1e",
  };

  const defaultHover: React.CSSProperties = {
    ...base,
    background: "#1e1e1e",
    color: "#ffffff",
    border: "1.5px solid #1e1e1e",
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
  };

  const aiIdle: React.CSSProperties = {
    ...base,
    background: "transparent",
    color: "#1e1e1e",
    border: "1.5px solid rgba(253,126,20,0.70)",
  };

  const aiHover: React.CSSProperties = {
    ...base,
    background: "rgba(253,126,20,0.06)",
    color: "#1e1e1e",
    border: "1.5px solid #fd7e14",
    boxShadow: "0 3px 12px rgba(253,126,20,0.18)",
  };

  const style = isAI
    ? (hovered ? aiHover : aiIdle)
    : (hovered ? defaultHover : defaultIdle);

  return (
    <Link
      href={href}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      View Details
      {isAI && (
        <span style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #fd7e14, #f0c040)",
          display: "block",
        }} />
      )}
    </Link>
  );
}

function ProductsContent() {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";
  const searchParams = useSearchParams();

  const highlightParam = searchParams.get("highlight");
  const aiPrompt = searchParams.get("ai_prompt");

  const highlightedIds = highlightParam ? highlightParam.split(",").map(id => id.trim()) : [];

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    setSelectedCategory(categoryFromUrl || "all");
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const normalized = (Array.isArray(data) ? data : []).map((p: any) => ({
        ...p,
        _id:           p._id,
        id:            Number(p.id),
        price:         Number(p.price),
        cost:          p.cost != null ? Number(p.cost) : undefined,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        image:         p.image && p.image.length > 0 ? p.image : FALLBACK_IMAGE,
        description:   p.description || "",
        onSale:        Boolean(p.onSale),
        category:      p.category ? p.category.toLowerCase().trim() : "other",
      }));
      setProducts(normalized);
    } catch (err) {
      console.error("Failed to load from API:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const getCategoryCount = (catId: string) => {
    if (catId === "all") return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  const handleCreate = async (data: any) => {
    const res = await fetch("/api/products", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) { await fetchProducts(); setIsModalOpen(false); }
    else alert("Failed to create product");
  };

  const handleUpdate = async (data: any) => {
    const payload = { ...data, _id: editingProduct?._id, id: editingProduct?.id };
    const res = await fetch("/api/products", { method: "PUT", body: JSON.stringify(payload) });
    if (res.ok) { await fetchProducts(); setIsModalOpen(false); setEditingProduct(null); }
    else alert("Failed to update product");
  };

  const handleDelete = async (mongoId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/products?id=${mongoId}`, { method: "DELETE" });
    if (res.ok) await fetchProducts();
    else alert("Failed to delete product");
  };

  const handleDeleteCategory = async () => {
    if (!isAdmin) return;
    if (selectedCategory === "all") { alert("Cannot delete 'All Products'. Select a specific category first."); return; }
    if (!confirm(`Delete ALL products in category "${selectedCategory}"? This cannot be undone.`)) return;
    try {
      setDeletingCategory(true);
      const res = await fetch(`/api/products?category=${encodeURIComponent(selectedCategory)}`, { method: "DELETE" });
      if (!res.ok) { const err = await res.json().catch(() => ({ error: "Delete failed" })); throw new Error(err?.error || `HTTP ${res.status}`); }
      await fetchProducts();
      setSelectedCategory("all");
      window.history.pushState(null, "", `?category=all`);
      const result = await res.json();
      alert(`Deleted ${result.deletedCount || 0} products from ${selectedCategory}.`);
    } catch (err: any) {
      console.error("Failed to delete category:", err);
      alert("Failed to delete category: " + (err.message || err));
    } finally {
      setDeletingCategory(false);
    }
  };

  const openAddModal  = () => { setEditingProduct(null); setIsModalOpen(true); };
  const openEditModal = (product: Product, e: React.MouseEvent) => { e.preventDefault(); setEditingProduct(product); setIsModalOpen(true); };
  const onDeleteClick = (product: Product, e: React.MouseEvent) => { e.preventDefault(); if (product._id) handleDelete(product._id); };

  // 1. Filter by Category
  let displayProducts = selectedCategory === "all"
    ? [...products]
    : products.filter((p) => p.category === selectedCategory);

  // 2. Sort AI matches to the top
  if (highlightedIds.length > 0) {
    displayProducts.sort((a, b) => {
      const aIsMatch = highlightedIds.includes(String(a._id)) || highlightedIds.includes(String(a.id));
      const bIsMatch = highlightedIds.includes(String(b._id)) || highlightedIds.includes(String(b.id));
      if (aIsMatch && !bIsMatch) return -1;
      if (!aIsMatch && bIsMatch) return 1;
      return 0;
    });
  }

  const activeCat = CATEGORY_DEFINITIONS.find((c) => c.id === selectedCategory)!;

  if (loading)
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-dark"></div>
      </div>
    );

  return (
    <>
      <header className="hero-header position-relative" style={{ overflow: "hidden" }}>
        <div style={{
          backgroundImage: "url('/images/butchery-bg2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          inset: 0,
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.45) 100%)"
        }} />
        <div className="container position-relative text-center text-white hero-content py-5">
          <p className="hero-eyebrow">Premium Butchery</p>
          <h1 className="hero-title">Our Selections</h1>
          <p className="hero-sub">Hand-selected cuts, delivered fresh to your door</p>
        </div>
      </header>

      <div className="filter-strip-wrapper sticky-top">
        <div className="container">
          <div className="filter-strip">
            <div className="filter-pills">
              {CATEGORY_DEFINITIONS.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); window.history.pushState(null, "", `?category=${cat.id}`); }}
                    className={`filter-pill${isActive ? " filter-pill--active" : ""}`}
                  >
                    <span
                      className="pill-dot"
                      style={{
                        background: cat.color,
                        boxShadow: isActive ? `0 0 8px ${cat.color}99` : "none",
                      }}
                    />
                    <span className="pill-label">{cat.label}</span>
                    <span className={`pill-badge${isActive ? " pill-badge--active" : ""}`}>
                      {getCategoryCount(cat.id)}
                    </span>
                  </button>
                );
              })}
            </div>

            {isAdmin && (
              <button
                className="delete-cat-btn"
                onClick={handleDeleteCategory}
                disabled={deletingCategory || selectedCategory === "all"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                </svg>
                {deletingCategory ? "Deleting…" : "Delete Category"}
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="py-5" style={{ background: "#f4f4f4" }}>
        <div className="container">

          {aiPrompt && highlightedIds.length > 0 && (
            <div
              className="d-flex align-items-center justify-content-between mb-4 shadow-sm"
              style={{ border: '1px solid #fd7e14', backgroundColor: '#fff3e0', borderRadius: '8px', padding: '14px 20px' }}
              role="alert"
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-stars fs-4 me-3" style={{ color: '#fd7e14' }}></i>
                <div>
                  <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '1rem' }}>AI Assistant Recommendations</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                    Showing the best matches for: <strong className="text-dark">"{aiPrompt}"</strong>
                  </p>
                </div>
              </div>
              <button
                className="ai-clear-btn"
                onClick={() => { window.location.href = "/products"; }}
                aria-label="Clear search and show all products"
                title="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
                <span>Clear Search</span>
              </button>
            </div>
          )}

          {aiPrompt && highlightedIds.length === 0 && searchParams.get('nomatch') && (
            <div className="alert alert-secondary d-flex align-items-center mb-4 shadow-sm" role="alert">
              <i className="bi bi-info-circle fs-4 me-3"></i>
              <div>
                <p className="mb-0 text-muted">We couldn't find a perfect match for <strong>"{aiPrompt}"</strong>, but please browse our full selection below!</p>
              </div>
            </div>
          )}

          <p className="results-count mb-4">
            Showing <strong>{displayProducts.length}</strong>{" "}
            {displayProducts.length === 1 ? "product" : "products"}
            {selectedCategory !== "all" && (
              <> in <strong style={{ color: activeCat.color === "#ffffff" ? "#222" : activeCat.color }}>{activeCat.label}</strong></>
            )}
          </p>

          <div className="row row-cols-1 row-cols-md-3 row-cols-xl-4 g-4">

            {isAdmin && (
              <div className="col">
                <div
                  className="card h-100 d-flex align-items-center justify-content-center bg-light text-muted hover-shadow"
                  style={{ minHeight: "350px", cursor: "pointer", border: "2px dashed #ccc" }}
                  onClick={openAddModal}
                >
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-plus-circle mb-3" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                    <h5 className="fw-bold">Add New Product</h5>
                  </div>
                </div>
              </div>
            )}

            {displayProducts.map((product) => {
              const isAIRecommended = highlightedIds.includes(String(product._id)) || highlightedIds.includes(String(product.id));

              let gpClass = "text-danger";
              let gpStyle: React.CSSProperties = {};
              let gpPercent = 0;

              if (product.cost != null && product.price > 0) {
                const gpDecimal = (product.price - product.cost) / product.price;
                gpPercent = Math.round(gpDecimal * 100);
                if (gpDecimal >= 0.50) {
                  gpClass = "text-success";
                } else if (gpDecimal >= 0.20) {
                  gpClass = "";
                  gpStyle = { color: "#d97706" };
                }
              }

              return (
                <div key={product.id} className="col">
                  <div className={`card h-100 shadow-sm hover-lift position-relative overflow-hidden ${isAIRecommended ? 'ai-highlight-card' : 'border-0'}`}>

                    {isAIRecommended && (
                      <span
                        className="position-absolute top-0 start-50 translate-middle-x badge rounded-bottom fw-bold"
                        style={{
                          backgroundColor: '#fd7e14',
                          zIndex: 2,
                          padding: '6px 16px',
                          fontSize: '0.85rem',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        }}
                      >
                        <i className="bi bi-star-fill me-1"></i> Best Match
                      </span>
                    )}

                    {isAdmin && (
                      <div className="position-absolute top-0 end-0 p-2 d-flex gap-2" style={{ zIndex: 10 }}>
                        <button
                          className="btn btn-light btn-sm shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "32px", height: "32px" }}
                          onClick={(e) => openEditModal(product, e)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
                          </svg>
                        </button>
                        <button
                          className="btn btn-danger btn-sm shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "32px", height: "32px" }}
                          onClick={(e) => onDeleteClick(product, e)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {product.onSale && (
                      <div className="badge bg-danger text-white position-absolute top-0 start-0 m-2" style={{ zIndex: 1 }}>SALE</div>
                    )}

                    <Link href={`/products/${product.id}`} className="text-decoration-none">
                      <img
                        src={product.image}
                        className="card-img-top"
                        alt={product.name}
                        style={{ height: "250px", objectFit: "cover" }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE; }}
                      />
                    </Link>

                    <div className="card-body text-center d-flex flex-column">
                      <h5 className="fw-bolder mb-2 text-dark">{product.name}</h5>
                      <div className="mb-3 mt-auto">
                        <span className={`fw-bold ${product.onSale ? "text-danger fs-5" : "fs-5 text-dark"}`}>
                          R{product.price.toFixed(2)}
                        </span>

                        {isAdmin && product.cost != null && (
                          <div className="mt-2 d-flex justify-content-center align-items-center bg-light rounded py-1 px-2 border mx-auto" style={{ maxWidth: "90%" }}>
                            <span className="text-muted text-uppercase me-2" style={{ fontSize: "0.65rem", letterSpacing: "0.5px", fontWeight: 600 }}>Cost</span>
                            <span className="fw-bold text-dark me-3" style={{ fontSize: "0.8rem" }}>R{product.cost.toFixed(2)}</span>
                            <div className="vr me-2 opacity-25" style={{ height: "14px" }}></div>
                            <span className="text-muted text-uppercase me-1" style={{ fontSize: "0.65rem", letterSpacing: "0.5px", fontWeight: 600 }}>GP</span>
                            <span className={`fw-bold ${gpClass}`} style={{ fontSize: "0.8rem", ...gpStyle }}>{gpPercent}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-footer bg-transparent px-3 pb-3" style={{ border: "none" }}>
                      <ViewDetailsButton href={`/products/${product.id}`} isAI={isAIRecommended} />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
        initialData={editingProduct}
      />

      <style jsx>{`
        /* ── Filter Strip ── */
        .filter-strip-wrapper {
          background: #1e1e1e;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 4px 20px rgba(0,0,0,0.35);
          top: 0;
          z-index: 100;
        }
        .filter-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 0;
        }
        .filter-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 100px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.55);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
          line-height: 1;
        }
        .filter-pill:hover {
          border-color: rgba(255,255,255,0.28);
          color: rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.09);
          transform: translateY(-1px);
        }
        .filter-pill--active {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.12);
          color: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .filter-pill--active:hover {
          background: rgba(255,255,255,0.16);
          color: #fff;
          transform: translateY(-1px);
        }
        .pill-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: box-shadow 0.18s ease;
        }
        .pill-label {
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .pill-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 100px;
          font-size: 0.63rem;
          font-weight: 700;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.4);
          transition: background 0.18s, color 0.18s;
        }
        .pill-badge--active {
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.85);
        }
        .delete-cat-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          background: none;
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 7px 13px;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .delete-cat-btn:hover:not(:disabled) {
          color: #e05252;
          border-color: rgba(224,82,82,0.5);
          background: rgba(224,82,82,0.08);
        }
        .delete-cat-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }
        .results-count {
          font-size: 0.84rem;
          color: #999;
        }
        .results-count strong { color: #222; }
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important;
        }
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
        }

        /* ── AI Highlight Card ── */
        .ai-highlight-card {
          border: 2.5px solid rgba(253, 126, 20, 0.80) !important;
          box-shadow:
            0 0 0 4px rgba(253, 126, 20, 0.10),
            0 8px 24px rgba(0, 0, 0, 0.10) !important;
          animation: popIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes popIn {
          0%   { transform: scale(0.96); opacity: 0.6; }
          100% { transform: scale(1);    opacity: 1;   }
        }

        /* ── Clear Search button (theme-matching) ── */
        .ai-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 10px;
          background: linear-gradient(180deg, rgba(253,126,20,0.06), rgba(240,192,64,0.02));
          border: 1px solid rgba(253,126,20,0.20);
          color: #fd7e14;
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.12s ease;
          white-space: nowrap;
        }
        .ai-clear-btn svg { display: block; }
        .ai-clear-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(90deg, rgba(253,126,20,0.12), rgba(240,192,64,0.05));
          color: #000000;
          border-color: rgba(253,126,20,0.95);
          box-shadow: 0 8px 26px rgba(253,126,20,0.12);
        }
        .ai-clear-btn:focus-visible {
          outline: 3px solid rgba(253,126,20,0.18);
          outline-offset: 2px;
        }
        .ai-clear-btn span { line-height: 1; }

      `}</style>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-dark"></div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}