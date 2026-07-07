import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeSymptoms } from '../api/client';
import { useUser } from '../contexts/UserContext';
import UserManager from './UserManager';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from './ui/Card';
import { cn } from '../lib/utils';

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

const getCoordinates = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        resolve({ lat: null, lng: null });
      },
      { timeout: 5000 }
    );
  });
};

export default function SymptomForm() {
  const navigate = useNavigate();
  const { users, currentUserId } = useUser();
  const [selectedUserId, setSelectedUserId] = useState(currentUserId);
  const [showUserManager, setShowUserManager] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    ageRange: '',
    gender: '',
    city: 'Mumbai',
    chronicConditions: [],
  });

  // Ensure current user is selected by default
  useEffect(() => {
    if (currentUserId && !selectedUserId) {
      setSelectedUserId(currentUserId);
    }
  }, [currentUserId, selectedUserId]);

  const allUsers = [
    { id: 'default', name: 'Default User' },
    ...users.filter((u) => u.id !== 'default'),
  ];

  const handleTextChange = (e) => {
    setFormData({ ...formData, text: e.target.value });
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
      toast.error('Please describe your symptoms.');
      return;
    }

    setLoading(true);

    const { lat, lng } = await getCoordinates();

    try {
      const response = await analyzeSymptoms({
        text: formData.text,
        ageRange: formData.ageRange || undefined,
        gender: formData.gender || undefined,
        city: formData.city || undefined,
        chronicConditions:
          formData.chronicConditions.length > 0 ? formData.chronicConditions : undefined,
        lat,
        lng,
      });

      const result = response.data.result;
      const clinics = response.data.nearby_clinics || [];

      toast.success('Symptoms analyzed successfully!');
      navigate('/result', { state: { result, city: formData.city, nearbyClinics: clinics } });
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.response?.data?.error || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const outlineLinkClassName = cn(
    'inline-flex items-center justify-center gap-2 rounded-full py-2 px-5 font-medium font-body-md text-sm',
    'bg-transparent border border-outline-variant hover:bg-surface-variant/20 text-on-surface hover:text-primary',
    'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
  );

  return (
    <>
    <Card className="w-full max-w-2xl mx-auto mt-8 glass-thick rounded-[32px]">
      <CardHeader className="border-b border-th-border/30 pb-4 mb-6">
        <CardTitle className="font-display text-2xl font-bold bg-gradient-to-r from-blue-600 to-th-primary bg-clip-text text-transparent">Symptom Assessment</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-th-text-secondary block">
                Select User <span className="text-th-error">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUserManager(true)}
                className="text-sm text-th-primary hover:text-blue-700 font-medium flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add User
              </button>
            </div>
            <Input
              type="select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              {allUsers.map((user) => (
                <option key={user.id} value={user.id} className="bg-surface-container-highest">
                  {user.name}
                </option>
              ))}
            </Input>
            <p className="text-xs text-on-surface-variant mt-1.5 opacity-70">
              Select which user these symptoms are for
            </p>
          </div>

          {/* User Manager Modal */}
          {showUserManager && <UserManager onClose={() => setShowUserManager(false)} />}

          {/* Symptoms Description */}
          <Input
            label="Describe your symptoms *"
            type="textarea"
            value={formData.text}
            onChange={handleTextChange}
            placeholder="E.g., I have had a sharp pain in my lower right abdomen since yesterday evening, accompanied by nausea..."
            inputClassName="h-32"
            required
          />

          {/* Demographics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Age Range"
              type="select"
              name="ageRange"
              value={formData.ageRange}
              onChange={handleSelectChange}
            >
              <option value="" className="bg-surface-container-highest">
                Select...
              </option>
              <option value="<12" className="bg-surface-container-highest">
                Below 12
              </option>
              <option value="12-18" className="bg-surface-container-highest">
                12-18
              </option>
              <option value="18-40" className="bg-surface-container-highest">
                18-40
              </option>
              <option value="40-60" className="bg-surface-container-highest">
                40-60
              </option>
              <option value=">60" className="bg-surface-container-highest">
                Above 60
              </option>
            </Input>

            <Input
              label="Gender"
              type="select"
              name="gender"
              value={formData.gender}
              onChange={handleSelectChange}
            >
              <option value="" className="bg-surface-container-highest">
                Prefer not to say
              </option>
              <option value="male" className="bg-surface-container-highest">
                Male
              </option>
              <option value="female" className="bg-surface-container-highest">
                Female
              </option>
              <option value="other" className="bg-surface-container-highest">
                Other
              </option>
            </Input>

            <Input
              label="City"
              type="select"
              name="city"
              value={formData.city}
              onChange={handleSelectChange}
              className="md:col-span-2"
            >
              <option value="Mumbai" className="bg-surface-container-highest">
                Mumbai
              </option>
              <option value="Pune" className="bg-surface-container-highest">
                Pune
              </option>
              <option value="Delhi" className="bg-surface-container-highest">
                Delhi
              </option>
            </Input>
          </div>

          {/* Chronic Conditions */}
          <div>
            <label className="text-sm font-semibold text-th-text-secondary block mb-3">
              Chronic Conditions (if any)
            </label>
            <div className="flex flex-wrap gap-2">
              {CHRONIC_CONDITIONS.map((condition) => {
                const isSelected = formData.chronicConditions.includes(condition);
                return (
                  <Button
                    key={condition}
                    type="button"
                    onClick={() => handleConditionToggle(condition)}
                    variant={isSelected ? 'default' : 'outline'}
                    className="py-1.5 px-4 text-xs font-semibold rounded-full"
                  >
                    {condition}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              loading={loading}
              className={`w-full flex items-center justify-center gap-2 text-lg font-bold ${loading ? 'animate-pulse' : ''}`}
            >
              <span>{loading ? 'Analyzing Symptoms...' : 'Get Guidance'}</span>
              {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    </>
  );
}
