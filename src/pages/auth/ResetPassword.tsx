import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react'; // Added Loader2
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import axiosClient from '@/api/axiosClient'; // Import axiosClient
import { toast } from 'sonner'; // Assuming sonner is used for toasts

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false); // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    setToken(tokenFromUrl);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!token) {
      setError("No reset token found. Please use the forgot password link.");
      toast.error("No reset token found.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post('/auth/reset-password', {
        token: token,
        newPassword: newPassword,
      });
      console.log("Password reset successful:", response.data); // Success feedback
      toast.success("Your password has been reset successfully!");
      navigate('/login'); // Redirect to login page on success
    } catch (err: any) {
      console.error('Password reset failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-uv-navy p-4">
      <Card className="w-full max-w-md border-uv-border shadow-sm rounded-sm overflow-hidden">
        <div className="h-2 bg-uv-blue"></div>
        <CardHeader className="bg-uv-bg pt-2 pb-4 border-b border-uv-border">
          <div className="flex flex-col items-center gap-1">
            <Mail className="h-10 w-10 text-uv-blue" />
            <CardTitle className="text-xl font-bold text-slate-800">Reset Password</CardTitle>
            <p className="text-sm text-slate-500 text-center">Set your new password.</p>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          {token ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full bg-uv-blue hover:bg-uv-blue/90 text-white" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
              <div className="text-center text-sm">
                <Link to="/login" className="text-uv-blue hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center text-red-500">
              No reset token found. Please use the forgot password link.
              <div className="mt-4">
                <Link to="/forgot-password" className="text-uv-blue hover:underline">
                  Go to Forgot Password
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
