import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, User, Mail, Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { ServiceUnavailable } from '@/components/illustrations/ServiceUnavailable';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  joinDate: string;
  activeTickets: number;
}

const CustomerListPage: React.FC = () => {
  const { activeRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCustomers = async (pageToFetch = 0) => {
    if (activeRole === 'CUSTOMER') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get('/customers', {
        params: { page: pageToFetch, size: 10 }
      });
      // The Fix: Set state to response.data.content
      setCustomers(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setPage(pageToFetch);
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      if (err.response?.status === 404 || err.response?.status === 500) {
        toast.warning('Using mock data for demonstration. Endpoint /customers may not exist yet.');
        setCustomers([
          { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', joinDate: '2023-10-15', activeTickets: 2 },
          { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', joinDate: '2023-11-02', activeTickets: 0 },
          { id: 3, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', joinDate: '2023-11-20', activeTickets: 5 },
        ]);
        setTotalPages(1);
      } else {
        setError('Failed to load customers.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(0);
  }, [activeRole]);

  // Global Null Guard for filtering
  const filteredCustomers = (customers || []).filter(c => {
    if (!c) return false;
    const term = (searchTerm || "").toLowerCase();
    const first = (c.firstName || "").toString().toLowerCase();
    const last = (c.lastName || "").toString().toLowerCase();
    const email = (c.email || "").toString().toLowerCase();

    return first.includes(term) || last.includes(term) || email.includes(term);
  });

  const renderPagination = () => {
    if (loading || error || totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchCustomers(page - 1)}
            disabled={page === 0}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => fetchCustomers(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    );
  };

  if (activeRole === 'CUSTOMER') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400">You do not have permission to view the customer list.</p>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col space-y-4 p-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <ServiceUnavailable />
          <button
            onClick={() => fetchCustomers(page)}
            className="mt-6 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full table-fixed">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th scope="col" className="w-1/3 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="w-1/3 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="w-1/6 px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Join Date
              </th>
              <th scope="col" className="w-1/6 px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Tickets
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {(customer.firstName || "?").charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                          {customer.firstName} {customer.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Mail size={14} className="mr-2 opacity-70" />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-2 opacity-70" />
                      {new Date(customer.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle text-center">
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      customer.activeTickets > 0
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {customer.activeTickets}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No customers found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {renderPagination()}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-transparent dark:border-slate-800/60 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Customers
        </h1>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default CustomerListPage;
