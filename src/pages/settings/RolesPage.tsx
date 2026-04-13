import React, { useState } from 'react';
import { useRoles, Role } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';

const RolesPage = () => {
  const { roles, setRoles, loading: rolesLoading, error: rolesError } = useRoles();
  const { permissions, loading: permsLoading, error: permsError } = usePermissions();
  const [saving, setSaving] = useState(false);

  const handlePermissionToggle = (roleId: string, permissionName: string, checked: boolean) => {
    setRoles((currentRoles) =>
      currentRoles.map((role) => {
        if (role.id === roleId) {
          const currentPerms = role.permissions || [];
          const newPermissions = checked
            ? [...currentPerms, permissionName]
            : currentPerms.filter((p) => p !== permissionName);
          return { ...role, permissions: newPermissions };
        }
        return role;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving roles...');
    try {
      const updatePromises = roles.map(role =>
        axiosClient.put(`/admin/roles/${role.id}`, { name: role.name, permissions: role.permissions || [] })
      );
      await Promise.all(updatePromises);
      toast.success('Roles updated successfully!', { id: toastId });
    } catch (error) {
      console.error('Failed to save roles:', error);
      toast.error('Failed to save roles.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (rolesLoading || permsLoading) return <div>Loading roles and permissions...</div>;
  if (rolesError && !permsError) return <div className="text-red-500">Error loading roles: {rolesError}</div>;
  if (permsError && !rolesError) return <div className="text-slate-500">{permsError}</div>;
  if (rolesError || permsError) return <div className="text-red-500">Error loading data.</div>;

  if (!permissions || permissions.length === 0) return <div>No permissions to display.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-text-main">Roles & Permissions</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Permission</TableHead>
              {roles?.map((role) => (
                <TableHead key={role.id} className="text-center">
                  {role.name.replace('ROLE_', '')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.name}>
                <TableCell className="font-medium">
                  {permission.name}
                  {permission.description && (
                     <div className="text-xs text-slate-500 font-normal">{permission.description}</div>
                  )}
                </TableCell>
                {roles?.map((role) => (
                  <TableCell key={`${role.id}-${permission.name}`} className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={(role.permissions || []).includes(permission.name)}
                        onCheckedChange={(checked) => handlePermissionToggle(role.id, permission.name, checked as boolean)}
                        disabled={role.name === 'ROLE_ADMIN'}
                      />
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RolesPage;
