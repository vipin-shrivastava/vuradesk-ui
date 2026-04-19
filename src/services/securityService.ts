import axiosClient from '@/api/axiosClient';

export const getPublicRoutes = async () => {
  const response = await axiosClient.get('/security/public-routes');
  return response.data;
};

export const updatePublicRoute = async (id: string, data: { isEnabled: boolean }) => {
  const response = await axiosClient.patch(`/security/public-routes/${id}`, data);
  return response.data;
};
