import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { currentProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-mesh-gradient text-th-text min-h-screen pb-[90px] md:pb-0 font-sans flex flex-col transition-colors duration-300">
      {/* TopNavBar (Desktop) */}
      <nav className="fixed top-0 w-full h-[64px] z-50 glass-thin border-x-0 border-t-0 hidden md:flex rounded-none">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full h-full">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 font-display text-2xl font-bold text-th-primary cursor-pointer focus:outline-none bg-transparent border-none"
          >
            <Logo className="w-10 h-10 shrink-0" />
            <span className="tracking-tight">SUMO</span>
          </button>

          {/* Web Nav Links */}
          <div className="flex gap-6 items-center">
            <button
              onClick={() => navigate('/')}
              className={`font-body-md text-body-md transition-all duration-150 cursor-pointer bg-transparent border-none ${
                isActive('/')
                  ? 'text-primary font-bold border-b-2 border-primary pb-1 opacity-100'
                  : 'text-on-surface-variant font-medium hover:text-primary opacity-80'
              }`}
            >
              Assess
            </button>
            <button
              onClick={() => navigate('/history')}
              className={`font-body-md text-body-md transition-all duration-150 cursor-pointer bg-transparent border-none ${
                isActive('/history')
                  ? 'text-primary font-bold border-b-2 border-primary pb-1 opacity-100'
                  : 'text-on-surface-variant font-medium hover:text-primary opacity-80'
              }`}
            >
              History
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`font-body-md text-body-md transition-all duration-150 cursor-pointer bg-transparent border-none ${
                isActive('/profile')
                  ? 'text-primary font-bold border-b-2 border-primary pb-1 opacity-100'
                  : 'text-on-surface-variant font-medium hover:text-primary opacity-80'
              }`}
            >
              Profile
            </button>
          </div>

          {/* Trailing Icons */}
          <div className="flex gap-4 items-center">
            <button
              onClick={toggleTheme}
              className="text-primary dark:text-primary-fixed hover:text-primary transition-colors duration-200 cursor-pointer p-1.5 rounded-full hover:bg-surface-variant/30 bg-transparent border-none"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="text-primary dark:text-primary-fixed hover:text-primary transition-colors duration-200 cursor-pointer p-1.5 rounded-full hover:bg-surface-variant/30 flex items-center gap-1 bg-transparent border-none"
              title={`${currentProfile?.name || 'User'} Profile`}
            >
              <span className="material-symbols-outlined">account_circle</span>
              <span className="text-xs font-medium hidden lg:inline">
                {currentProfile?.name || 'Profile'}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="text-error hover:text-error/80 transition-colors duration-200 cursor-pointer p-1.5 rounded-full hover:bg-error-container/20 bg-transparent border-none"
              title="Logout"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile TopNav (Logo and Name) */}
      <nav className="md:hidden fixed top-0 w-full h-[64px] z-50 glass-thin border-x-0 border-t-0 flex justify-between items-center px-margin-mobile rounded-none">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed cursor-pointer bg-transparent border-none"
        >
          <Logo className="h-8 w-8 shrink-0" />
          <span>SUMO</span>
        </button>
        <div className="flex gap-2 items-center">
          <button
            onClick={toggleTheme}
            className="text-th-text-secondary hover:text-th-primary hover:rotate-180 transition-all duration-300 cursor-pointer p-1.5 rounded-full bg-transparent border-none"
            aria-label="Toggle Theme"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="text-th-primary hover:opacity-80 transition-opacity duration-200 cursor-pointer p-1.5 rounded-full bg-transparent border-none"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-[88px] md:pt-[104px] flex-grow w-full">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-th-border mt-16 bg-th-card py-8">
        <div className="max-w-container-max mx-auto px-margin-desktop text-center font-sans text-sm text-th-text-secondary">
          <p>
            © 2026 SUMO (Symptom Urgency & Medical Outreach). This is a guidance tool, not a medical
            diagnosis.
          </p>
          <p className="mt-2 text-xs opacity-60">
            Always consult qualified healthcare professionals for medical advice.
          </p>
        </div>
      </footer>

      {/* Mobile Floating Bottom Nav */}
      <nav className="md:hidden fixed bottom-8 left-4 right-4 z-50">
        <div className="glass-thick rounded-[32px] flex justify-around items-center p-2 mx-auto max-w-[360px]">
          {[
            { path: '/', icon: 'medical_services', label: 'Assess' },
            { path: '/history', icon: 'history', label: 'History' },
            { path: '/profile', icon: 'person', label: 'Profile' },
          ].map((item) => (
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-16 rounded-[24px] transition-colors cursor-pointer bg-transparent border-none z-10"
            >
              {isActive(item.path) && (
                <motion.div
                  layoutId="mobileNavBubble"
                  className="absolute inset-0 bg-th-primary/20 dark:bg-th-primary/30 rounded-[24px] -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                />
              )}
              <span
                className={`material-symbols-outlined text-[28px] transition-colors ${
                  isActive(item.path) ? 'text-th-primary drop-shadow-[0_2px_4px_rgba(59,130,246,0.5)]' : 'text-th-text-muted'
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] font-semibold mt-1 transition-colors ${
                  isActive(item.path) ? 'text-th-primary' : 'text-th-text-muted'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleLogout}
            className="relative flex flex-col items-center justify-center w-16 h-16 rounded-[24px] transition-colors cursor-pointer bg-transparent border-none z-10"
          >
            <span className="material-symbols-outlined text-[28px] text-red-400">logout</span>
            <span className="text-[10px] font-semibold mt-1 text-red-400">Logout</span>
          </motion.button>
        </div>
      </nav>
    </div>
  );
}
