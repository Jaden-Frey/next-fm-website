'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- Import useRouter
import Navbar from './navbar';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter(); // <-- Initialize router

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // 1. Run the AI Search Prompt
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      // 2. Extract the Database IDs of the matching products
      const productIds = data.products.map((p: any) => p._id || p.id).join(',');
      
      // 3. Redirect to the Products page, passing the IDs and the prompt in the URL
      if (productIds) {
        router.push(`/products?highlight=${productIds}&ai_prompt=${encodeURIComponent(searchQuery)}`);
      } else {
        // If AI found no matches, still redirect but maybe show a "no matches" state
        router.push(`/products?nomatch=true&ai_prompt=${encodeURIComponent(searchQuery)}`);
      }

    } catch (error) {
      console.error("Error searching:", error);
      // Fallback: just go to the products page normally if the API fails
      router.push('/products');
    } finally {
      setIsSearching(false);
      setSearchQuery(''); // Clear the input field
    }
  };

  return (
    <>
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

            {/* AI Search Bar */}
            <div className="col-5">
              <form className="d-flex" role="search" onSubmit={handleSearch}>
                <div className="input-group input-group-sm">
                  <input
                    className="form-control border-orange"
                    type="search"
                    placeholder="E.g., I need a cheap steak for a braai..."
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="btn btn-orange" type="submit" disabled={isSearching}>
                    {isSearching ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-search"></i>}
                  </button>
                </div>
              </form>
            </div>

            {/* User Actions */}
            <div className="col-4">
              <div className="d-flex justify-content-end align-items-center gap-3">
                <SignedIn>
                  <div className="vr" style={{height: '24px'}}></div>
                  <div className="d-inline-block ms-2">
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                  </div>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn btn-outline-orange btn-sm me-2">
                      <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn btn-orange btn-sm">
                      <i className="bi bi-person-plus me-1"></i> Sign Up
                    </button>
                  </SignUpButton>
                </SignedOut>
              </div>
            </div>

          </div>
        </div>
      </header>
      <Navbar />
    </>
  );
};

export default Header;