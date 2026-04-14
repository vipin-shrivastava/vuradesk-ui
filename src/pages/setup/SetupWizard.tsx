import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle } from 'lucide-react';

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
    setStep(5); // Move to installation step
    try {
      await axiosClient.post('/public/setup/initialize', wizardData);
      toast.success('Installation successful! Redirecting to login...');
      setIsSuccess(true);
      setWizardData({
        databaseConfig: { type: 'h2', url: '', username: '', password: '' },
        adminAccount: { firstName: '', lastName: '', email: '', password: '' },
        systemSettings: { appName: 'VuraDesk', logoUrl: '' },
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error('Installation failed. Please check your settings.');
      setStep(4); // Go back to confirmation on failure
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Database Configuration</h2>
            <div className="space-y-4">
              <Label>Database Type</Label>
              <Select
                value={wizardData.databaseConfig.type}
                onValueChange={(value) => handleInputChange('databaseConfig', 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h2">H2 (Embedded)</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                </SelectContent>
              </Select>
              {wizardData.databaseConfig.type !== 'h2' && (
                <>
                  <Label>Database URL</Label>
                  <Input
                    value={wizardData.databaseConfig.url}
                    onChange={(e) => handleInputChange('databaseConfig', 'url', e.target.value)}
                    placeholder="jdbc:mysql://localhost:3306/vuradesk"
                  />
                  <Label>Username</Label>
                  <Input
                    value={wizardData.databaseConfig.username}
                    onChange={(e) => handleInputChange('databaseConfig', 'username', e.target.value)}
                  />
                  <Label>Password</Label>
                  <Input
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
            <h2 className="text-2xl font-bold mb-4">Admin Account Setup</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={wizardData.adminAccount.firstName}
                    onChange={(e) => handleInputChange('adminAccount', 'firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={wizardData.adminAccount.lastName}
                    onChange={(e) => handleInputChange('adminAccount', 'lastName', e.target.value)}
                  />
                </div>
              </div>
              <Label>Email</Label>
              <Input
                type="email"
                value={wizardData.adminAccount.email}
                onChange={(e) => handleInputChange('adminAccount', 'email', e.target.value)}
              />
              <Label>Password</Label>
              <Input
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
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            <div className="space-y-4">
              <Label>Application Name</Label>
              <Input
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
            <h2 className="text-2xl font-bold mb-4">Confirmation</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              {JSON.stringify(wizardData, null, 2)}
            </pre>
          </div>
        );
      case 5:
        return (
          <div className="text-center">
            {isSuccess ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Installation Successful!</h2>
                <p>You will be redirected to the login page shortly.</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Installation in Progress...</h2>
                <p>Please wait while we set up your application.</p>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const steps = ['Database', 'Admin Account', 'System Settings', 'Confirm', 'Install'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background-main">
      <div className="bg-white dark:bg-card-bg p-10 rounded-2xl shadow-lg w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((name, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step > index + 1 ? 'bg-green-500 text-white' : step === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  {step > index + 1 ? '✔' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-auto border-t-2 mx-4 ${step > index + 1 ? 'border-green-500' : 'border-gray-300 dark:border-gray-700'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        {renderStep()}
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
              <Button onClick={handleInstall} disabled={isLoading}>
                {isLoading ? 'Installing...' : 'Finalize Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
