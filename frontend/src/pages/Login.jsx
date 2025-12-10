import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const inputBgClass = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        result = signup(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        navigate(result.redirectTo || '/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`${bgClass} border rounded-lg p-8 max-w-md w-full shadow-lg`}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className={`text-3xl font-bold ${textClass} mb-2`}>SUMO</h1>
          <p className={`text-sm ${textSecondaryClass}`}>Symptom Urgency & Medical Outreach</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
              setFormData({ name: '', email: '', password: '' });
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isLogin
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
              setFormData({ name: '', email: '', password: '' });
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !isLogin
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textSecondaryClass}`}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full p-3 ${inputBgClass} rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter your name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-semibold mb-2 ${textSecondaryClass}`}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-3 ${inputBgClass} rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${textSecondaryClass}`}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full p-3 ${inputBgClass} rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your password"
              required
              minLength={6}
            />
            {!isLogin && (
              <p className={`text-xs ${textSecondaryClass} mt-1`}>
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${textSecondaryClass}`}>
          <p>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

