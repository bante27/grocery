// src/components/Hero.jsx

import { ShoppingCart } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gray-100 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-32">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left – Text (Auto shrinks on mobile) */}
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <p className="text-emerald-600 text-lg sm:text-xl md:text-2xl font-serif italic">
              Daily Grocery
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              Fresh and Healthy Grocery Store
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Direct to your home
            </p>
          </div>

          {/* Right – Image (Auto scales & doesn't overflow) */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Fresh strawberries and chocolate"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-auto object-contain drop-shadow-2xl"
            />
          </div>

        </div>
      </div>

      {/* Floating Cart Button – Small & Mobile Friendly */}
      <button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-full p-3 sm:p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group z-50">
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 group-hover:text-emerald-600" />
        <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          1
        </span>
      </button>
    </section>
  );
}