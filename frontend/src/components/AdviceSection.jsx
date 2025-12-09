import React from 'react';

export default function AdviceSection({ title, content, icon = '•' }) {
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-blue-400 mb-3">{icon} {title}</h3>
      {Array.isArray(content) ? (
        <ul className="list-none space-y-2 ml-4">
          {content.map((item, idx) => (
            <li key={idx} className="text-gray-300 text-sm">
              <span className="text-blue-400 mr-2">→</span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
      )}
    </div>
  );
}
