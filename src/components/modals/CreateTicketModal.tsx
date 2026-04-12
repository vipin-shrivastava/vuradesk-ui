import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { X, Pen, FileText, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Department {
  id: string;
  name: string;
}

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

const priorities = [
  { level: 'LOW', color: 'bg-green-500', label: 'Low' },
  { level: 'MEDIUM', color: 'bg-blue-500', label: 'Medium' },
  { level: 'HIGH', color: 'bg-orange-500', label: 'High' },
  { level: 'URGENT', color: 'bg-red-500', label: 'Urgent' },
];

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onTicketCreated }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchDepartments = async () => {
        try {
          const response = await axiosClient.get('/public/departments');
          setDepartments(response.data);
          if (response.data.length > 0) {
            setDepartmentId(response.data[0].id); // Set default department
          }
        } catch (error) {
          console.error('Failed to fetch departments:', error);
          toast.error('Failed to load departments.');
        }
      };
      fetchDepartments();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosClient.post('/tickets', { subject, description, priority, departmentId, status: 'OPEN' });
      toast.success('Ticket created successfully!');
      onTicketCreated();
      onClose();
      setSubject('');
      setDescription('');
      setPriority('MEDIUM');
      setDepartmentId(''); // Reset departmentId
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-card-bg rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-lg font-semibold text-text-main">Create New Ticket</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="subject" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
              <div className="relative mt-1">
                <Pen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700"
                  required
                />
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label htmlFor="department" className="text-xs font-bold text-slate-500 uppercase tracking-wider">DEPARTMENT</label>
              <Select onValueChange={setDepartmentId} value={departmentId}>
                <SelectTrigger id="department" className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800">
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
              <div className="mt-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex space-x-1">
                {priorities.map(({ level, color, label }) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPriority(level)}
                    className={`flex-1 text-center px-3 py-1 rounded-md text-sm font-semibold transition-all duration-200
                      ${priority === level ? `text-white shadow ${color}` : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 flex justify-end space-x-4 border-t border-card-border">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-md text-sm font-semibold text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center px-6 py-2 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="animate-spin mr-2" size={18} />}
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
