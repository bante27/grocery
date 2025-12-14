// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';

// Import all your components
import Header from './components/Header.jsx';
import About from './components/About.jsx';
import Hero from './components/Hero.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Products from './components/Products.jsx';
import AdminProducts from './components/AdminProducts.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './components/Login.jsx'; // Add this
import Register from './components/register.jsx'; // Add this


function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        {/* Header & Footer are OUTSIDE Routes so they appear on every page */}
        <div className="min-h-screen bg-gray-50 flex flex-col">
          
          <Header />

          {/* Main content area */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/shop" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/hero" element={<Hero />} />
              <Route path="/checkout" element={<Checkout />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin route */}
              <Route path="/admin/products" element={<AdminProducts />} />
              
              {/* Add more routes here */}
            </Routes>
          </main>

          <Footer />
        
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;