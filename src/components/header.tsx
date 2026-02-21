'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './navbar';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null); 
  const router = useRouter();

  const { user, isLoaded } = useUser();
  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null); 

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json().catch(() => ({ error: 'Search failed' }));

      if (!response.ok) {
        setSearchError(data.error || `Search failed (${response.status}). Please try again.`);
        return;
      }

      const productIds = data.products
        .map((p: any) => p._id || p.id)
        .filter(Boolean)
        .join(',');

      if (productIds) {
        router.push(
          `/products?highlight=${productIds}&ai_prompt=${encodeURIComponent(searchQuery)}`
        );
      } else {
        router.push(
          `/products?nomatch=true&ai_prompt=${encodeURIComponent(searchQuery)}`
        );
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="bg-white border-bottom py-2">
        <div className="container">
          <div className="row align-items-center">
            <div className={isAdmin ? 'col-8' : 'col-3'}>
              <Link href="/" className="text-decoration-none d-flex align-items-center">
                <i className="bi bi-shop text-orange fs-4 me-2"></i>
                <span className="fw-bold text-dark fs-5">Jaden Frey's Fresh Meat</span>
              </Link>
            </div>

            {!isAdmin && (
              <div className="col-5">
                <form className="d-flex flex-column" role="search" onSubmit={handleSearch}>
                  <div className="input-group input-group-sm">
                    <input
                      className="form-control border-orange"
                      type="search"
                      placeholder="E.g., I need a cheap steak for a braai..."
                      aria-label="Search products"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isSearching}
                    />
                    <button
                      className="btn btn-orange"
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      aria-label="Search"
                    >
                      {isSearching
                        ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        : <i className="bi bi-search"></i>
                      }
                    </button>
                  </div>

                  {searchError && (
                    <small className="text-danger mt-1">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {searchError}
                    </small>
                  )}
                </form>
              </div>
            )}

            <div className={isAdmin ? 'col-4' : 'col-4'}>
              <div className="d-flex justify-content-end align-items-center gap-3">
                <SignedIn>
                  <div className="vr" style={{ height: '24px' }}></div>
                  <div className="d-inline-block ms-2">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{ elements: { avatarBox: 'w-8 h-8' } }}
                    />
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