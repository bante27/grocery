import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="lg:ml-64 bg-black text-white border-t border-white/10 py-6 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left side: Logo + Text */}
          <div className="flex items-center gap-3 text-white text-sm">
            <img
              src="/newlogo.png"
              alt="Grocery Admin Logo"
              className="h-6 w-auto"
            />
            <span>© {year} Grocery Admin Dashboard. All rights reserved.</span>
          </div>

          {/* Right side: Links */}
         
        </div>
      </div>
    </footer>
  );
};

export default Footer;