import React, { useState, useEffect, useCallback } from 'react';
import { getNearbyHospitals, getHospitals } from '../api/client';
import HospitalList from './HospitalList';
import { useTheme } from '../contexts/ThemeContext';

const GEO_TIMEOUT_MS = 8000;

// Hospital discovery flow:
// 1. Ask for browser location permission
// 2. If denied/unavailable -> ask for a pincode
// 3. If the user skips that too -> explain why hospitals are not shown
// If the live OSM service fails, fall back to the curated city list.
export default function NearbyHospitals({ city, recommendedDept }) {
  const { theme } = useTheme();
  const [status, setStatus] = useState('locating'); // locating | pincode | loading | loaded | skipped | error
  const [hospitals, setHospitals] = useState([]);
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const inputBgClass = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  const loadStaticFallback = useCallback(async () => {
    if (!city) {
      setStatus('error');
      return;
    }
    try {
      const res = await getHospitals(city, recommendedDept);
      setHospitals(res.data?.hospitals || []);
      setUsingFallback(true);
      setStatus('loaded');
    } catch {
      setStatus('error');
    }
  }, [city, recommendedDept]);

  const loadByCoords = useCallback(
    async (lat, lon) => {
      setStatus('loading');
      try {
        const res = await getNearbyHospitals({ lat, lon });
        setHospitals(res.data?.hospitals || []);
        setUsingFallback(false);
        setStatus('loaded');
      } catch {
        await loadStaticFallback();
      }
    },
    [loadStaticFallback]
  );

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('pincode');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => loadByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setStatus('pincode'),
      { timeout: GEO_TIMEOUT_MS, maximumAge: 5 * 60 * 1000 }
    );
  }, [loadByCoords]);

  const handlePincodeSubmit = async (e) => {
    e.preventDefault();
    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setPincodeError('Please enter a valid 6-digit pincode.');
      return;
    }
    setPincodeError('');
    setStatus('loading');
    try {
      const res = await getNearbyHospitals({ pincode: trimmed });
      setHospitals(res.data?.hospitals || []);
      setUsingFallback(false);
      setStatus('loaded');
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        setPincodeError(err.response.data?.error || 'Could not find that pincode.');
        setStatus('pincode');
      } else {
        await loadStaticFallback();
      }
    }
  };

  return (
    <div className={`${bgClass} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-blue-400">🏥 Hospitals Near You</h2>
        {status === 'loaded' && usingFallback && city && (
          <span className={`text-sm ${textMutedClass}`}>Showing saved list for {city}</span>
        )}
        {status === 'loaded' && !usingFallback && (
          <span className={`text-sm ${textMutedClass}`}>Live data from OpenStreetMap</span>
        )}
      </div>

      {status === 'locating' && (
        <div className={`text-center py-8 ${textSecondaryClass}`}>
          <p className="mb-1">📍 Requesting your location…</p>
          <p className={`text-xs ${textMutedClass}`}>
            Allow location access to find hospitals near you. We use it once and never store it.
          </p>
        </div>
      )}

      {status === 'loading' && (
        <div className={`text-center py-8 ${textSecondaryClass}`}>
          <p>Finding hospitals near you…</p>
        </div>
      )}

      {status === 'pincode' && (
        <div className="py-4">
          <p className={`${textSecondaryClass} mb-3 text-sm`}>
            Location access wasn't available. Enter your area pincode to find nearby hospitals instead:
          </p>
          <form onSubmit={handlePincodeSubmit} className="flex gap-2 flex-wrap">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ''));
                setPincodeError('');
              }}
              placeholder="6-digit pincode, e.g. 400001"
              className={`flex-1 min-w-[180px] p-3 ${inputBgClass} rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label="Area pincode"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Find Hospitals
            </button>
            <button
              type="button"
              onClick={() => setStatus('skipped')}
              className={`px-4 py-3 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
            >
              Skip
            </button>
          </form>
          {pincodeError && (
            <p role="alert" className="text-red-400 text-sm mt-2">{pincodeError}</p>
          )}
        </div>
      )}

      {status === 'skipped' && (
        <div className="py-6 text-center">
          <p className={`${textClass} font-semibold mb-2`}>Hospitals not shown</p>
          <p className={`${textSecondaryClass} text-sm mb-4`}>
            Location permission wasn't given and no pincode was provided, so we can't show hospitals near you.
            In an emergency, call <strong>112</strong> or go to the nearest hospital immediately.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setStatus('pincode')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Enter Pincode
            </button>
            {city && (
              <button
                onClick={loadStaticFallback}
                className={`text-sm font-medium px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
              >
                Show hospitals in {city} instead
              </button>
            )}
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="py-6 text-center">
          <p className={`${textSecondaryClass} text-sm mb-4`}>
            We couldn't load hospital data right now. Please try again in a moment.
            In an emergency, call <strong>112</strong> or go to the nearest hospital immediately.
          </p>
          <button
            onClick={() => setStatus('pincode')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {status === 'loaded' && (
        <>
          {hospitals.length === 0 ? (
            <div className={`py-6 ${textSecondaryClass} text-sm text-center`}>
              <p className="mb-2">No hospitals found within 10 km of your location.</p>
              <p className={`text-xs ${textMutedClass}`}>
                Try a different pincode. In an emergency, call <strong>112</strong> immediately.
              </p>
              <button
                onClick={() => setStatus('pincode')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Enter a Pincode
              </button>
            </div>
          ) : (
            <HospitalList hospitals={hospitals} loading={false} recommendedDept={recommendedDept} />
          )}
        </>
      )}
    </div>
  );
}
