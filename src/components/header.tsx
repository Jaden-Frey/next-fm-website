'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import Navbar from './navbar';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-white border-bottom py-2">
        <div className="container">
          <div className="row align-items-center">
            {/* Brand/Logo */}
            <div className="col-3">
              <Link href="/" className="text-decoration-none d-flex align-items-center">
                <i className="bi bi-shop text-orange fs-4 me-2"></i>
                <span className="fw-bold text-dark fs-5">Jaden Frey's Fresh Meat</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="col-5">
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
            <div className="col-4">
              <div className="d-flex justify-content-end align-items-center gap-3">
                <SignedIn>
                  {/* Wishlist */}
                  <Link 
                    href="/wishlist" 
                    className="text-decoration-none text-dark position-relative"
                    title="Wishlist"
                  >
                    <i className="bi bi-heart fs-5"></i>
                  </Link>

                  {/* Orders */}
                  <Link 
                    href="/orders" 
                    className="text-decoration-none text-dark position-relative"
                    title="My Orders"
                  >
                    <i className="bi bi-bag fs-5"></i>
                  </Link>

                  {/* Cart */}
                  <Link 
                    href="/cart" 
                    className="text-decoration-none text-dark position-relative"
                    title="Shopping Cart"
                  >
                    <i className="bi bi-cart3 fs-5"></i>
                  </Link>

                  {/* Divider between icons and avatar */}
                  <div className="vr" style={{height: '24px'}}></div>

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
                    <button className="btn btn-outline-orange btn-sm me-2">
                      <i className="bi bi-box-arrow-in-right me-1"></i>
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn btn-orange btn-sm">
                      <i className="bi bi-person-plus me-1"></i>
                      Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
              </div>
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