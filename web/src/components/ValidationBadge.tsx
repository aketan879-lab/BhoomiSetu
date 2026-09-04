import React from 'react';

interface ValidationBadgeProps {
  score: number;
}

export default function ValidationBadge({ score }: ValidationBadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  
  if (score >= 80) {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
  } else if (score >= 60) {
    colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
  } else {
    colorClass = 'bg-red-100 text-red-800 border-red-200';
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {score}
    </span>
  );
}
