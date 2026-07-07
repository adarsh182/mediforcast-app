import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, signInWithGoogle, signInAsGuest, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          toast.error('Please enter your name');
          setLoading(false);
          return;
        }
        result = await signup(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        toast.success(isLogin ? 'Successfully authenticated!' : 'Account created successfully!');
        navigate(result.redirectTo || '/');
      } else {
        toast.error(result.error);
      }
    } catch (_err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        toast.success('Successfully signed in with Google!');
      } else {
        toast.error(result.error);
      }
    } catch (_err) {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    signInAsGuest();
    toast.success('Signed in as Guest User');
    navigate('/');
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex items-center justify-center relative overflow-hidden px-margin-mobile">
      {/* Minimalist Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-[480px] z-10 py-8">
        {/* Login Card */}
        <Card>
          <CardContent className="space-y-0">
            {/* Branding */}
            <div className="text-center mb-8 flex flex-col items-center justify-center">
              <img
                alt="SUMO Logo"
                className="h-16 w-auto mx-auto mb-2 text-primary"
                src="https://lh3.googleusercontent.com/aida/AP1WRLv06YBhyEE8ethG4TEs_N77vFMWf20L0RBpuCxq4ffEVmStqbKWxvaK-Fp-mhHGNoJew2L-HNNJMKMTJrdFw4AwWAiFFucOUgTtAyX9DWAUPAtvllyH3bjt8ZJ669WS10QAEx_k5KuyDzaIYEhGSoUxwpKe0dcym0ADHVfcLzmMga2NLRaupEKs_nPxLl_MGjfTxb2lbQt4TwYi9RnVBKC1o8bOpA59s_-yiSqIr9mRAEArb_pEMWzamas"
              />
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                SUMO
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Clinical Assessment Platform
              </p>
            </div>

            {/* Tab Selection */}
            <div className="flex gap-2 mb-6 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setFormData({ name: '', email: '', password: '' });
                }}
                className={`flex-grow py-2 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer border-none ${
                  isLogin
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface bg-transparent'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setFormData({ name: '', email: '', password: '' });
                }}
                className={`flex-grow py-2 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer border-none ${
                  !isLogin
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface bg-transparent'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <Input
                  label="Full Name"
                  id="name"
                  name="name"
                  placeholder="Dr. Jane Doe"
                  icon="person"
                  required={!isLogin}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              )}

              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="provider@hospital.org"
                icon="mail"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon="lock"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              {/* Form Actions */}
              <div className="pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full flex items-center justify-center gap-2 font-medium"
                >
                  <span>{isLogin ? 'Authenticate' : 'Create Account'}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="px-4 font-label-caps text-[10px] tracking-widest text-on-surface-variant opacity-60">
                OR
              </span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            {/* Social / Guest Logins */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3.5 px-6 rounded-full border border-gray-300 transition-colors flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <Button
                variant="outline"
                onClick={handleGuestSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">patient_list</span>
                <span>Continue as Guest</span>
              </Button>
            </div>

            <div className="mt-8 p-4 bg-surface-container-low border border-outline-variant rounded-xl flex gap-3 items-start">
              <span className="material-symbols-outlined text-on-surface-variant text-xl shrink-0">
                info
              </span>
              <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                This platform uses AI for preliminary guidance. AI-generated insights may be
                inaccurate; always verify with clinical documentation.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined text-md">shield</span>
          <span className="font-label-caps text-[10px] tracking-wider font-semibold">
            HIPAA COMPLIANT SECURE ASSESSMENT
          </span>
        </div>
      </main>
    </div>
  );
}
