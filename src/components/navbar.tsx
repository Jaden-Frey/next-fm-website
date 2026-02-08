'use client';

import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-0">
      <div className="container">
        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            {/* Home */}
            <li className="nav-item">
              <Link href="/" className="nav-link">
                <i className="bi bi-house-door me-1"></i>
                Home
              </Link>
            </li>

            {/* Products Dropdown */}
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle bg-transparent border-0"
                id="productsDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-grid me-1"></i>
                Products
              </button>
              <ul className="dropdown-menu" aria-labelledby="productsDropdown">
                <li>
                  <Link href="/products" className="dropdown-item">
                    <i className="bi bi-list-ul me-2 text-orange"></i>
                    All Products
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <h6 className="dropdown-header text-orange">Categories</h6>
                </li>
                <li>
                  <Link href="/products/categories/beef" className="dropdown-item">
                    <i className="bi bi-circle-fill text-orange me-2" style={{fontSize: '0.5rem'}}></i>
                    Beef
                  </Link>
                </li>
                <li>
                  <Link href="/products/categories/chicken" className="dropdown-item">
                    <i className="bi bi-circle-fill text-orange me-2" style={{fontSize: '0.5rem'}}></i>
                    Chicken
                  </Link>
                </li>
                <li>
                  <Link href="/products/categories/pork" className="dropdown-item">
                    <i className="bi bi-circle-fill text-orange me-2" style={{fontSize: '0.5rem'}}></i>
                    Pork
                  </Link>
                </li>
                <li>
                  <Link href="/products/categories/lamb" className="dropdown-item">
                    <i className="bi bi-circle-fill text-orange me-2" style={{fontSize: '0.5rem'}}></i>
                    Lamb
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link href="/products/new" className="dropdown-item">
                    <i className="bi bi-star me-2 text-orange"></i>
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/products/specials" className="dropdown-item">
                    <i className="bi bi-tag me-2 text-orange"></i>
                    Special Offers
                  </Link>
                </li>
              </ul>
            </li>

            {/* About */}
            <li className="nav-item">
              <Link href="/about" className="nav-link">
                <i className="bi bi-info-circle me-1"></i>
                About
              </Link>
            </li>

            {/* Contact */}
            <li className="nav-item">
              <Link href="/contact" className="nav-link">
                <i className="bi bi-envelope me-1"></i>
                Contact
              </Link>
            </li>

            {/* Reports Dropdown */}
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle bg-transparent border-0"
                id="reportsDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-file-earmark-bar-graph me-1"></i>
                Reports
              </button>
              <ul className="dropdown-menu" aria-labelledby="reportsDropdown">
                <li>
                  <Link href="/reports/financial" className="dropdown-item">
                    <i className="bi bi-currency-dollar me-2 text-orange"></i>
                    Financial Report
                  </Link>
                </li>
                <li>
                  <Link href="/reports/products" className="dropdown-item">
                    <i className="bi bi-box-seam me-2 text-orange"></i>
                    Product Report
                  </Link>
                </li>
                <li>
                  <Link href="/reports/customers" className="dropdown-item">
                    <i className="bi bi-people me-2 text-orange"></i>
                    Customer Report
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;