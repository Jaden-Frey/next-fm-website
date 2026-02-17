'use client';

import Link from 'next/link';
import React from 'react';
import { useCart } from '../context/cartcontext';
import { useUser } from '@clerk/nextjs';

const Navbar = () => {
  const { itemCount, loading: cartLoading } = useCart();
  const { user, isLoaded } = useUser();

  const isAdmin = isLoaded
    ? user?.publicMetadata?.role === "admin"
    : false;

  return (
    <nav className="navbar navbar-dark bg-dark py-3 d-flex justify-content-center sticky-top shadow-sm">
      <div className="container d-flex justify-content-center">
        <ul className="navbar-nav d-flex flex-row gap-4 align-items-center flex-wrap justify-content-center">
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

          <li className="nav-item d-none d-md-block border-start border-secondary mx-2" style={{ height: '30px' }}></li>

          {/* User-only links — hidden for admins */}
          {isLoaded && !isAdmin && (
            <>
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
                  {!cartLoading && itemCount > 0 && (
                    <span className="badge bg-white text-dark ms-2 rounded-pill fw-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </li>
            </>
          )}

          {/* Admin-only link */}
          {isLoaded && isAdmin && (
            <li className="nav-item">
              <Link href="/admin/orders" className="nav-link">
                <i className="bi bi-clipboard-data me-2"></i>
                Order Management
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;