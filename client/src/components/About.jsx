// src/components/About.jsx

import React from "react";
import im1 from "/dist/assets/im1.png"; // your photo in public/dist/assets/im1.png

const About = () => {
  return (
    <div className="w-full pt-10 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* THE COMPANY */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-emerald-700 mb-6">THE COMPANY</h2>
          <p className="text-gray-700 leading-8 text-lg">
            GROCERY is a modern online store that delivers fresh vegetables, fruits, dairy, meat, and daily essentials 
            directly to your doorstep. We work with local farmers and trusted suppliers to bring you the highest quality 
            products at affordable prices, with fast and reliable delivery.
          </p>
        </section>

        {/* OUR MISSION */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-emerald-700 mb-6">OUR MISSION</h2>
          <p className="text-gray-700 leading-8 text-lg">
            To make grocery shopping easy, fast, and enjoyable for everyone. We believe fresh food should be accessible 
            to all families without long queues or heavy bags — just one click and it's at your door.
          </p>
        </section>

        {/* OUR VISION */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-emerald-700 mb-6">OUR VISION</h2>
          <p className="text-gray-700 leading-8 text-lg">
            To become the most trusted online grocery platform in the region by delivering freshness, quality, and care 
            in every order — while supporting local farmers and building a healthier community.
          </p>
        </section>

        {/* The Founder – Your Photo & Real Name */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12">
          <div className="order-2 md:order-1">
            <img
              src={im1}
              alt="Bantalem - Founder of GROCERY"
              className="w-full max-w-md mx-auto rounded-2xl shadow-2xl object-cover"
            />
          </div>

          <div className="order-1 md:order-2 text-center md:text-left">
            <h2 className="text-4xl font-bold text-emerald-700 mb-6">Meet The Founder</h2>
            <p className="text-gray-700 leading-8 text-lg mb-8">
              Hi, I'm Bantalem — proud founder of GROCERY. I started this company because I saw how difficult it was 
              for busy families to get fresh, affordable food. My dream is simple: bring the market to your home with 
              love, freshness, and trust.
            </p>
            <h3 className="text-3xl font-bold text-emerald-800">Bantalem</h3>
            <p className="text-xl text-emerald-600 mt-2">Founder & CEO</p>
          </div>
        </section>

        {/* Company Partners */}
        <section className="mb-20 text-center">
          <h2 className="text-3xl font-bold text-emerald-700 mb-10">Our Trusted Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg flex items-center justify-center rounded-lg">
                <span className="text-gray-500 font-medium">Partner {i}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Mini Cart Footer */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
              <h4 className="text-lg font-semibold mb-2">Your Cart is Empty</h4>
              <a href="/shop" className="text-emerald-700 hover:underline font-medium">
                Start Shopping Now
              </a>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-2xl font-bold text-emerald-700">$ 0.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;