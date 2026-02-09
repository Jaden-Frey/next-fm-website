'use client';

import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar navbar-dark bg-dark py-2 d-flex justify-content-center">
      <div className="container d-flex justify-content-center">
        <ul className="navbar-nav d-flex flex-row gap-3 align-items-center">
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
          <li className="nav-item">
            <Link href="/contact" className="nav-link">
              <i className="bi bi-envelope me-2"></i>
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;