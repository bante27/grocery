import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  LogOut,
  Settings,
  Package,
  Heart
} from "lucide-react";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { getCartItemCount, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Function to update auth state
  const updateAuthState = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        setIsLoggedIn(true);
        setUserName(parsedUser.name || 'User');
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoggedIn(false);
        setUserName('');
      }
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  useEffect(() => {
    // Initial check
    updateAuthState();

    // Listen for custom auth events from login/register
    const handleAuthEvent = () => {
      console.log('Auth event received, updating header...');
      updateAuthState();
    };

    // Listen for storage changes (for logout from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('Storage changed, updating auth state...');
        updateAuthState();
      }
    };

    // Add event listeners
    window.addEventListener('authStateChanged', handleAuthEvent);
    window.addEventListener('storage', handleStorageChange);

    // Also listen for click events on the document to detect login
    const handleDocumentClick = () => {
      // Quick check if auth state changed
      updateAuthState();
    };

    // Check auth state every second (fallback)
    const intervalId = setInterval(updateAuthState, 1000);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthEvent);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update state
    setIsLoggedIn(false);
    setUserName('');
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    // Close dropdown
    setIsDropdownOpen(false);
    setIsOpen(false);
    
    // Redirect to home page
    navigate('/');
    
    // Show success message
    alert('You have been logged out successfully!');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="bg-emerald-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 lg:h-18">
            {/* Logo + Name */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 ml-4">
              <img
                src="/newlogo.png"
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
              <Link to="/shop" className="hover:text-emerald-200 transition">Shop</Link>
              <Link to="/about" className="hover:text-emerald-200 transition">About Us</Link>
              <Link to="/contact" className="hover:text-emerald-200 transition">Contact Us</Link>
            </nav>

            {/* Right Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5">
              {/* Search Bar - Desktop */}
              <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-gray-800 text-sm outline-none w-32 lg:w-48"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                <button onClick={handleSearch} className="ml-2">
                  <Search className="w-4 h-4 text-emerald-700" />
                </button>
              </div>

              {/* Search Icon - Mobile */}
              <div className="md:hidden">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-emerald-200" />
              </div>

              {/* User Account Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 hover:text-emerald-200 transition"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" />
                  {isLoggedIn && userName && (
                    <span className="text-xs hidden sm:inline ml-1">
                      Hi, {userName.split(' ')[0]}
                    </span>
                  )}
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    {!isLoggedIn ? (
                      // Show login/register when not logged in
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-3 hover:bg-emerald-50 transition text-gray-800 border-b border-gray-100"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 rounded-full">
                              <LogIn className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">Login</p>
                              <p className="text-xs text-gray-500">Access your account</p>
                            </div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/register"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-3 hover:bg-emerald-50 transition text-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 rounded-full">
                              <UserPlus className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">Register</p>
                              <p className="text-xs text-gray-500">Create new account</p>
                            </div>
                          </div>
                        </Link>
                      </>
                    ) : (
                      // Show user menu when logged in
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 rounded-full">
                              <User className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm text-gray-800">
                                {userName}
                              </p>
                              <p className="text-xs text-gray-500">Welcome back!</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* User Options */}
                        <Link
                          to="/account"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 hover:bg-emerald-50 transition text-gray-800 text-sm"
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-500" />
                          <span>My Account</span>
                        </Link>
                        
                        <Link
                          to="/orders"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 hover:bg-emerald-50 transition text-gray-800 text-sm"
                        >
                          <Package className="w-4 h-4 mr-3 text-gray-500" />
                          <span>My Orders</span>
                        </Link>
                        
                        <Link
                          to="/wishlist"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-2 hover:bg-emerald-50 transition text-gray-800 text-sm"
                        >
                          <Heart className="w-4 h-4 mr-3 text-gray-500" />
                          <span>Wishlist</span>
                        </Link>
                        
                        <div className="border-t border-gray-200 my-2"></div>
                        
                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 hover:bg-red-50 transition text-red-600 text-sm"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Cart Icon */}
              <div className="relative">
                <button onClick={() => setIsCartOpen(true)}>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 cursor-pointer hover:text-emerald-200" />
                </button>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-[8px] sm:text-[10px] rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-1">
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isOpen && (
            <div className="md:hidden px-4 pb-4">
              <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full px-4 py-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-gray-800 text-sm outline-none flex-grow"
                />
                <button type="submit" className="ml-2">
                  <Search className="w-4 h-4 text-emerald-700" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-emerald-800">
            <nav className="px-4 py-4 space-y-4 text-center text-sm">
              <Link to="/" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">Home</Link>
              <Link to="/shop" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">Shop</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">About Us</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">Contact Us</Link>
              
              {/* Mobile Account Options */}
              <div className="pt-2 border-t border-emerald-600">
                <p className="text-emerald-300 text-xs mb-2">ACCOUNT</p>
                
                {!isLoggedIn ? (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">Login</Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">Register</Link>
                  </>
                ) : (
                  <>
                    <div className="text-emerald-100 py-2">
                      <p className="font-medium">Hi, {userName.split(' ')[0]}</p>
                    </div>
                    <Link to="/account" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">My Account</Link>
                    <Link to="/orders" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">My Orders</Link>
                    <Link to="/wishlist" onClick={() => setIsOpen(false)} className="block hover:text-emerald-200 py-2">Wishlist</Link>
                    <button
                      onClick={() => {
                        handleLogout();
                      }}
                      className="block w-full text-left hover:text-emerald-200 py-2 text-red-300"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}