import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 lg:h-18">

          {/* Logo + Name */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 ml-4">
            <img
              src="/newlogo.png"  // <-- Public folder logo
              alt="Logo"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
            />
            <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight ml-1">
              GROCERY
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-xs sm:text-sm md:text-base font-medium">
            <Link to="/" className="hover:text-emerald-200 transition">Home</Link>
            <Link to="/about" className="hover:text-emerald-200 transition">About Us</Link>
            <Link to="/shop" className="hover:text-emerald-200 transition">Shop</Link>
            <Link to="/contact" className="hover:text-emerald-200 transition">Contact Us</Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 cursor-pointer hover:text-emerald-200" />
            <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 cursor-pointer hover:text-emerald-200" />
            <div className="relative">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 cursor-pointer hover:text-emerald-200" />
              <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-[8px] sm:text-[10px] rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                0
              </span>
            </div>

            {/* Mobile Hamburger */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-1">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-emerald-800">
          <nav className="px-4 py-4 space-y-4 text-center text-sm">
            <Link to="/" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200">Home</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200">About Us</Link>
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200">Shop</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200">Contact Us</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
