import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// Custom hook for consuming context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // ✅ Initialize theme immediately from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("adminTheme");
    if (saved) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // ✅ Apply theme class & save in localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("adminTheme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("adminTheme", "light");
    }
  }, [isDark]);

  // ✅ Toggle theme
  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
