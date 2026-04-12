import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const presets = {
  gmail: { host: 'smtp.gmail.com', port: 587 },
  outlook: { host: 'smtp.office365.com', port: 587 },
};

interface EmailSettingsProps {
  host: string;
  setHost: (host: string) => void;
  port: string;
  setPort: (port: string) => void;
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isPasswordSet: boolean;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({
  host,
  setHost,
  port,
  setPort,
  username,
  setUsername,
  password,
  setPassword,
  isPasswordSet,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(!isPasswordSet);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordDirty, setIsPasswordDirty] = useState(false);

  useEffect(() => {
    if (isPasswordSet) {
      setPassword('********');
      setShowPasswordInput(false);
    }
  }, [isPasswordSet, setPassword]);

  const handlePresetChange = (value: string) => {
    if (value === 'gmail' || value === 'outlook') {
      const preset = presets[value];
      setHost(preset.host);
      setPort(preset.port.toString());
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await axiosClient.post('/settings/email/test', { host, port: parseInt(port), username, password });
      toast.success('Connection successful!');
    } catch (error) {
      toast.error('Connection failed. Please check your settings.');
    } finally {
      setIsTesting(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPasswordDirty) {
      setIsPasswordDirty(true);
      setPassword(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text-main mb-4">Email Settings</h2>
      <div className="space-y-6">
        <div>
          <Label htmlFor="quick-setup">Quick Setup</Label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger id="quick-setup">
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gmail">Gmail</SelectItem>
              <SelectItem value="outlook">Outlook</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="smtp-host">SMTP Host</Label>
          <Input id="smtp-host" value={host} onChange={(e) => setHost(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="smtp-port">SMTP Port</Label>
          <Input id="smtp-port" value={port} onChange={(e) => setPort(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="smtp-username">Username</Label>
          <Input id="smtp-username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="smtp-password">Password</Label>
          {!showPasswordInput ? (
            <Button variant="outline" onClick={() => {
              setShowPasswordInput(true);
              setPassword('');
              setIsPasswordDirty(false);
            }}>
              Change Password
            </Button>
          ) : (
            <div className="relative">
              <Input
                id="smtp-password"
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-0"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
        <Button onClick={handleTestConnection} disabled={isTesting}>
          {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Connection
        </Button>
      </div>
    </div>
  );
};

export default EmailSettings;
