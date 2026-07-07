import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import SeverityBadge from '../components/SeverityBadge';
import { getPreviousChecks, deleteHistoryItem, clearHistory } from '../api/client';
import toast from 'react-hot-toast';
import AnimatedPage from "../components/AnimatedPage";
import Skeleton from '../components/Skeleton';

export default function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { users, switchUser: _switchUser } = useUser();

  // Get userId from navigation state or use current user
  const viewUserId = location.state?.userId;
  const [viewingUser, setViewingUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the user being viewed
    const allUsers = [
      { id: 'default', name: 'Default User' },
      ...users.filter((u) => u.id !== 'default'),
    ];
    const user = allUsers.find((u) => u.id === (viewUserId || 'default'));
    setViewingUser(user || { id: 'default', name: 'Default User' });

    const loadHistory = async () => {
      setLoading(true);
      try {
        const response = await getPreviousChecks();
        setHistory(response.data.history || response.data.checks || []);
      } catch (err) {
        console.error('Failed to load history:', err);
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
    setSelectedItem(null);
  }, [viewUserId, users]);

  const handleClearHistory = async () => {
    if (window.confirm(`Are you sure you want to clear all history for ${viewingUser?.name}?`)) {
      try {
        await clearHistory();
        setHistory([]);
        setSelectedItem(null);
        toast.success('History cleared successfully');
      } catch (err) {
        toast.error('Failed to clear history');
      }
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteHistoryItem(id);
      const updated = history.filter((item) => item.id !== id);
      setHistory(updated);
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      toast.success('Record deleted');
    } catch (err) {
      toast.error('Failed to delete record');
    }
  };

  const viewResult = (item) => {
    navigate('/result', {
      state: {
        result: item.result,
        city: item.city,
        nearbyClinics: item.nearbyClinics || item.nearby_clinics || [],
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

  const bgClass = 'bg-th-card border-th-border';
  const textClass = 'text-th-text';
  const textSecondaryClass = 'text-th-text-secondary';
  const textMutedClass = 'text-th-text-muted';

  return (
    <AnimatedPage className="space-y-6">
      {/* Header */}
      <div className="glass-thick rounded-[32px] p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div>
              <h1 className="text-3xl font-display font-bold text-th-primary">Symptom History</h1>
              <p className={`text-sm ${textMutedClass} mt-1`}>
                Viewing history for:{' '}
                <span className="font-semibold text-th-text">{viewingUser?.name || 'User'}</span>
              </p>
              <button
                onClick={() => navigate('/profile')}
                className={`text-sm font-semibold text-blue-500 hover:text-blue-600 mt-3 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1`}
              >
                &larr; Back to Profile
              </button>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors border-none cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
        <p className={`${textSecondaryClass} mt-2`}>
          View your previous symptom checks and guidance results. All data is securely stored locally in your account.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-thick rounded-[24px] p-6 shadow-md flex items-center justify-between">
              <div className="space-y-3 w-1/2">
                <Skeleton variant="text" className="h-6 w-3/4" />
                <Skeleton variant="text" className="h-4 w-1/2" />
              </div>
              <Skeleton variant="rectangular" className="h-10 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="glass-thick rounded-[32px] p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-display font-bold text-th-text mb-2">No History Yet</h2>
          <p className={textMutedClass}>
            Your symptom checks and guidance results will appear here.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-th-primary hover:from-blue-700 hover:to-blue-800 text-white rounded-full font-medium transition-colors shadow-lg cursor-pointer border-none"
          >
            Start New Check
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-display font-bold text-th-primary mb-3">Previous Checks</h2>
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`glass-thin rounded-[24px] p-5 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${
                  selectedItem?.id === item.id
                    ? 'ring-2 ring-th-primary bg-white/60 dark:bg-black/40'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <SeverityBadge level={item.result?.severity_level || 'medium'} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
                <p className={`text-sm ${textSecondaryClass} line-clamp-2 mb-2`}>{item.symptoms}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textMutedClass}`}>{formatDate(item.timestamp)}</span>
                  {item.city && (
                    <span
                      className={`text-xs px-2 py-1 rounded bg-th-badge-bg text-th-badge-text`}
                    >
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
              <div className="glass-thick rounded-[32px] p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-display font-bold text-th-primary">Details</h2>
                  <button
                    onClick={() => viewResult(selectedItem)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-th-primary hover:from-blue-700 hover:to-blue-800 text-white rounded-full text-sm font-medium transition-all shadow-md cursor-pointer border-none"
                  >
                    View Full Result
                  </button>
                </div>

                <div>
                  <h3 className={`text-sm font-semibold ${textMutedClass} mb-2 tracking-wider`}>SYMPTOMS</h3>
                  <p className={`${textSecondaryClass} text-lg leading-relaxed bg-th-info-bg/30 p-4 rounded-xl border border-th-info-border/20`}>{selectedItem.symptoms}</p>
                </div>

                {selectedItem.formData && (
                  <div>
                    <h3 className={`text-sm font-semibold ${textMutedClass} mb-2 tracking-wider`}>
                      ADDITIONAL INFO
                    </h3>
                    <div className="space-y-1">
                      {selectedItem.formData.ageRange && (
                        <p className={textSecondaryClass}>
                          <span className="font-medium">Age:</span> {selectedItem.formData.ageRange}
                        </p>
                      )}
                      {selectedItem.formData.gender && (
                        <p className={textSecondaryClass}>
                          <span className="font-medium">Gender:</span>{' '}
                          {selectedItem.formData.gender}
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
                  <h3 className={`text-sm font-semibold ${textMutedClass} mb-2 tracking-wider`}>SUMMARY</h3>
                  <p className={textSecondaryClass}>
                    {selectedItem.result?.symptom_summary || 'No summary available'}
                  </p>
                </div>

                <div>
                  <h3 className={`text-sm font-semibold ${textMutedClass} mb-2 tracking-wider`}>
                    RECOMMENDED SPECIALTIES
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.result?.recommended_specialties?.map((spec) => (
                      <span
                        key={spec}
                        className="px-4 py-1.5 rounded-full text-sm bg-gradient-to-r from-blue-600 to-th-primary text-white font-medium shadow-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className={`text-sm font-semibold ${textMutedClass} mb-2 tracking-wider`}>CARE SETTING</h3>
                  <p className={textSecondaryClass}>
                    {selectedItem.result?.recommended_care_setting
                      ?.replace('-', ' ')
                      .toUpperCase() || 'Not specified'}
                  </p>
                </div>

                <div className="pt-6 border-t border-th-border/30">
                  <p className={`text-xs ${textMutedClass}`}>
                    Checked on {formatDate(selectedItem.timestamp)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-panel border-th-border/20 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="text-5xl mb-4 opacity-50">👈</div>
                <p className={`${textMutedClass} text-lg`}>Select an item from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
