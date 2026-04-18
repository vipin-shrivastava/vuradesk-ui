import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, User, Settings, CheckCircle, Hourglass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const SetupWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    databaseConfig: {
      type: 'h2',
      url: '',
      username: '',
      password: '',
    },
    adminAccount: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    systemSettings: {
      appName: 'VuraDesk',
      logoUrl: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleInputChange = (section: string, field: string, value: string) => {
    setWizardData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleInstall = async () => {
    setIsLoading(true);
    setStep(5);

    const runInstallStep = (
      action: () => Promise<any>,
      logMessage: string,
      progressValue: number
    ) => {
      return new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            setConsoleLogs(prev => [...prev, `[INFO] ${logMessage}`]);
            await action();
            setProgress(progressValue);
            resolve();
          } catch (error) {
            setConsoleLogs(prev => [...prev, `[ERROR] Failed: ${logMessage}`]);
            reject(error);
          }
        }, 1000);
      });
    };

    try {
      await runInstallStep(
        () => Promise.resolve(),
        'Creating Tables...',
        25
      );
      await runInstallStep(
        () => Promise.resolve(),
        'Seeding Admin...',
        50
      );
      await runInstallStep(
        () => axiosClient.post('/public/setup/initialize', wizardData),
        'Finalizing Configuration...',
        75
      );
      await runInstallStep(
        () => Promise.resolve(),
        'Installation Complete!',
        100
      );

      toast.success('Installation successful!');
      setIsSuccess(true);
    } catch (error) {
      toast.error('Installation failed. Please check your settings.');
      setStep(4); // Go back to confirmation on failure
    } finally {
      setIsLoading(false);
    }
  };

  const renderLog = (log: string, index: number) => {
    if (log.startsWith('[INFO]')) {
      return (
        <p key={index}>
          <span className="text-blue-400">[INFO]</span>
          {log.substring(6)}
        </p>
      );
    }
    if (log.startsWith('[ERROR]')) {
      return (
        <p key={index}>
          <span className="text-red-500">[ERROR]</span>
          {log.substring(7)}
        </p>
      );
    }
    return <p key={index}>{log}</p>;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Database Configuration</h2>
            <div className="space-y-6">
              <Label htmlFor="dbType">Database Type</Label>
              <Select
                value={wizardData.databaseConfig.type}
                onValueChange={(value) => handleInputChange('databaseConfig', 'type', value)}
              >
                <SelectTrigger id="dbType">
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h2">H2 (Embedded)</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                </SelectContent>
              </Select>
              {wizardData.databaseConfig.type !== 'h2' && (
                <>
                  <Label htmlFor="dbUrl">Database URL</Label>
                  <Input
                    id="dbUrl"
                    value={wizardData.databaseConfig.url}
                    onChange={(e) => handleInputChange('databaseConfig', 'url', e.target.value)}
                    placeholder="jdbc:mysql://localhost:3306/vuradesk"
                  />
                  <Label htmlFor="dbUsername">Username</Label>
                  <Input
                    id="dbUsername"
                    value={wizardData.databaseConfig.username}
                    onChange={(e) => handleInputChange('databaseConfig', 'username', e.target.value)}
                  />
                  <Label htmlFor="dbPassword">Password</Label>
                  <Input
                    id="dbPassword"
                    type="password"
                    value={wizardData.databaseConfig.password}
                    onChange={(e) => handleInputChange('databaseConfig', 'password', e.target.value)}
                  />
                </>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Account Setup</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminFirstName">First Name</Label>
                  <Input
                    id="adminFirstName"
                    value={wizardData.adminAccount.firstName}
                    onChange={(e) => handleInputChange('adminAccount', 'firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminLastName">Last Name</Label>
                  <Input
                    id="adminLastName"
                    value={wizardData.adminAccount.lastName}
                    onChange={(e) => handleInputChange('adminAccount', 'lastName', e.target.value)}
                  />
                </div>
              </div>
              <Label htmlFor="adminEmail">Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={wizardData.adminAccount.email}
                onChange={(e) => handleInputChange('adminAccount', 'email', e.target.value)}
              />
              <Label htmlFor="adminPassword">Password</Label>
              <Input
                id="adminPassword"
                type="password"
                value={wizardData.adminAccount.password}
                onChange={(e) => handleInputChange('adminAccount', 'password', e.target.value)}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">System Settings</h2>
            <div className="space-y-6">
              <Label htmlFor="appName">Application Name</Label>
              <Input
                id="appName"
                value={wizardData.systemSettings.appName}
                onChange={(e) => handleInputChange('systemSettings', 'appName', e.target.value)}
              />
              {/* Logo upload can be added here */}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Confirmation</h2>
            <div className="space-y-6 text-gray-700">
              {/* Database Configuration Summary */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <h3 className="text-lg font-semibold mb-2">Database Configuration</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500 font-medium">Type:</div>
                  <div className="text-slate-900 font-semibold">{wizardData.databaseConfig.type.toUpperCase()}</div>
                  {wizardData.databaseConfig.type !== 'h2' && (
                    <>
                      <div className="text-slate-500 font-medium">URL:</div>
                      <div className="text-slate-900 font-semibold">{wizardData.databaseConfig.url || 'N/A'}</div>
                      <div className="text-slate-500 font-medium">Username:</div>
                      <div className="text-slate-900 font-semibold">{wizardData.databaseConfig.username || 'N/A'}</div>
                      <div className="text-slate-500 font-medium">Password:</div>
                      <div className="text-slate-900 font-semibold">{'********'}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Admin Account Summary */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <h3 className="text-lg font-semibold mb-2">Admin Account</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500 font-medium">Name:</div>
                  <div className="text-slate-900 font-semibold">{wizardData.adminAccount.firstName} {wizardData.adminAccount.lastName}</div>
                  <div className="text-slate-500 font-medium">Email:</div>
                  <div className="text-slate-900 font-semibold">{wizardData.adminAccount.email}</div>
                  <div className="text-slate-500 font-medium">Password:</div>
                  <div className="text-slate-900 font-semibold">{'********'}</div>
                </div>
              </div>

              {/* System Settings Summary */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <h3 className="text-lg font-semibold mb-2">System Settings</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500 font-medium">App Name:</div>
                  <div className="text-slate-900 font-semibold">{wizardData.systemSettings.appName}</div>
                  {/* Add Logo URL if applicable */}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="text-center py-10">
            <AnimatePresence>
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="w-16 h-16 text-[#22c55e] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Installation Successful!</h2>
                  <p className="text-gray-600">Your VuraDesk is ready.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="progress"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">Installation in Progress...</h2>
                  <p className="text-gray-600 mb-6">Please wait while we set up your application.</p>
                  <Progress value={progress} className="w-full mb-4" />
                  <div className="bg-gray-900 text-green-400 font-mono text-left text-sm p-4 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                    {consoleLogs.map(renderLog)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      default:
        return null;
    }
  };

  const stepsConfig = [
    { name: 'Database', icon: Database },
    { name: 'Admin Account', icon: User },
    { name: 'System Settings', icon: Settings },
    { name: 'Confirmation', icon: CheckCircle },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (30%) */}
      <div className="w-3/10 bg-[#263238] text-white p-8 flex flex-col pt-20 border-r border-white/5">
        <h1 className="text-3xl font-bold mb-10 text-white">VuraDesk Setup</h1>
        <div className="relative pl-4">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-700"></div>
          {stepsConfig.map((stepItem, index) => (
            <div key={index} className="flex items-center mb-8 relative">
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10",
                  step > index + 1
                    ? "bg-green-500"
                    : step === index + 1
                    ? "bg-blue-500"
                    : "bg-slate-600"
                )}
              >
                {React.createElement(stepItem.icon, { className: "w-5 h-5" })}
              </div>
              {/* Step Name */}
              <div
                className={cn(
                  "ml-4 text-lg font-medium",
                  step >= index + 1 ? "text-white" : "text-slate-400"
                )}
              >
                {stepItem.name}
              </div>
            </div>
          ))}

          {/* Installation Status (shown only when step is 5) */}
          {step === 5 && (
            <div className="flex items-center mb-8 relative">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10",
                  isSuccess ? "bg-green-500" : "bg-blue-500 animate-pulse"
                )}
              >
                {isSuccess ? <CheckCircle className="w-5 h-5" /> : <Hourglass className="w-5 h-5" />}
              </div>
              <div
                className={cn(
                  "ml-4 text-lg font-medium",
                  isSuccess ? "text-white" : "text-blue-300"
                )}
              >
                {isSuccess ? "Installation Complete!" : "Finalizing Setup..."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace (70%) */}
      <div className="w-7/10 bg-slate-50 flex items-center justify-center p-8">
        <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-lg">
          <motion.div layout>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              <div>
                {step > 1 && step < 5 && (
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
              </div>
              <div>
                {step < 4 && (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                )}
                {step === 4 && (
                  <Button
                    onClick={handleInstall}
                    disabled={isLoading}
                    className="hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isLoading ? 'Finalizing...' : 'Finalize Setup'}
                  </Button>
                )}
                {step === 5 && isSuccess && (
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-[#00A3E0] to-[#0081b0] text-white animate-bounce hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Launch VuraDesk
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;