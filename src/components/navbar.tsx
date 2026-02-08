import Link from 'next/link';
import React from "react";

const Navbar = () => {
  return (
    // Converted to Bootstrap 'navbar-nav' structure
    <ul className="navbar-nav ms-auto">
      <li className="nav-item">
        <Link href="/" className="nav-link hover:text-orange-500 transition">
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link href="/products" className="nav-link hover:text-orange-500 transition">
          Products
        </Link>
      </li>
      <li className="nav-item">
        <Link href="/about" className="nav-link hover:text-orange-500 transition">
          About
        </Link>
      </li>
      <li className="nav-item">
        <Link href="/contact" className="nav-link hover:text-orange-500 transition">
          Contact
        </Link>
      </li>
    </ul>
  );
}

export default Navbar;