import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Import the useAuth hook
import axiosClient from '@/api/axiosClient'; // Import the correct axios client
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // Add loading state
  const { login } = useAuth(); // Get the login function from the context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Disable button on submission

    try {
      const response = await axiosClient.post('/auth/login', { email, password });

      // The login function in AuthContext now handles the redirect logic
      // based on the presence of a default role.
      const { token, user } = response.data;
      login(token, user);

    } catch (err: any) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Invalid email or password.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Re-enable button after request is complete
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full sm:max-w-md md:max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login to VuraDesk</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <a
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
