import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100 dark:bg-background-main">
      {/* Left Panel */}
      <div
        className="relative h-full min-h-[300px] lg:min-h-screen bg-cover bg-center flex items-center justify-center p-8 text-white text-center bg-slate-900"
        style={{ backgroundImage: `url(${settings.logoUrl || '/src/assets/logo.png'})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold mb-4">Welcome to {settings.appName}</h1>
          {settings.loginTagline && (
            <p className="mt-2 text-lg text-slate-200">
              {settings.loginTagline}
            </p>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8 lg:p-16">
        <div className="bg-white dark:bg-card-bg p-10 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-text-main">Login to {settings.appName}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 dark:text-text-muted text-sm font-semibold mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 dark:bg-slate-800 dark:border-slate-700"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="mb-8">
              <label htmlFor="password" className="block text-gray-700 dark:text-text-muted text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  id="password"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 dark:bg-slate-800 dark:border-slate-700"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-blue-300"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            <div className="text-center">
              <a
                className="inline-block align-baseline font-semibold text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                href="#"
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
