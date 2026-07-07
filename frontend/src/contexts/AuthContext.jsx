import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

function mapSupabaseUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Profile',
    email: user.email || '',
    avatarUrl: user.user_metadata?.avatar_url || null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (sessionStorage.getItem('guest_login') === 'true') {
      setCurrentProfile({
        id: 'guest_user',
        name: sessionStorage.getItem('guest_name') || 'Guest User',
        email: 'guest@example.com',
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsAuthenticated(true);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const authStatus = localStorage.getItem('sumo_authenticated');
    const savedProfile = localStorage.getItem('sumo_profile');
    if (authStatus === 'true' && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setCurrentProfile(profile);
        setIsAuthenticated(true);
        setLoading(false);
        return () => {
          mounted = false;
        };
      } catch (e) {
        console.error('Error loading local profile:', e);
      }
    }

    if (!supabase) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    const bootstrapAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error('Error loading Supabase session:', error);
      }

      const sessionUser = data.session?.user || null;
      if (sessionUser) {
        setCurrentProfile(mapSupabaseUser(sessionUser));
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    bootstrapAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      const sessionUser = session?.user || null;
      if (sessionUser) {
        setCurrentProfile(mapSupabaseUser(sessionUser));
        setIsAuthenticated(true);
      } else if (
        sessionStorage.getItem('guest_login') !== 'true' &&
        localStorage.getItem('sumo_authenticated') !== 'true'
      ) {
        setCurrentProfile(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      return {
        success: false,
        error:
          'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Unable to start Google sign-in.',
        };
      }

      return { success: true, redirectTo: '/' };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unable to start Google sign-in.',
      };
    }
  };

  const signInAsGuest = () => {
    sessionStorage.setItem('guest_login', 'true');
    sessionStorage.setItem('guest_name', 'Guest User');
    const guestProfile = {
      id: 'guest_user',
      name: 'Guest User',
      email: 'guest@example.com',
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentProfile(guestProfile);
    setIsAuthenticated(true);
    setLoading(false);
    return { success: true };
  };

  const login = (email, password) => {
    const profiles = JSON.parse(localStorage.getItem('sumo_profiles') || '[]');
    const profile = profiles.find((p) => p.email === email);

    if (!profile) {
      return { success: false, error: 'Email not found. Please sign up first.' };
    }

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

    if (profiles.find((p) => p.email === email)) {
      return { success: false, error: 'Email already registered. Please login instead.' };
    }

    const newProfile = {
      id: `profile_${Date.now()}`,
      name,
      email,
      password,
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

  const logout = async () => {
    sessionStorage.removeItem('guest_login');
    sessionStorage.removeItem('guest_name');
    localStorage.removeItem('sumo_profile');
    localStorage.removeItem('sumo_authenticated');
    if (!supabase) {
      setCurrentProfile(null);
      setIsAuthenticated(false);
      return;
    }

    await supabase.auth.signOut();
    setCurrentProfile(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates) => {
    const nextName = updates?.name?.trim();

    if (!nextName) {
      return { success: false, error: 'Name is required.' };
    }

    if (sessionStorage.getItem('guest_login') === 'true') {
      sessionStorage.setItem('guest_name', nextName);
      const updatedProfile = {
        ...currentProfile,
        name: nextName,
        updatedAt: new Date().toISOString(),
      };
      setCurrentProfile(updatedProfile);
      return { success: true, profile: updatedProfile };
    }

    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: nextName,
        name: nextName,
      },
    });

    if (error) {
      return { success: false, error: error.message || 'Unable to update profile.' };
    }

    const updatedProfile = mapSupabaseUser(data.user);
    setCurrentProfile(updatedProfile);

    return { success: true, profile: updatedProfile };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentProfile,
        loading,
        signInWithGoogle,
        signInAsGuest,
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
