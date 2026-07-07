import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Skeleton from './Skeleton';

export default function HospitalList({ hospitals, loading, recommendedDept }) {
  const bgClass = 'bg-th-card border-th-border';
  const textClass = 'text-th-text';
  const textSecondaryClass = 'text-th-text-secondary';
  const textMutedClass = 'text-th-text-muted';
  const borderClass = 'border-th-border';
  const badgeInactiveClass = 'bg-th-badge-bg text-th-badge-text';

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel border-th-border/20 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-2/3">
                <Skeleton variant="text" className="h-6 w-full" />
                <Skeleton variant="text" className="h-4 w-3/4" />
              </div>
              <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
            </div>
            <Skeleton variant="text" className="h-4 w-1/2" />
            <div className="flex gap-2 pt-2 border-t border-th-border/10">
              <Skeleton variant="rectangular" className="h-8 flex-1" />
              <Skeleton variant="rectangular" className="h-8 flex-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!hospitals || hospitals.length === 0) {
    return (
      <div className={`${bgClass} border rounded-lg p-4 ${textSecondaryClass} text-sm`}>
        No hospitals found in your area for this specialty. Please contact your local health
        authority or visit the nearest healthcare facility.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {hospitals.map((hospital, index) => {
        // Fallback for ID since API results might not have an id
        const keyId = hospital.id || `${hospital.name}-${index}`;
        const mapUrl = hospital.mapsUrl || (hospital.lat && hospital.lng ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}` : null);
        
        return (
          <div
            key={keyId}
            className="glass-panel border-th-border/20 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-display font-bold text-lg text-th-text mb-1">{hospital.name}</h4>
                <p className={`text-sm ${textSecondaryClass}`}>{hospital.address}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className={`text-xs ${textMutedClass} mb-2 tracking-wider font-semibold uppercase`}>Specialty / Type:</p>
              <div className="flex flex-wrap gap-2">
                {hospital.specialty && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-th-info-bg/50 border border-th-info-border/30 text-th-info-text capitalize shadow-sm">
                    {hospital.specialty}
                  </span>
                )}
                {hospital.type && hospital.type !== hospital.specialty && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeInactiveClass} capitalize shadow-sm`}>
                    {hospital.type}
                  </span>
                )}
                {hospital.departments && hospital.departments.map((dept) => (
                  <span
                    key={dept}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dept.toLowerCase() === recommendedDept?.toLowerCase() ? 'bg-blue-600 text-white shadow-md' : badgeInactiveClass + ' shadow-sm'
                    }`}
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-th-border/30">
              {hospital.phone ? (
                <a
                  href={`tel:${hospital.phone}`}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm font-semibold py-2.5 rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span> Call
                </a>
              ) : null}
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-th-primary hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold py-2.5 rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">directions</span> Directions
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
