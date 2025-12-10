import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function HospitalList({ hospitals, loading, recommendedDept }) {
  const { theme } = useTheme();
  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textMutedClass = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const badgeInactiveClass = theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';

  if (loading) {
    return (
      <div className={`text-center py-8 ${textSecondaryClass}`}>
        <p>Loading nearby hospitals...</p>
      </div>
    );
  }

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className={`${bgClass} border rounded-lg p-4 ${textSecondaryClass} text-sm`}>
        No hospitals found in your area for this specialty. Please contact your local health authority or visit the nearest healthcare facility.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hospitals.map((hospital) => (
        <div key={hospital.id} className={`${bgClass} border rounded-lg p-4 hover:border-blue-500 transition-colors`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className={`font-semibold ${textClass}`}>{hospital.name}</h4>
              <p className={`text-sm ${textSecondaryClass}`}>{hospital.address}</p>
            </div>
          </div>

          <div className="mb-3">
            <p className={`text-xs ${textMutedClass} mb-1`}>Available Departments:</p>
            <div className="flex flex-wrap gap-1">
              {hospital.departments.map((dept) => (
                <span
                  key={dept}
                  className={`px-2 py-1 rounded text-xs ${
                    dept === recommendedDept
                      ? 'bg-blue-600 text-white'
                      : badgeInactiveClass
                  }`}
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>

          <div className={`flex gap-2 pt-3 border-t ${borderClass}`}>
            <a
              href={`tel:${hospital.phone}`}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded text-center transition-colors"
            >
              📞 Call
            </a>
            <a
              href={hospital.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded text-center transition-colors"
            >
              🗺️ Directions
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
