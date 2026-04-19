import React, { useState, useEffect } from 'react';
import { getPublicRoutes, updatePublicRoute } from '@/services/securityService';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PublicRoute {
  id: string;
  path: string;
  method: string;
  isEnabled: boolean;
}

const PublicAccessManagementPage = () => {
  const [routes, setRoutes] = useState<PublicRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const data = await getPublicRoutes();
        setRoutes(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch public routes.');
        toast.error('Failed to fetch public routes.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleStatusChange = async (route: PublicRoute, newStatus: boolean) => {
    const originalRoutes = [...routes];
    setRoutes(prev => prev.map(r => r.id === route.id ? { ...r, isEnabled: newStatus } : r));
    const toastId = toast.loading(`Updating status for ${route.path}...`);
    try {
      await updatePublicRoute(route.id, { isEnabled: newStatus });
      toast.success(`'Front Door' for ${route.path} is now ${newStatus ? 'unlocked' : 'locked'}.`, { id: toastId });
    } catch (err) {
      setRoutes(originalRoutes);
      toast.error(`Failed to update status for ${route.path}.`, { id: toastId });
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Public Access Management</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Path</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Enabled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => (
            <TableRow key={route.id}>
              <TableCell>{route.path}</TableCell>
              <TableCell>{route.method}</TableCell>
              <TableCell>
                <Switch
                  checked={route.isEnabled}
                  onCheckedChange={(newStatus) => handleStatusChange(route, newStatus)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PublicAccessManagementPage;
