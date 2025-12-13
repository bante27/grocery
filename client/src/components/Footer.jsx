// src/components/Footer.jsx

import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Main White Footer – Same on every page */}
      <footer className="bg-white text-gray-700 pt-10 pb-20 md:pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">

            {/* Logo + About */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {/* NEW LOGO FROM PUBLIC FOLDER */}
                <img
                  src="/newlogo.png"
                  alt="Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Fresh groceries delivered fast in Debre Birhan.
                Quality products every day.
              </p>

              <p className="mt-5 text-xs text-gray-500">
                © {currentYear} Bantalem Grocery Store
              </p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">
                Product Categories
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                <li>Fresh Vegetables & Fruits</li>
                <li>Dairy & Eggs</li>
                <li>Meat & Fish</li>
                <li>Beverages</li>
                <li>Snacks & Sweets</li>
                <li>Household & Cleaning</li>
                <li>Personal Care</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3">
                Contact Details
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                <li><strong>Phone:</strong> +251 927 993 894</li>
                <li><strong>WhatsApp:</strong> +251 927 993 894</li>
                <li><strong>Email:</strong> hello@grocery.et</li>
                <li><strong>Address:</strong> Debre Birhan, Ethiopia</li>
                <li><strong>Hours:</strong> 7AM – 10PM Daily</li>
              </ul>
            </div>

          </div>
        </div>
      </footer>

      {/* Green Bottom Bar – Same on every page */}
      <div className="bg-emerald-700 text-white py-3 text-center text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4">
          © {currentYear} Bantalem Grocery Made with ThemeHunk
        </div>
      </div>
    </>
  );
};

export default Footer;
