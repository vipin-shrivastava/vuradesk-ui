import React, { useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'; // Lucide icons
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import api from '@/services/api'; // Use the alias for api service

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePasswordKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.getModifierState('CapsLock')) {
      setCapsLockOn(true);
    } else {
      setCapsLockOn(false);
    }
  };

  const handlePasswordKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!event.getModifierState('CapsLock')) {
      setCapsLockOn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role } = response.data;

      localStorage.setItem('jwtToken', token);
      localStorage.setItem('userRole', role);
      if (rememberMe) {
        localStorage.setItem('rememberMeEmail', email);
      } else {
        localStorage.removeItem('rememberMeEmail');
      }

      if (onLoginSuccess) {
        onLoginSuccess();
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input Group */}
      <div className="space-y-1"> {/* Reduced gap */}
        <Label htmlFor="email" className="text-slate-800 text-sm font-semibold">Email</Label> {/* Label Styling */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00A3E0]" /> {/* Icon color */}
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="pl-10 pr-3 py-2 bg-uv-bg border border-uv-border rounded-sm focus:ring-uv-blue focus:border-uv-blue text-[14px] h-9"
            required
          />
        </div>
      </div>

      {/* Password Input Group */}
      <div className="space-y-1"> {/* Reduced gap */}
        <Label htmlFor="password" className="text-slate-800 text-sm font-semibold">Password</Label> {/* Label Styling */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00A3E0]" /> {/* Icon color */}
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handlePasswordKeyDown}
            onKeyUp={handlePasswordKeyUp}
            disabled={loading}
            className="pl-10 pr-10 py-2 bg-uv-bg border border-uv-border rounded-sm focus:ring-uv-blue focus:border-uv-blue text-[14px] h-9"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00A3E0] hover:text-[#008BBE]" // Password Eye Icon Color
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {capsLockOn && (
          <p className="text-sm text-red-500 mt-1">Caps Lock is On</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm w-full"> {/* Added w-full */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={loading}
            className="border-uv-border data-[state=checked]:bg-[#00A3E0] data-[state=checked]:border-[#00A3E0] h-4 w-4" // Checkbox Color
          />
          <Label htmlFor="remember-me" className="text-slate-700 text-sm font-medium cursor-pointer">Remember me</Label> {/* Label text-sm */}
        </div>
        <a href="#" className="text-uv-blue hover:text-uv-blue-hover text-sm font-medium"> {/* Link text-sm */}
          Forgot Password?
        </a>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {/* Sign In Button */}
      <div className="flex justify-center mt-6"> {/* Button Centering and increased margin-top */}
        <Button
          type="submit"
          className="w-fit px-12 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-sm transition-colors duration-200 h-9" // Button Styling
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </div>

      {/* Create Account Link Footer */}
      <p className="text-center text-sm text-slate-600 mt-8"> {/* Footer Spacing */}
        New to VuraDesk?{' '}
        <a href="#" className="text-uv-blue hover:text-uv-blue-hover font-medium">
          Create an account
        </a>
      </p>
    </form>
  );
};

export default LoginForm;
