import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import UserManager from '../components/UserManager';

import AnimatedPage from "../components/AnimatedPage";

export default function Profile() {
  const navigate = useNavigate();
  const { currentProfile, logout, updateProfile } = useAuth();
  const { users } = useUser();
  const { theme } = useTheme();
  const [showUserManager, setShowUserManager] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentProfile?.name || '',
    email: currentProfile?.email || '',
  });

  const bgClass = 'bg-th-card border-th-border';
  const textClass = 'text-th-text';
  const textSecondaryClass = 'text-th-text-secondary';
  const textMutedClass = 'text-th-text-muted';

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
  const allUsers = users.filter((u) => u.id !== 'default');

  return (
    <AnimatedPage className="space-y-6">
      {/* Profile Header */}
      <div className="glass-panel border-th-border/20 rounded-3xl p-8 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-th-primary">My Profile</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full text-sm font-semibold transition-colors cursor-pointer dark:bg-red-900/20 dark:border-red-800/50 dark:hover:bg-red-900/40"
          >
            Logout
          </button>
        </div>

        {!editingProfile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-6 mb-6">
              {currentProfile?.avatarUrl ? (
                <img 
                  src={currentProfile.avatarUrl} 
                  alt="Profile Avatar" 
                  className="rounded-full w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg object-cover" 
                />
              ) : (
                <div className="rounded-full w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-br from-blue-100 to-th-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-blue-600">person</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-display font-semibold text-th-text truncate">{currentProfile?.name || 'Set your name'}</p>
                <p className="text-th-text-secondary break-all">{currentProfile?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="px-6 py-2.5 bg-white dark:bg-black/40 border border-th-border/30 hover:border-th-primary text-th-primary rounded-full text-sm font-semibold transition-all shadow-sm cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-th-text-secondary mb-1">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-white/50 dark:bg-black/30 border border-th-border rounded-xl px-4 py-2 text-th-text focus:outline-none focus:ring-2 focus:ring-th-primary transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-th-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full bg-surface-variant/20 border border-th-border/50 rounded-xl px-4 py-2 text-th-text-muted cursor-not-allowed opacity-70"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-th-primary hover:from-blue-700 hover:to-blue-800 text-white rounded-full text-sm font-semibold transition-all shadow-md cursor-pointer border-none"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(false);
                  setProfileData({
                    name: currentProfile?.name || '',
                    email: currentProfile?.email || '',
                  });
                }}
                className="px-6 py-2 bg-th-cancel-bg hover:opacity-80 text-th-cancel-text rounded-full text-sm font-semibold transition-all cursor-pointer border-none"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* User Manager Section */}
      <div className="glass-panel border-th-border/20 rounded-3xl p-8 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-th-primary">Family & Profiles</h2>
            <p className="text-sm text-th-text-secondary mt-1">Manage profiles for yourself and family members</p>
          </div>
          <button
            onClick={() => setShowUserManager(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-th-primary hover:from-blue-700 hover:to-blue-800 text-white rounded-full text-sm font-semibold transition-all shadow-md flex items-center gap-2 border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Member
          </button>
        </div>

        {allUsers.length === 0 ? (
          <div className="text-center py-12 bg-white/20 dark:bg-black/20 rounded-2xl border border-th-border/10">
            <span className="material-symbols-outlined text-4xl text-th-text-muted mb-2">group</span>
            <p className="text-th-text-secondary">No additional profiles yet.</p>
            <p className="text-sm text-th-text-muted">Add family members to keep their symptom history separate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="glass-panel border border-th-border/30 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 relative group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-bold font-display shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-th-text leading-tight">{user.name}</h3>
                      <p className="text-xs text-th-text-secondary capitalize">{user.relationship || 'Self'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1.5 mb-4">
                  {user.age && (
                    <p className="text-sm text-th-text-secondary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] opacity-70">cake</span> {user.age} years
                    </p>
                  )}
                  {user.gender && (
                    <p className="text-sm text-th-text-secondary flex items-center gap-2 capitalize">
                      <span className="material-symbols-outlined text-[16px] opacity-70">person</span> {user.gender}
                    </p>
                  )}
                  {user.city && (
                    <p className="text-sm text-th-text-secondary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] opacity-70">location_on</span> {user.city}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-th-border/20 flex gap-2">
                  <button
                    onClick={() => handleViewUserHistory(user.id)}
                    className="flex-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 rounded-lg text-xs font-semibold transition-colors border border-blue-200 dark:border-blue-800/30 cursor-pointer"
                  >
                    View History
                  </button>
                  <button
                    onClick={() => {
                      setShowUserManager(true);
                    }}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-black/40 hover:bg-surface-variant text-th-text-secondary rounded-lg text-xs font-medium transition-colors border border-th-border/30 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUserManager && <UserManager onClose={() => setShowUserManager(false)} />}
    </AnimatedPage>
  );
}
