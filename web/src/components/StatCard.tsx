import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export default function StatCard({ title, value, change, icon, color = 'blue' }: StatCardProps) {
  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-success',
    orange: 'text-warning',
    red: 'text-danger',
  };

  const bgMap = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        {icon && (
          <div className={`p-3 rounded-md ${bgMap[color]} ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
      {change && (
        <div className="mt-2 text-sm">
          <span className={`font-medium ${colorMap[color]}`}>{change}</span>
          <span className="text-gray-500 ml-2">vs last week</span>
        </div>
      )}
    </div>
  );
}
