import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Card = ({ children, className = '', gradient = false }) => {
  const { isDark } = useTheme();

  const baseClasses = gradient
    ? isDark
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-xl'
      : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl shadow-xl'
    : isDark
      ? 'bg-gray-800 border border-gray-700 rounded-2xl'
      : 'bg-white border border-gray-200 rounded-2xl';

  return (
    <div className={`${baseClasses} ${className} p-6 transition`}>
      {children}
    </div>
  );
};

export default Card;
