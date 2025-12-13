import React from 'react';
import Card from './Card';

const Table = ({ title, icon: Icon, actions, children, className = '' }) => {
  return (
    <Card gradient className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-emerald-400" />}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {/* Table content */}
      <div className="overflow-x-auto">
        {children}
      </div>
    </Card>
  );
};

export default Table;
