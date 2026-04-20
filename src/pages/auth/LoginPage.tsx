import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, isAuthenticated } = useAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/tickets', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
    } catch (err: any) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Invalid email or password.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const appSlug = (settings.appName || 'vuradesk').toLowerCase();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100 dark:bg-background-main font-sans">
      {/* Left Panel */}
      <div
        className="relative h-full min-h-[300px] lg:min-h-screen flex items-center justify-center p-8 text-white text-center bg-gradient-to-b from-[#0f172a] to-[#020617]"
      >
        <div className="relative z-10 max-w-md">
          <img src={settings.logoUrl || '/src/assets/logo.png'} alt="VuraDesk Logo" className="h-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome to {settings.appName}</h1>
          {settings.loginTagline && (
            <p className="mt-2 text-lg text-slate-200">
              {settings.loginTagline}
            </p>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8 lg:p-16">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-slate-900 tracking-tight">Login to {settings.appName}</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-left w-full text-sm font-bold text-slate-900 tracking-tight mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-left w-full text-sm font-bold text-slate-900 tracking-tight">Password</label>
                <Link to={`/${appSlug}/public/forgot-password`} className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                style={{ backgroundColor: 'var(--primary-brand)' }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Navigation Links */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center space-y-4">
            <span className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to={`/${appSlug}/public/register`} className="font-bold hover:underline underline-offset-2 transition-all" style={{ color: 'var(--primary-brand)' }}>
                Register here
              </Link>
            </span>

            <Link to={`/${appSlug}/public/submit-ticket`} className="text-xs font-medium text-slate-600 hover:text-slate-700 transition-colors flex items-center">
              Need help? Submit a support ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
