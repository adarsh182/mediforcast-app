import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSymptoms } from '../api/client';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import UserManager from './UserManager';

const CHRONIC_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Heart Disease',
  'Arthritis',
  'Thyroid',
  'Kidney Disease',
  'Liver Disease',
];

export default function SymptomForm() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { users, currentUserId } = useUser();
  const [selectedUserId, setSelectedUserId] = useState(currentUserId);
  const [showUserManager, setShowUserManager] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    text: '',
    ageRange: '',
    gender: '',
    city: 'Mumbai',
    chronicConditions: [],
  });

  // Update selected user when current user changes or users list changes
  useEffect(() => {
    setSelectedUserId(currentUserId);
  }, [currentUserId, users]);

  // Get all users including default - this will update automatically when users change
  const allUsers = [
    { id: 'default', name: 'Default User' },
    ...users.filter(u => u.id !== 'default'),
  ];

  const bgClass = theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const inputBgClass = theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const textMutedClass = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const buttonInactiveClass = theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300';

  const handleTextChange = (e) => {
    setFormData({ ...formData, text: e.target.value });
    setError('');
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleConditionToggle = (condition) => {
    const updatedConditions = formData.chronicConditions.includes(condition)
      ? formData.chronicConditions.filter((c) => c !== condition)
      : [...formData.chronicConditions, condition];
    setFormData({ ...formData, chronicConditions: updatedConditions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      setError('Please describe your symptoms.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await analyzeSymptoms({
        text: formData.text,
        ageRange: formData.ageRange || undefined,
        gender: formData.gender || undefined,
        city: formData.city || undefined,
        chronicConditions: formData.chronicConditions.length > 0 ? formData.chronicConditions : undefined,
      });

      // Save to localStorage with full result data (per selected user)
      const historyKey = `sumo_history_${selectedUserId}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      history.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        symptoms: formData.text,
        city: formData.city,
        formData: {
          ageRange: formData.ageRange,
          gender: formData.gender,
          chronicConditions: formData.chronicConditions,
        },
        result: response.data.result,
      });
      // Keep only last 50 entries per user
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 50)));

      // Navigate to result
      navigate('/result', {
        state: {
          result: response.data.result,
          city: formData.city,
        },
      });
    } catch (err) {
      console.error('Error:', err);
      setError(
        err.response?.data?.error ||
        'Failed to analyze symptoms. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${bgClass} rounded-lg p-6 shadow-lg border`}>
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* User Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className={`block text-sm font-semibold ${labelClass}`}>
            Select User <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowUserManager(true)}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>+</span> Add User
          </button>
        </div>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className={`w-full p-3 ${inputBgClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          required
        >
          {allUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <p className={`text-xs ${textMutedClass} mt-1`}>
          Select which user these symptoms are for
        </p>
      </div>

      {/* User Manager Modal */}
      {showUserManager && (
        <UserManager
          onClose={() => setShowUserManager(false)}
        />
      )}

      <div className="mb-6">
        <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>
          Describe your symptoms <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.text}
          onChange={handleTextChange}
          placeholder="E.g., I have a persistent cough for 3 days, mild fever, and a sore throat..."
          className={`w-full h-32 p-3 ${inputBgClass} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <p className={`text-xs ${textMutedClass} mt-1`}>
          Be as descriptive as possible. Duration, severity, and associated symptoms help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Age Range</label>
          <select
            name="ageRange"
            value={formData.ageRange}
            onChange={handleSelectChange}
            className={`w-full p-2 ${inputBgClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select...</option>
            <option value="<12">Below 12</option>
            <option value="12-18">12-18</option>
            <option value="18-40">18-40</option>
            <option value="40-60">40-60</option>
            <option value=">60">Above 60</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleSelectChange}
            className={`w-full p-2 ${inputBgClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-semibold mb-2 ${labelClass}`}>City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleSelectChange}
            className={`w-full p-2 ${inputBgClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className={`block text-sm font-semibold mb-3 ${labelClass}`}>Chronic Conditions (if any)</label>
        <div className="flex flex-wrap gap-2">
          {CHRONIC_CONDITIONS.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => handleConditionToggle(condition)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                formData.chronicConditions.includes(condition)
                  ? 'bg-blue-600 text-white'
                  : buttonInactiveClass
              }`}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
      >
        {loading ? 'Analyzing...' : 'Get Guidance'}
      </button>

      {loading && <LoadingSpinner />}
    </form>
  );
}
