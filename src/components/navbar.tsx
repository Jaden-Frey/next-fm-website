'use client';

import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar navbar-dark bg-dark py-3 d-flex justify-content-center sticky-top">
      <div className="container d-flex justify-content-center">
        <ul className="navbar-nav d-flex flex-row gap-4 align-items-center flex-wrap justify-content-center">
          {/* Main Navigation */}
          <li className="nav-item">
            <Link href="/" className="nav-link">
              <i className="bi bi-house-door me-2"></i>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/products" className="nav-link">
              <i className="bi bi-grid me-2"></i>
              Products
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/about" className="nav-link">
              <i className="bi bi-info-circle me-2"></i>
              About
            </Link>
          </li>
        
          {/* Divider (Hidden on small screens) */}
          <li className="nav-item d-none d-md-block border-start border-secondary mx-2" style={{height: '30px'}}></li>

          {/* User Actions */}
          <li className="nav-item">
            <Link href="/orders" className="nav-link">
              <i className="bi bi-box-seam me-2"></i>
              Orders
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/wishlist" className="nav-link">
              <i className="bi bi-heart me-2"></i>
              Wishlist
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/cart" className="nav-link d-flex align-items-center">
              <i className="bi bi-cart-fill me-2"></i>
              Cart
              <span className="badge bg-white text-dark ms-2 rounded-pill fw-bold">0</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;