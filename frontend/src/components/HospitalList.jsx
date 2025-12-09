import React from 'react';

const careSettingMap = {
  'self-care': { label: 'Self-Care at Home', icon: '🏠' },
  'outpatient-clinic': { label: 'Outpatient Clinic Visit', icon: '🏥' },
  'urgent-care-same-day': { label: 'Urgent Care (Same Day)', icon: '⚡' },
  'emergency-department': { label: 'Emergency Department (Immediate)', icon: '🚨' },
};

export default function HospitalList({ hospitals, loading, recommendedDept }) {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Loading nearby hospitals...</p>
      </div>
    );
  }

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-gray-400 text-sm">
        No hospitals found in your area for this specialty. Please contact your local health authority or visit the nearest healthcare facility.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hospitals.map((hospital) => (
        <div key={hospital.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-white">{hospital.name}</h4>
              <p className="text-sm text-gray-400">{hospital.address}</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Available Departments:</p>
            <div className="flex flex-wrap gap-1">
              {hospital.departments.map((dept) => (
                <span
                  key={dept}
                  className={`px-2 py-1 rounded text-xs ${
                    dept === recommendedDept
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-700">
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
