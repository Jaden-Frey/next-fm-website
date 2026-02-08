'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from './navbar';
import Image from 'next/image';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Compact Top Header Bar */}
      <header className="bg-white border-bottom py-2">
        <div className="container">
          <div className="row align-items-center">
            {/* Brand/Logo */}
            <div className="col-lg-3 col-md-3 col-6">
              <Link href="/" className="text-decoration-none d-flex align-items-center">
                <i className="bi bi-shop text-orange fs-4 me-2"></i>
                <span className="fw-bold text-dark fs-5">Jaden Frey's Fresh Meat</span>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="col-lg-5 col-md-5 d-none d-md-block">
              <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
                <div className="input-group input-group-sm">
                  <input
                    className="form-control border-orange"
                    type="search"
                    placeholder="Search fresh meat products..."
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-orange" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* User Actions */}
            <div className="col-lg-4 col-md-4 col-6">
              <div className="d-flex justify-content-end align-items-center gap-3">
                <SignedIn>
                  {/* Wishlist - Hidden badge until feature implemented */}
                  <Link 
                    href="/wishlist" 
                    className="text-decoration-none text-dark position-relative d-none d-md-inline-block"
                    title="Wishlist"
                  >
                    <i className="bi bi-heart fs-5"></i>
                  </Link>

                  {/* Orders - Hidden badge until feature implemented */}
                  <Link 
                    href="/orders" 
                    className="text-decoration-none text-dark position-relative d-none d-md-inline-block"
                    title="My Orders"
                  >
                    <i className="bi bi-bag fs-5"></i>
                  </Link>

                  {/* Cart - Hidden badge until feature implemented */}
                  <Link 
                    href="/cart" 
                    className="text-decoration-none text-dark position-relative"
                    title="Shopping Cart"
                  >
                    <i className="bi bi-cart3 fs-5"></i>
                  </Link>

                  {/* Divider between icons and avatar */}
                  <div className="vr d-none d-md-block" style={{height: '30px'}}></div>

                  {/* User Profile */}
                  <div className="d-inline-block ms-2">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                    />
                  </div>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn btn-orange btn-sm">
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="row d-md-none mt-2">
            <div className="col-12">
              <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
                <div className="input-group input-group-sm">
                  <input
                    className="form-control border-orange"
                    type="search"
                    placeholder="Search products..."
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-orange" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <Navbar />
    </>
  );
};

export default Header;