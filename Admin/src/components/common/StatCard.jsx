import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'from-emerald-500 to-emerald-600',
  subtitle,
  trend,
  onClick 
}) => {
  return (
    <div 
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        onClick ? 'hover:brightness-110' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
            <span className="text-xs font-medium">+{trend}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold mb-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {subtitle && (
          <p className="text-white/70 text-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;