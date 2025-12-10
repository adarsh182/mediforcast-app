import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function LoadingSpinner() {
  const { theme } = useTheme();
  const textClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className={`${textClass} text-sm`}>Analyzing your symptoms...</p>
    </div>
  );
}
