import axios from 'axios';
import { toast } from 'sonner';
import { globalLogout } from '@/utils/authUtils'; // Import the global logout function
import { getTenantId } from '@/utils/tenantUtils'; // Import the tenant utility

const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // Add the tenant ID to every request
    const tenantId = getTenantId();
    config.headers['X-Tenant-ID'] = tenantId;

    // Add the JWT token if it exists
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add the active role if it exists
    const activeRole = localStorage.getItem('activeRole');
    if (activeRole) {
      config.headers['X-Active-Role'] = activeRole;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;

      // Interceptor Silence: Do not trigger global logout for a 403 on the activate-role endpoint.
      // Let the component handle this specific error.
      if (status === 403 && config.url.includes('/auth/activate-role')) {
        return Promise.reject(error);
      }

      if (status === 401) {
        // Call the global logout function, which performs the "hard reset"
        globalLogout();
        toast.error('Session Expired', {
          description: 'Your session has expired. Please log in again.',
        });
      } else if (status === 403) {
        toast.error('Forbidden', {
          description: 'You do not have permission to perform this action.',
        });
        // We don't logout here, as the user might have other valid permissions.
      }

      if (status === 500) {
        toast.error('Internal Server Error', {
          description: data?.message || 'Something went wrong on the server.',
        });
      }
    } else {
      toast.error('Network Error', {
        description: 'Unable to connect to the server. Please try again later.',
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
