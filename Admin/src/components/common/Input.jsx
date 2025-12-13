import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  ...props 
}) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-2">
      {label && (
        <label 
          className={`block text-sm font-medium ${
            isDark ? 'text-white/90' : 'text-gray-800'
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon 
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isDark ? 'text-white/60' : 'text-gray-500'
            }`}
          />
        )}
        <input
          className={`w-full border rounded-xl pr-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 ${
            isDark
              ? 'bg-gray-900 text-white border-gray-700 placeholder-gray-400'
              : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
          } ${Icon ? 'pl-10' : 'pl-4'} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default Input;
