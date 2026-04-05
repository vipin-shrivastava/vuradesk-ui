import React, { useState } from 'react';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { Mail, User, FileText, Pen, Loader2, CheckCircle2, LifeBuoy, HelpCircle, FileQuestion, BookOpen } from 'lucide-react';

const PublicTicketPage: React.FC = () => {
  const { settings } = useSystemSettings();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        firstName,
        lastName,
        creatorEmail: email, // This is the fix
        subject,
        description,
      };
      console.log("Submit Public Ticket Payload:", payload);
      await axiosClient.post('/public/tickets', payload);
      setIsSuccess(true);
      toast.success('Ticket submitted successfully!');
    } catch (err: any) {
      console.error('Ticket submission failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit ticket. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setSubject('');
    setDescription('');
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-main flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Header */}
      <div className="w-full max-w-5xl mb-8 text-center">
        <img
          src={settings.logoUrl || '/src/assets/logo.png'}
          alt={`${settings.appName} Logo`}
          className="mx-auto h-16 w-auto mb-4"
        />
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Submit a Request
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Need help? Fill out the form below and our team will get back to you.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Center (2/3): The Ticket Form */}
        <div className="lg:col-span-2 bg-white dark:bg-card-bg rounded-2xl shadow-xl overflow-hidden border border-transparent dark:border-slate-800/60">
          {isSuccess ? (
            <div className="p-12 flex flex-col items-center text-center h-full justify-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Thank you for contacting us. We have received your request and will respond to the email you provided shortly.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--primary-brand)' }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      placeholder="Jane"
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  Your Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder="jane.doe@example.com"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">We'll use this to send you updates.</p>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <div className="relative">
                  <Pen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder="Briefly describe your issue"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-4 text-slate-400" size={18} />
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none"
                    placeholder="Please provide as much detail as possible..."
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: 'var(--primary-brand)' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right (1/3): Quick Help Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-card-bg rounded-2xl shadow-xl p-6 border border-transparent dark:border-slate-800/60">
            <div className="flex items-center mb-4">
              <LifeBuoy className="text-indigo-500 mr-2" size={24} style={{ color: 'var(--primary-brand)' }} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Help</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Before submitting a ticket, you might find the answer you need in our resources.
            </p>
            <ul className="space-y-4">
              <li>
                <a href="#" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 mr-3 transition-colors">
                     <HelpCircle size={16} className="text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </div>
                  How to Reset Password
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
                   <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 mr-3 transition-colors">
                     <FileQuestion size={16} className="text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </div>
                  Billing FAQs
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
                   <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 mr-3 transition-colors">
                     <BookOpen size={16} className="text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </div>
                  Documentation
                </a>
              </li>
            </ul>
          </div>

           <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30 text-center">
             <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">Are you a registered user?</h4>
             <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-4">Log in to track your ticket status.</p>
             <a href="/login" className="inline-block text-sm font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2">Go to Login</a>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-slate-500 dark:text-slate-500">
        <p>Powered by <strong>{settings.appName}</strong></p>
      </div>
    </div>
  );
};

export default PublicTicketPage;
