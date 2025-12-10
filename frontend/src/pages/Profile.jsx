import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import UserManager from '../components/UserManager';

export default function Profile() {
  const navigate = useNavigate();
  const { currentProfile, logout, updateProfile } = useAuth();
  const { users, currentUserId, currentUser, switchUser } = useUser();
  const { theme } = useTheme();
  const [showUserManager, setShowUserManager] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentProfile?.name || '',
    email: currentProfile?.email || '',
  });

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const textMutedClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileData);
    setEditingProfile(false);
  };

  const handleViewUserHistory = (userId) => {
    navigate('/history', { state: { userId } });
  };

  // Only show added users, not default user
  const allUsers = users.filter(u => u.id !== 'default');

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className={`${bgClass} border rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold ${textClass}`}>My Profile</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {editingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textSecondaryClass}`}>
                Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className={`w-full p-2 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} rounded border`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textSecondaryClass}`}>
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className={`w-full p-2 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} rounded border`}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(false);
                  setProfileData({ name: currentProfile?.name || '', email: currentProfile?.email || '' });
                }}
                className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${textClass} rounded`}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="mb-4">
              <p className={`text-sm ${textMutedClass}`}>Name</p>
              <p className={`text-lg ${textClass}`}>{currentProfile?.name || 'Not set'}</p>
            </div>
            <div className="mb-4">
              <p className={`text-sm ${textMutedClass}`}>Email</p>
              <p className={`text-lg ${textClass}`}>{currentProfile?.email || 'Not set'}</p>
            </div>
            <button
              onClick={() => {
                setProfileData({ name: currentProfile?.name || '', email: currentProfile?.email || '' });
                setEditingProfile(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Users Section */}
      <div className={`${bgClass} border rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${textClass}`}>Family Members & Users</h2>
            <p className={`text-sm ${textMutedClass} mt-1`}>
              Manage users and view their symptom history
            </p>
          </div>
          <button
            onClick={() => setShowUserManager(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
          >
            + Add User
          </button>
        </div>


        {allUsers.length === 0 ? (
          <div className={`text-center py-8 ${textSecondaryClass}`}>
            <p className="mb-2">No family members added yet.</p>
            <p className={`text-sm ${textMutedClass}`}>
              Click "Add User" to add family members and manage their symptom history separately.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className={`${bgClass} border rounded-lg p-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${textClass}`}>{user.name}</h3>
                    </div>
                    {(user.age || user.gender) && (
                      <p className={`text-sm ${textSecondaryClass}`}>
                        {user.age && `Age: ${user.age}`}
                        {user.age && user.gender && ' • '}
                        {user.gender && `Gender: ${user.gender}`}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleViewUserHistory(user.id)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View History
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Manager Modal */}
      {showUserManager && <UserManager onClose={() => setShowUserManager(false)} />}
    </div>
  );
}

