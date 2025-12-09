import React from 'react';

export default function SeverityBadge({ level }) {
  const colorMap = {
    low: 'bg-green-600 text-white',
    medium: 'bg-yellow-600 text-white',
    high: 'bg-orange-600 text-white',
    emergency: 'bg-red-700 text-white',
  };

  const labelMap = {
    low: 'Low Severity',
    medium: 'Moderate Severity',
    high: 'High Severity',
    emergency: '🚨 EMERGENCY',
  };

  return (
    <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${colorMap[level] || colorMap.medium}`}>
      {labelMap[level] || 'Unknown'}
    </span>
  );
}
