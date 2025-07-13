import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 sticky top-0 z-50 w-full">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="text-2xl font-bold text-white">
            Campus Events
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-white hover:text-indigo-200 font-medium">Home</Link>
            <Link to="/event" className="text-white hover:text-indigo-200 font-medium">Events</Link>
            <Link to="/club" className="text-white hover:text-indigo-200 font-medium">Clubs</Link>
            <Link to="/login" className="text-white hover:text-indigo-200 font-medium">Login</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden bg-gradient-to-r from-indigo-600 to-purple-600 px-4 transition-max-height duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-screen py-2' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col space-y-4">
          <Link
            to="/"
            className="text-white hover:text-indigo-200 font-medium"
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link
            to="/event"
            className="text-white hover:text-indigo-200 font-medium"
            onClick={closeMobileMenu}
          >
            Events
          </Link>
          <Link
            to="/club"
            className="text-white hover:text-indigo-200 font-medium"
            onClick={closeMobileMenu}
          >
            Clubs
          </Link>
          <Link
            to="/login"
            className="text-white hover:text-indigo-200 font-medium"
            onClick={closeMobileMenu}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
