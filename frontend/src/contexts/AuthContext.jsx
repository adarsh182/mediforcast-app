import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const savedProfile = localStorage.getItem('sumo_profile');
    const authStatus = localStorage.getItem('sumo_authenticated');
    
    if (authStatus === 'true' && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setCurrentProfile(profile);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error loading profile:', e);
        localStorage.removeItem('sumo_profile');
        localStorage.removeItem('sumo_authenticated');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Simple authentication - in production, this would call an API
    // For now, we'll use localStorage
    const profiles = JSON.parse(localStorage.getItem('sumo_profiles') || '[]');
    const profile = profiles.find(p => p.email === email);
    
    if (!profile) {
      return { success: false, error: 'Email not found. Please sign up first.' };
    }
    
    // Simple password check (in production, use proper hashing)
    if (profile.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }
    
    setCurrentProfile(profile);
    setIsAuthenticated(true);
    localStorage.setItem('sumo_profile', JSON.stringify(profile));
    localStorage.setItem('sumo_authenticated', 'true');
    
    return { success: true, redirectTo: '/' };
  };

  const signup = (name, email, password) => {
    const profiles = JSON.parse(localStorage.getItem('sumo_profiles') || '[]');
    
    // Check if email already exists
    if (profiles.find(p => p.email === email)) {
      return { success: false, error: 'Email already registered. Please login instead.' };
    }
    
    const newProfile = {
      id: `profile_${Date.now()}`,
      name,
      email,
      password, // In production, hash this!
      createdAt: new Date().toISOString(),
    };
    
    profiles.push(newProfile);
    localStorage.setItem('sumo_profiles', JSON.stringify(profiles));
    
    setCurrentProfile(newProfile);
    setIsAuthenticated(true);
    localStorage.setItem('sumo_profile', JSON.stringify(newProfile));
    localStorage.setItem('sumo_authenticated', 'true');
    
    return { success: true, redirectTo: '/' };
  };

  const logout = () => {
    setCurrentProfile(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sumo_profile');
    localStorage.removeItem('sumo_authenticated');
  };

  const updateProfile = (updates) => {
    const updatedProfile = { ...currentProfile, ...updates };
    setCurrentProfile(updatedProfile);
    localStorage.setItem('sumo_profile', JSON.stringify(updatedProfile));
    
    // Update in profiles list
    const profiles = JSON.parse(localStorage.getItem('sumo_profiles') || '[]');
    const updatedProfiles = profiles.map(p => 
      p.id === updatedProfile.id ? updatedProfile : p
    );
    localStorage.setItem('sumo_profiles', JSON.stringify(updatedProfiles));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentProfile,
        loading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

