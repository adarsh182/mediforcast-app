import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function AdviceSection({ title, content, icon = '•' }) {
  const { theme } = useTheme();
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  if (!content || (Array.isArray(content) && content.length === 0)) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-blue-400 mb-3">{icon} {title}</h3>
      {Array.isArray(content) ? (
        <ul className="list-none space-y-2 ml-4">
          {content.map((item, idx) => (
            <li key={idx} className={`${textSecondaryClass} text-sm`}>
              <span className="text-blue-400 mr-2">→</span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className={`${textSecondaryClass} text-sm leading-relaxed`}>{content}</p>
      )}
    </div>
  );
}
