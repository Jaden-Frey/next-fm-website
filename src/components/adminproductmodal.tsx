"use client";
import React, { useState, useEffect, useRef } from "react";

interface ProductData {
  _id?: string;
  name: string;
  price: number;
  cost?: number;
  description: string;
  category: string;
  image: string;
  onSale?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductData) => Promise<void>;
  initialData?: ProductData | null;
}

export default function AdminProductModal({ isOpen, onClose, onSubmit, initialData }: ModalProps) {
  const [formData, setFormData] = useState<ProductData>({
    name: "", price: 0, cost: undefined, description: "", category: "beef", image: "", onSale: false,
  });

  const [loading,   setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData, category: initialData.category.toLowerCase() });
      } else {
        setFormData({ name: "", price: 0, cost: undefined, description: "", category: "beef", image: "", onSale: false });
      }
      setError(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File is too large (Max 5MB)"); return; }
    setUploading(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: data });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "Upload failed"); }
      const result = await res.json();
      if (result.success && result.cloudinaryUrl) {
        setFormData(prev => ({ ...prev, image: result.cloudinaryUrl }));
      } else {
        throw new Error("Invalid response from upload server");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!formData.image) { setError("Please upload an image before saving."); setLoading(false); return; }
    try {
      await onSubmit({ ...formData, category: formData.category.toLowerCase().trim() });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}></div>
      <div className="modal show d-block fade" style={{ zIndex: 1050 }} tabIndex={-1}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg overflow-hidden rounded-4">

            <div className="modal-header bg-white border-bottom-0 p-4 pb-0">
              <div>
                <h4 className="modal-title fw-bolder text-dark mb-1">
                  {initialData ? "Edit Product" : "Create New Product"}
                </h4>
                <p className="text-muted small mb-0">Fill in the details below to update your catalog.</p>
              </div>
              <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                    <div>{error}</div>
                  </div>
                )}

                <div className="row g-4">
                  {/* LEFT: Image upload (unchanged) */}
                  <div className="col-lg-5">
                    <label className="form-label fw-bold small text-uppercase text-secondary mb-2">Product Image</label>
                    <div
                      className={`ratio ratio-1x1 rounded-4 d-flex align-items-center justify-content-center overflow-hidden position-relative ${!formData.image ? 'bg-light border-2 border-dashed' : 'bg-white border'}`}
                      style={{ cursor: loading ? 'not-allowed' : 'pointer', borderStyle: formData.image ? 'solid' : 'dashed' }}
                      onClick={() => !uploading && !loading && fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <div className="text-center">
                          <div className="spinner-border text-primary mb-2" role="status"></div>
                          <div className="small text-muted fw-bold">Uploading...</div>
                        </div>
                      ) : formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-100 h-100 object-fit-cover" />
                          <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white text-center py-2 small opacity-0 hover-opacity-100 transition-opacity">
                            Click to Change
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 text-muted">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-cloud-arrow-up mb-3 text-primary opacity-50" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z"/>
                            <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.692 14.608 13.5 12.636 13.5H10.97V11h1.666C14.391 11 15.5 9.692 15.5 8.273c0-1.285-.86-2.335-2.078-2.583-.346-.07-.625-.333-.701-.673a4.525 4.525 0 0 0-4.72-3.774 4.524 4.524 0 0 0-3.927 2.446c-.156.326-.48.54-.836.57C2.043 4.397 1 5.679 1 7.273 1 8.98 2.391 10.5 4.104 10.5H5v2.5h-.896C2.102 13 0 10.998 0 8.773c0-2.06 1.437-3.864 3.406-4.431z"/>
                          </svg>
                          <div className="fw-bold text-dark">Click to Upload</div>
                          <div className="small mt-1">Max size: 5MB</div>
                        </div>
                      )}
                      <input type="file" accept="image/*" ref={fileInputRef} className="d-none" onChange={handleImageUpload} disabled={loading} />
                    </div>
                  </div>

                  {/* RIGHT: Details */}
                  <div className="col-lg-7">
                    <div className="row g-3">

                      <div className="col-12">
                        <label className="form-label fw-bold small text-uppercase text-secondary">Product Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16"><path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z"/><path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1z"/></svg>
                          </span>
                          <input type="text" className="form-control border-start-0 ps-0" placeholder="e.g. Ribeye Steak" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold small text-uppercase text-secondary">Selling Price</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 fw-bold text-dark">R</span>
                          <input type="number" className="form-control border-start-0 ps-1" placeholder="0.00" min="0" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold small text-uppercase text-secondary">
                          Cost Price
                          <span className="ms-1 text-muted fw-normal" style={{ fontSize: '0.7rem' }}>(internal)</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 fw-bold text-muted">R</span>
                          <input
                            type="number"
                            className="form-control border-start-0 ps-1"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={formData.cost ?? ''}
                            onChange={e => setFormData({ ...formData, cost: e.target.value === '' ? undefined : Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-bold small text-uppercase text-secondary">Category</label>
                        <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                          <option value="beef">Beef</option>
                          <option value="pork">Pork</option>
                          <option value="chicken">Chicken</option>
                          <option value="lamb">Lamb</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-bold small text-uppercase text-secondary">Description</label>
                        <textarea className="form-control" rows={3} placeholder="Describe the cut, origin, or flavor profile..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                      </div>

                      <div className="col-12 mt-2">
                        <div className="form-check form-switch p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                          <label className="form-check-label fw-bold mb-0 cursor-pointer" htmlFor="saleCheck">
                            Mark as "On Sale"
                            <span className="d-block small text-muted fw-normal">Displays a red badge on the product card.</span>
                          </label>
                          <input className="form-check-input ms-2" style={{ width: '3em', height: '1.5em' }} type="checkbox" id="saleCheck" checked={formData.onSale} onChange={e => setFormData({ ...formData, onSale: e.target.checked })} />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-white border-top-0 p-4">
                <button type="button" className="btn btn-light px-4 rounded-pill fw-bold" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-dark px-5 rounded-pill shadow fw-bold d-flex align-items-center gap-2" disabled={loading || uploading}>
                  {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                  {initialData ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hover-opacity-100:hover { opacity: 1 !important; }
        .transition-opacity { transition: opacity 0.2s ease-in-out; }
        .cursor-pointer { cursor: pointer; }
        .border-dashed { border-style: dashed !important; }
      `}</style>
    </>
  );
}