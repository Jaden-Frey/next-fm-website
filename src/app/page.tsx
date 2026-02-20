"use client";
import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [image, setImage] = useState<File>();
  const [uploading, setUploading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  }

  const onSubmit = async () => {
    if (!image) {
      alert("Please select an image to upload");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setUploading(true);
    setRecommendedProducts([]); // Clear previous search results

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setRecommendedProducts(data.products || []);
      setImage(undefined); // Reset input after successful search

    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* Hero Section */}
      <header className="hero-static position-relative">
        <div className="hero-overlay" />
        <div className="container position-relative text-center text-white my-5" style={{ zIndex: 2 }}>
          <span className="badge bg-orange px-3 py-2 mb-3 rounded-pill text-uppercase ls-2">
            Premium Selection
          </span>
          <h1 className="display-2 fw-bolder text-white mb-3">
            Experience the Taste of <br />
            <span className="text-orange">True Quality</span>
          </h1>
          <p className="lead text-white-50 mb-0 fs-4">
            Locally sourced, expertly cut, and delivered fresh to your door.
          </p>
        </div>
      </header>

      {/* Upload & Search Section */}
      <section className="py-5 bg-white position-relative z-2">
        <div className="container py-4">
          <div className="row justify-content-center">
            
            <div className="col-12 text-center mb-4">
              <h2 className="fw-bold text-dark display-6 mb-2">Search for Products</h2>
              <p className="text-muted">Upload an image of what you're craving, and we'll find the best match.</p>
            </div>

            <div className="col-lg-6 col-md-8">
              <div className="card-upload shadow-sm border rounded overflow-hidden">
                <div className="card-header-orange bg-orange text-white p-3 fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-cloud-arrow-up"></i>
                  Upload Image
                </div>

                <div className="p-4 bg-light">
                  <label htmlFor="imageUpload" className="w-100 mb-0" style={{ cursor: "pointer" }}>
                    <div className="upload-dropzone border border-2 border-dashed rounded p-5 text-center bg-white">
                      <i className="bi bi-image dropzone-icon d-block fs-1 text-muted mb-2"></i>
                      <div className="dropzone-text fw-semibold mb-1">
                        {image ? image.name : "Click to browse or drag and drop"}
                      </div>
                      <div className="dropzone-subtext text-muted small">
                        PNG, JPG, WEBP up to 5MB
                      </div>
                    </div>
                  </label>
                  
                  <input 
                    id="imageUpload" 
                    type="file" 
                    className="d-none" 
                    accept="image/*" 
                    onChange={handleChange}
                    disabled={uploading}
                  />

                  <button 
                    className="btn btn-dark w-100 mt-4 py-2 d-flex align-items-center justify-content-center gap-2" 
                    onClick={onSubmit}
                    disabled={uploading || !image}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Analyzing Image...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search"></i>
                        Find Matching Products
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Results Section */}
          {recommendedProducts.length > 0 && (
            <div className="row mt-5 pt-5 border-top">
              <div className="col-12 text-center mb-4">
                <h3 className="fw-bold">We found these matches for you!</h3>
              </div>
              <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
                {recommendedProducts.map((product) => (
                  <div key={product._id || product.id} className="col">
                    <div className="card h-100 shadow-sm border-0 transition-transform hover-lift">
                      <img 
                        src={product.image || "[https://placehold.co/600x400/222/fff?text=No+Image](https://placehold.co/600x400/222/fff?text=No+Image)"} 
                        className="card-img-top" 
                        alt={product.name} 
                        style={{ height: '200px', objectFit: 'cover' }} 
                      />
                      <div className="card-body text-center d-flex flex-column">
                        <h5 className="fw-bold mb-2">{product.name}</h5>
                        <div className="mt-auto">
                          <p className="text-orange fw-bold fs-5 mb-3">R{product.price?.toFixed(2)}</p>
                          <Link href={`/products/${product.id}`} className="btn btn-outline-dark w-100">
                            View Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Categories Banner */}
      <section className="category-banner py-5 bg-dark text-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">Browse by Category</h2>
            <div className="divider-custom mx-auto bg-orange" style={{ width: "50px", height: "3px" }}></div>
            <p className="text-white-50 mt-3">Explore our premium selection</p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {[
              { id: 'beef', name: 'Beef', desc: 'Premium Steaks', color: 'text-danger' },
              { id: 'chicken', name: 'Chicken', desc: 'Free Range', color: 'text-warning' },
              { id: 'pork', name: 'Pork', desc: 'Quality Cuts', color: 'text-info' },
              { id: 'lamb', name: 'Lamb', desc: 'Tender & Juicy', color: 'text-success' }
            ].map((cat) => (
              <div key={cat.id} className="col-6 col-md-3">
                <Link href={`/products?category=${cat.id}`} className="category-card-dark d-block text-decoration-none text-center">
                  <div className="category-icon-wrapper-dark mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center bg-secondary bg-opacity-25" style={{ width: "60px", height: "60px" }}>
                     <i className={`bi bi-circle-fill ${cat.color} fs-3`}></i>
                  </div>
                  <h5 className="fw-bold text-white mb-1">{cat.name}</h5>
                  <p className="text-white-50 small">{cat.desc}</p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}