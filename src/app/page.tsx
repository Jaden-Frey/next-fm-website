"use client";
import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [image, setImage] = useState<File>();
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.files) {
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

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      console.log("Upload success:", data);
      alert("Upload successful!");
      setImage(undefined);

    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {/* 1. Static Hero Section */}
      <section className="hero-static position-relative">
        <div className="hero-overlay"></div>
        <div className="container h-100">
          <div className="row h-100 align-items-center justify-content-center text-center">
            <div className="col-lg-8 position-relative z-2 hero-content">
              <span className="badge bg-orange px-3 py-2 mb-3 rounded-pill text-uppercase ls-2">
                Premium Selection
              </span>
              <h1 className="display-2 fw-bolder text-white mb-3">
                Experience the Taste of <br/>
                <span className="text-orange">True Quality</span>
              </h1>
              <p className="lead text-white-50 mb-5 fs-4">
                Locally sourced, expertly cut, and delivered fresh to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Upload Section (UPDATED: Clean White Card Design) */}
      <section className="py-5 bg-white position-relative z-2">
        <div className="container py-4">
          <div className="row justify-content-center">
            
            {/* Section Title */}
            <div className="col-12 text-center mb-4">
              <h2 className="fw-bold text-dark display-6 mb-2">Search for Products</h2>
              <p className="text-muted">Upload an image here</p>
            </div>

            {/* Upload Card */}
            <div className="col-lg-6 col-md-8">
              <div className="card-upload">
                {/* Orange Header */}
                <div className="card-header-orange">
                  <i className="bi bi-cloud-arrow-up"></i>
                  Upload Image
                </div>

                <div className="p-4">
                  {/* Dashed Input Area */}
                  <label htmlFor="imageUpload" className="w-100 mb-0 cursor-pointer">
                    <div className="upload-dropzone">
                      <i className="bi bi-image dropzone-icon d-block"></i>
                      <div className="dropzone-text">
                        {image ? image.name : "Click to browse or drag and drop"}
                      </div>
                      <div className="dropzone-subtext">
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

                  {/* Action Button */}
                  <button 
                    className="btn-upload-action" 
                    onClick={onSubmit}
                    disabled={uploading || !image}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload"></i>
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 3. Browse Categories Banner */}
      <section className="category-banner py-5 bg-dark text-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">Browse by Category</h2>
            <div className="divider-custom mx-auto bg-orange"></div>
            <p className="text-white-50 mt-3">Explore our premium selection</p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {/* Beef */}
            <div className="col-6 col-md-3">
              <Link href="/products/categories/beef" className="category-card-dark d-block text-decoration-none text-center">
                <div className="category-icon-wrapper-dark mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center">
                   <i className="bi bi-circle-fill text-danger fs-3"></i>
                </div>
                <h5 className="fw-bold text-white mb-1">Beef</h5>
                <p className="text-white-50 small">Premium Steaks</p>
              </Link>
            </div>

            {/* Chicken */}
            <div className="col-6 col-md-3">
              <Link href="/products/categories/chicken" className="category-card-dark d-block text-decoration-none text-center">
                <div className="category-icon-wrapper-dark mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center">
                   <i className="bi bi-circle-fill text-warning fs-3"></i>
                </div>
                <h5 className="fw-bold text-white mb-1">Chicken</h5>
                <p className="text-white-50 small">Free Range</p>
              </Link>
            </div>

            {/* Pork */}
            <div className="col-6 col-md-3">
              <Link href="/products/categories/pork" className="category-card-dark d-block text-decoration-none text-center">
                <div className="category-icon-wrapper-dark mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center">
                   <i className="bi bi-circle-fill text-info fs-3"></i>
                </div>
                <h5 className="fw-bold text-white mb-1">Pork</h5>
                <p className="text-white-50 small">Quality Cuts</p>
              </Link>
            </div>

            {/* Lamb */}
            <div className="col-6 col-md-3">
              <Link href="/products/categories/lamb" className="category-card-dark d-block text-decoration-none text-center">
                <div className="category-icon-wrapper-dark mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center">
                   <i className="bi bi-circle-fill text-success fs-3"></i>
                </div>
                <h5 className="fw-bold text-white mb-1">Lamb</h5>
                <p className="text-white-50 small">Tender & Juicy</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}