import React, { createContext, useContext,用Context, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('guest');

  useEffect(() => {
    // AUTO LOGIN AS GROCERY ADMIN — FOR TESTING/DEMO ONLY
    const autoLoginGroceryAdmin = () => {
      const groceryAdmin = {
        _id: "grocery001",
        name: "Grocery Admin",
        email: "admin@groceryapp.et",
        phone: "+251 911 234 567",
        isAdmin: true,
        storeName: "Addis Fresh Mart",
      };

      const demoToken = "grocery-demo-token-bypass-2025";

      // Save fake token so other parts think we're logged in
      localStorage.setItem('userToken', demoToken);

      setUser(groceryAdmin);
      setToken(demoToken);
      setIsAuthenticated(true);
      setRole('admin');
      setLoading(false);
    };

    autoLoginGroceryAdmin();
  }, []);

  const login = async (credentials) => {
    // Disabled during dev — auto-login is active
    alert("Auto-login enabled — no need to log in!");
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setRole('guest');
    window.location.href = '/'; // Redirect to home/login after logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        login,
        logout,
        loading,
        isAuthenticated,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};