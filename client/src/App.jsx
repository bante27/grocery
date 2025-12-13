// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import all your components
import Header from './components/Header';
import About from './components/About';
import Hero from './components/Hero';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Products from './components/Products';
import AdminProducts from './components/AdminProducts'; // Add this

function App() {
  return (
    <BrowserRouter>
      {/* Header & Footer are OUTSIDE Routes so they appear on every page */}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        
        <Header />   {/* Always visible at the top */}

        {/* Main content area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/shop" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/hero" element={<Hero />} />
            
            {/* NEW: Admin route - users won't see this unless they know the URL */}
            <Route path="/admin/products" element={<AdminProducts />} />
            
            {/* Add more routes later like /shop, /checkout */}
          </Routes>
        </main>

        <Footer />   {/* Always visible at the bottom */}
      
      </div>
    </BrowserRouter>
  );
}

export default App;