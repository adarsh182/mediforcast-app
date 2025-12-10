import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { currentProfile } = useAuth();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 shadow-lg`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-start gap-0 font-bold transition-colors ${
              theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏥</span>
              <span className="text-xl">SUMO</span>
            </div>
            <span className="text-xs font-normal opacity-75">Symptom Urgency & Medical Outreach</span>
          </button>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => navigate('/profile')}
              className={`text-sm transition-colors flex items-center gap-1 ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              } ${location.pathname === '/profile' ? 'font-semibold' : ''}`}
              title="View Profile"
            >
              <span>👤</span>
              <span className="hidden sm:inline">{currentProfile?.name || 'Profile'}</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className={`text-sm transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              } ${location.pathname === '/' ? 'font-semibold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-600'} border-t mt-12`}>
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm">
          <p>© 2025 SUMO (Symptom Urgency & Medical Outreach). This is a guidance tool, not a medical diagnosis.</p>
          <p className="mt-2 text-xs">Always consult qualified healthcare professionals for medical advice.</p>
        </div>
      </footer>
    </div>
  );
}
