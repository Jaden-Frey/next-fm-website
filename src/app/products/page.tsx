"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AdminProductModal from "../../components/adminproductmodal";

const FALLBACK_IMAGE = "https://placehold.co/600x400/222/fff?text=No+Image";

const CATEGORY_DEFINITIONS = [
  { id: "all",     name: "All Products" },
  { id: "beef",    name: "Beef"         },
  { id: "pork",    name: "Pork"         },
  { id: "chicken", name: "Chicken"      },
  { id: "lamb",    name: "Lamb"         },
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

  const openAddModal = () => { setEditingProduct(null); setIsModalOpen(true); };

  const openEditModal = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const onDeleteClick = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    if (product._id) handleDelete(product._id);
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  if (loading)
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-dark"></div>
      </div>
    );

  return (
    <>
      <header className="py-5 bg-dark position-relative" style={{ overflow: "hidden" }}>
        <div style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center", position: "absolute", inset: 0, opacity: 0.5 }} />
        <div className="container position-relative text-center text-white my-5">
          <h1 className="display-4 fw-bolder">Shop our Selections</h1>
          <p className="lead fw-normal text-white-50 mb-0">Premium Cuts, Delivered Fresh</p>
        </div>
      </header>

      <section className="py-4 bg-light sticky-top" style={{ top: 0, zIndex: 100 }}>
        <div className="container d-flex align-items-center justify-content-between">
          <div className="btn-group flex-wrap shadow-sm rounded-pill overflow-hidden bg-white">
            {CATEGORY_DEFINITIONS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); window.history.pushState(null, "", `?category=${cat.id}`); }}
                className={`btn px-4 py-2 border-0 fw-bold ${selectedCategory === cat.id ? "btn-dark" : "btn-light bg-white text-muted"}`}
              >
                {cat.name}
                <span className={`badge ms-2 rounded-pill ${selectedCategory === cat.id ? "bg-white text-dark" : "bg-light text-dark border"}`}>
                  {getCategoryCount(cat.id)}
                </span>
              </button>
            ))}
          </div>
          {isAdmin && (
            <button className="btn btn-outline-danger" onClick={handleDeleteCategory} disabled={deletingCategory || selectedCategory === "all"}>
              {deletingCategory ? "Deleting..." : "Delete Category"}
            </button>
          )}
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row row-cols-1 row-cols-md-3 row-cols-xl-4 g-4">
            {isAdmin && (
              <div className="col">
                <div
                  className="card h-100 border-2 border-secondary border-dashed d-flex align-items-center justify-content-center bg-light text-muted hover-shadow"
                  style={{ minHeight: "350px", cursor: "pointer", borderStyle: "dashed" }}
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

            {filteredProducts.map((product) => {
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
                  <div className="card h-100 shadow-sm border-0 transition-transform hover-lift position-relative overflow-hidden">
                    {isAdmin && (
                      <div className="position-absolute top-0 end-0 p-2 d-flex gap-2" style={{ zIndex: 10 }}>
                        <button
                          className="btn btn-light btn-sm shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "32px", height: "32px" }}
                          onClick={(e) => openEditModal(product, e)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
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

                    {!isAdmin && product.onSale && (
                      <div className="badge bg-danger text-white position-absolute top-0 start-0 m-2" style={{ zIndex: 1 }}>SALE</div>
                    )}
                    {isAdmin && product.onSale && (
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
                          <div className="mt-2 d-flex justify-content-center align-items-center bg-light rounded py-1 px-2 border mx-auto" style={{maxWidth: '90%'}}>
                              <span className="text-muted text-uppercase me-2" style={{fontSize: '0.65rem', letterSpacing: '0.5px', fontWeight: 600}}>Cost</span>
                              <span className="fw-bold text-dark me-3" style={{fontSize: '0.8rem'}}>R{product.cost.toFixed(2)}</span>
                              
                              <div className="vr me-2 opacity-25" style={{height: '14px'}}></div>
                              
                              <span className="text-muted text-uppercase me-1" style={{fontSize: '0.65rem', letterSpacing: '0.5px', fontWeight: 600}}>GP</span>
                              <span className={`fw-bold ${gpClass}`} style={{fontSize: '0.8rem', ...gpStyle}}>
                                  {gpPercent}%
                              </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card-footer bg-transparent border-top-0 pb-3 text-center">
                      <Link href={`/products/${product.id}`} className="btn btn-outline-dark w-100">View Details</Link>
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
        .hover-lift { transition: transform 0.2s ease-in-out; }
        .hover-lift:hover { transform: translateY(-5px); }
        .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important; }
        .border-dashed { border-style: dashed !important; }
      `}</style>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-dark"></div></div>}>
      <ProductsContent />
    </Suspense>
  );
}