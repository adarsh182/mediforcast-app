import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import SeverityBadge from '../components/SeverityBadge';

export default function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { users, switchUser } = useUser();
  
  // Get userId from navigation state or use current user
  const viewUserId = location.state?.userId;
  const [viewingUser, setViewingUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Find the user being viewed
    const allUsers = [
      { id: 'default', name: 'Default User' },
      ...users.filter(u => u.id !== 'default'),
    ];
    const user = allUsers.find(u => u.id === (viewUserId || 'default'));
    setViewingUser(user || { id: 'default', name: 'Default User' });
    
    // Load history for the viewed user
    const historyKey = `sumo_history_${viewUserId || 'default'}`;
    const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setHistory(savedHistory);
    setSelectedItem(null);
  }, [viewUserId, users]);

  const clearHistory = () => {
    if (window.confirm(`Are you sure you want to clear all history for ${viewingUser?.name}?`)) {
      const historyKey = `sumo_history_${viewUserId || 'default'}`;
      localStorage.removeItem(historyKey);
      setHistory([]);
      setSelectedItem(null);
    }
  };

  const deleteItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    const historyKey = `sumo_history_${viewUserId || 'default'}`;
    localStorage.setItem(historyKey, JSON.stringify(updated));
    setHistory(updated);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const viewResult = (item) => {
    navigate('/result', {
      state: {
        result: item.result,
        city: item.city,
      },
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${bgClass} border rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div>
              <h1 className={`text-3xl font-bold ${textClass}`}>Symptom History</h1>
              <p className={`text-sm ${textMutedClass} mt-1`}>
                Viewing history for: <span className="font-semibold text-blue-400">{viewingUser?.name || 'User'}</span>
              </p>
              <button
                onClick={() => navigate('/profile')}
                className={`text-xs ${textMutedClass} hover:text-blue-400 mt-2`}
              >
                ← Back to Profile
              </button>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <p className={textSecondaryClass}>
          View your previous symptom checks and guidance results. All data is stored locally on your device.
        </p>
      </div>

      {history.length === 0 ? (
        <div className={`${bgClass} border rounded-lg p-12 text-center`}>
          <div className="text-6xl mb-4">📋</div>
          <h2 className={`text-xl font-semibold ${textClass} mb-2`}>No History Yet</h2>
          <p className={textMutedClass}>
            Your symptom checks and guidance results will appear here.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Start New Check
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className={`text-lg font-semibold ${textClass} mb-3`}>Previous Checks</h2>
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`${bgClass} border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedItem?.id === item.id
                    ? theme === 'dark'
                      ? 'ring-2 ring-blue-500 bg-gray-700'
                      : 'ring-2 ring-blue-500 bg-blue-50'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <SeverityBadge level={item.result?.severity_level || 'medium'} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
                <p className={`text-sm ${textSecondaryClass} line-clamp-2 mb-2`}>
                  {item.symptoms}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textMutedClass}`}>
                    {formatDate(item.timestamp)}
                  </span>
                  {item.city && (
                    <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {item.city}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Item Details */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className={`${bgClass} border rounded-lg p-6 space-y-6`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${textClass}`}>Details</h2>
                  <button
                    onClick={() => viewResult(selectedItem)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View Full Result
                  </button>
                </div>

                <div>
                  <h3 className={`text-sm font-semibold ${textMutedClass} mb-2`}>SYMPTOMS</h3>
                  <p className={textSecondaryClass}>{selectedItem.symptoms}</p>
                </div>

                {selectedItem.formData && (
                  <div>
                    <h3 className={`text-sm font-semibold ${textMutedClass} mb-2`}>ADDITIONAL INFO</h3>
                    <div className="space-y-1">
                      {selectedItem.formData.ageRange && (
                        <p className={textSecondaryClass}>
                          <span className="font-medium">Age:</span> {selectedItem.formData.ageRange}
                        </p>
                      )}
                      {selectedItem.formData.gender && (
                        <p className={textSecondaryClass}>
                          <span className="font-medium">Gender:</span> {selectedItem.formData.gender}
                        </p>
                      )}
                      {selectedItem.formData.chronicConditions?.length > 0 && (
                        <div>
                          <span className={`font-medium ${textSecondaryClass}`}>Conditions: </span>
                          <span className={textSecondaryClass}>
                            {selectedItem.formData.chronicConditions.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className={`text-sm font-semibold ${textMutedClass} mb-2`}>SUMMARY</h3>
                  <p className={textSecondaryClass}>
                    {selectedItem.result?.symptom_summary || 'No summary available'}
                  </p>
                </div>

                <div>
                  <h3 className={`text-sm font-semibold ${textMutedClass} mb-2`}>RECOMMENDED SPECIALTIES</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.result?.recommended_specialties?.map((spec) => (
                      <span
                        key={spec}
                        className={`px-3 py-1 rounded-full text-sm ${
                          theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-semibold ${textMutedClass} mb-2`}>CARE SETTING</h3>
                  <p className={textSecondaryClass}>
                    {selectedItem.result?.recommended_care_setting?.replace('-', ' ').toUpperCase() || 'Not specified'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className={`text-xs ${textMutedClass}`}>
                    Checked on {formatDate(selectedItem.timestamp)}
                  </p>
                </div>
              </div>
            ) : (
              <div className={`${bgClass} border rounded-lg p-12 text-center`}>
                <div className="text-4xl mb-4">👈</div>
                <p className={textMutedClass}>Select an item from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

