import React, { useState, useEffect, useCallback } from 'react';
import { useRoles, Role } from '@/hooks/useRoles';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

// Helper to categorize permissions
const categorizePermissions = (permissions: Permission[]) => {
  const categories: { [key: string]: Permission[] } = {};
  permissions.forEach(p => {
    if (p && p.key) {
      const category = p.key.split(':')[0] || 'Other';
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ') + ' Management';
      if (!categories[formattedCategory]) {
        categories[formattedCategory] = [];
      }
      categories[formattedCategory].push(p);
    }
  });
  return categories;
};

const AccessControlPage: React.FC = () => {
  const { roles, loading: rolesLoading, error: rolesError, refetch: refetchRoles } = useRoles();
  const { permissions, loading: permsLoading, error: permsError } = usePermissions();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [localRoles, setLocalRoles] = useState<Role[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [addingNewRole, setAddingNewRole] = useState(false);

  useEffect(() => {
    if (roles && roles.length > 0) {
      setLocalRoles(roles);
      if (!selectedRoleId) {
        setSelectedRoleId(roles[0].id);
      }
    }
  }, [roles, selectedRoleId]);

  const selectedRole = localRoles.find(r => r.id === selectedRoleId);
  const categorizedPermissions = categorizePermissions(permissions || []);

  const handlePermissionToggle = (permissionKey: string, checked: boolean) => {
    if (!selectedRole) return;

    const updatedPermissions = checked
      ? [...(selectedRole.permissions || []), permissionKey]
      : (selectedRole.permissions || []).filter(p => p !== permissionKey);

    setLocalRoles(prevRoles =>
      prevRoles.map(r =>
        r.id === selectedRoleId ? { ...r, permissions: updatedPermissions } : r
      )
    );
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    const toastId = toast.loading(`Saving changes for ${selectedRole.name.replace('ROLE_', '')}...`);

    try {
      await axiosClient.put(`/admin/roles/${selectedRole.id}`, {
        name: selectedRole.name,
        permissions: selectedRole.permissions || [],
      });
      toast.success('Changes saved successfully!', { id: toastId });
      setUnsavedChanges(false);
      refetchRoles();
    } catch (error) {
      console.error('Failed to save role permissions:', error);
      toast.error('Failed to save changes.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (roles) {
      setLocalRoles(roles);
    }
    setUnsavedChanges(false);
  };

  const handleCreateNewRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Role name cannot be empty.');
      return;
    }
    setSaving(true);
    const toastId = toast.loading(`Creating role ${newRoleName}...`);
    try {
      await axiosClient.post('/admin/roles', { name: `ROLE_${newRoleName.toUpperCase()}`, permissions: [] });
      toast.success(`Role ${newRoleName} created successfully!`, { id: toastId });
      setNewRoleName('');
      setAddingNewRole(false);
      refetchRoles();
    } catch (error) {
      console.error('Failed to create new role:', error);
      toast.error('Failed to create new role.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (rolesLoading || permsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading access control data...</span>
      </div>
    );
  }
  if (rolesError || permsError) return <div className="p-4 text-red-500">Error loading data.</div>;

  return (
    <div className="flex flex-col h-full bg-card-bg rounded-lg shadow-md border border-card-border">
      <div className="p-4 border-b border-card-border">
        <h3 className="text-sm font-medium text-slate-500">
          Administration &gt; Access Control &gt; <span className="text-text-main font-semibold">
            {selectedRole ? selectedRole.name.replace('ROLE_', '') : 'Select Role'}
          </span>
        </h3>
      </div>

      <div className="flex flex-1">
        <div className="w-1/4 border-r border-card-border p-4 space-y-2">
          <h3 className="text-lg font-semibold text-text-main mb-4">Roles</h3>
          {localRoles.map(role => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRoleId(role.id);
                setUnsavedChanges(false);
                if (roles) setLocalRoles(roles);
              }}
              className={`block w-full text-left p-2 rounded-md transition-colors relative ${
                selectedRoleId === role.id
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {selectedRoleId === role.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ backgroundColor: 'var(--primary-brand)' }}></div>
              )}
              <span className={`${selectedRoleId === role.id ? 'ml-2' : ''}`}>
                {role.name.replace('ROLE_', '')}
              </span>
            </button>
          ))}
          <Button variant="outline" className="w-full mt-4" onClick={() => setAddingNewRole(!addingNewRole)}>
            <Plus className="h-4 w-4 mr-2" /> Add New Role
          </Button>
          {addingNewRole && (
            <div className="mt-2 space-y-2">
              <Label htmlFor="new-role-name">New Role Name</Label>
              <Input
                id="new-role-name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g., Junior Agent"
              />
              <Button size="sm" onClick={handleCreateNewRole} disabled={saving}>
                Create
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 relative">
          {selectedRole ? (
            <>
              <h3 className="text-lg font-semibold text-text-main mb-4">
                Permissions for {selectedRole.name.replace('ROLE_', '')}
              </h3>
              <div className="space-y-6">
                {Object.entries(categorizedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h4 className="text-md font-semibold text-slate-600 dark:text-slate-400 mb-2">{category}</h4>
                    <div className="space-y-3">
                      {perms.map(permission => (
                        <div key={permission.key} className="flex items-center justify-between">
                          <div>
                            <Label htmlFor={`${selectedRole.id}-${permission.key}`} className="font-medium">
                              {permission.label}
                            </Label>
                            {permission.description && (
                              <p className="text-xs text-slate-500">{permission.description}</p>
                            )}
                          </div>
                          <Switch
                            id={`${selectedRole.id}-${permission.key}`}
                            checked={(selectedRole.permissions || []).includes(permission.key)}
                            onCheckedChange={(checked) => handlePermissionToggle(permission.key, checked)}
                            disabled={selectedRole.name === 'ROLE_ADMIN'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {unsavedChanges && (
                <div className="sticky bottom-0 left-0 right-0 bg-card-bg p-4 border-t border-card-border flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              Select a role to view/edit permissions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessControlPage;
