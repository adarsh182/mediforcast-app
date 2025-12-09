import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSymptoms } from '../api/client';
import LoadingSpinner from './LoadingSpinner';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    text: '',
    ageRange: '',
    gender: '',
    city: 'Mumbai',
    chronicConditions: [],
  });

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

      // Save to localStorage
      const checks = JSON.parse(localStorage.getItem('symptom_checks') || '[]');
      checks.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        symptoms: formData.text,
      });
      localStorage.setItem('symptom_checks', JSON.stringify(checks.slice(0, 10)));

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
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-700">
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          Describe your symptoms <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.text}
          onChange={handleTextChange}
          placeholder="E.g., I have a persistent cough for 3 days, mild fever, and a sore throat..."
          className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Be as descriptive as possible. Duration, severity, and associated symptoms help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">Age Range</label>
          <select
            name="ageRange"
            value={formData.ageRange}
            onChange={handleSelectChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-semibold mb-2 text-gray-300">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleSelectChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleSelectChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3 text-gray-300">Chronic Conditions (if any)</label>
        <div className="flex flex-wrap gap-2">
          {CHRONIC_CONDITIONS.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => handleConditionToggle(condition)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                formData.chronicConditions.includes(condition)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
