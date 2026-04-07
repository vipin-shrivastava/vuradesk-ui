import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '@/api/axiosClient'; // Import axiosClient
import { toast } from 'sonner'; // Assuming sonner is used for toasts

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axiosClient.post('/auth/forgot-password', { email });
      console.log("DEBUG: Reset Token is:", response.data.token);
      alert("Check console for reset token (Temporary for testing)");
      setMessage('A password reset link has been sent to your email.');
      toast.success('Password reset link sent!');
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send reset link. Please try again.';
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
            <CardTitle className="text-xl font-bold text-slate-800">Forgot Password?</CardTitle>
            <p className="text-sm text-slate-500 text-center">Enter your email to receive a password reset link.</p>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {message && <p className="text-green-500 text-sm text-center">{message}</p>}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full bg-uv-blue hover:bg-uv-blue/90 text-white" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
            <div className="text-center text-sm">
              <Link to="/login" className="text-uv-blue hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
