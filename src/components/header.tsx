'use client'; 
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Navbar from './navbar'; 
import Link from 'next/link';

const Header = () => {
  return (
    // Applied Theme Classes: navbar-dark, bg-dark, fixed-top
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
      <div className="container px-4">
        {/* Brand */}
        <Link href="/" className="navbar-brand font-bold text-xl">
          My Store
        </Link>

        {/* Mobile Toggler (Hamburger Menu) */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarResponsive" 
          aria-controls="navbarResponsive" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="navbarResponsive">
          {/* Your Navigation Links */}
          <Navbar />

          {/* Clerk Authentication Buttons */}
          <ul className='navbar-nav ms-lg-4 gap-4 items-center'>
            <SignedIn>
              <li className="nav-item">
                <UserButton />
              </li>
            </SignedIn>

            <SignedOut>
              <li className="nav-item">
                <SignInButton mode="modal">
                  <button className="btn btn-primary bg-orange-500 border-0 hover:bg-orange-600 transition">
                    Sign In
                  </button>
                </SignInButton>
              </li>
            </SignedOut>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;