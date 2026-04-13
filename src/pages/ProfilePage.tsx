import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/utils/getInitials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: { firstName?: string; lastName?: string } = {};
    if (firstName !== user?.firstName) {
      payload.firstName = firstName;
    }
    if (lastName !== user?.lastName) {
      payload.lastName = lastName;
    }

    if (Object.keys(payload).length === 0) {
      toast.info('No changes to save.');
      return;
    }

    try {
      const response = await axiosClient.put('/users/profile', payload);
      setUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    try {
      await axiosClient.post('/users/profile/change-password', { newPassword });
      toast.success('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password.');
    }
  };

  const handleProfileReset = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const passwordsMatch = newPassword && newPassword === confirmPassword;

  return (
    <div className="p-6 rounded-lg shadow-md bg-card-bg border border-card-border">
      <h1 className="text-2xl font-bold text-text-main mb-6">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-5xl font-bold mb-4">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <h2 className="text-2xl font-semibold">{`${user.firstName} ${user.lastName}`}</h2>
          <p className="text-slate-500">{user.email}</p>
        </div>
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} readOnly className="bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={handleProfileReset}>Cancel</Button>
              </div>
            </form>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {passwordsMatch && <p className="text-green-500 text-sm">Passwords match!</p>}
              <Button type="submit" disabled={!passwordsMatch}>Change Password</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
