import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description?: string;
  label: string; // Updated from category to label
}

interface PermissionGroup {
  id: string;
  name: string;
  permissions: string[]; // Array of permission IDs
  parentGroupId?: string;
}

const PermissionManager: React.FC = () => {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for new group creation
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({});
  const [manageAllChecked, setManageAllChecked] = useState(false);
  const [newGroupParent, setNewGroupParent] = useState<string | undefined>(undefined);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setLoadingPermissions(true);
    try {
      const response = await axiosClient.get('/permissions'); // Assuming this endpoint exists
      setAllPermissions(response.data);
      // Initialize selectedPermissions based on fetched permissions
      const initialSelected: Record<string, boolean> = {};
      response.data.forEach((perm: Permission) => {
        initialSelected[perm.id] = false;
      });
      setSelectedPermissions(initialSelected);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setError('Failed to load permissions.');
      toast.error('Failed to load permissions.');
    } finally {
      setLoadingPermissions(false);
    }
  }, []);

  const fetchPermissionGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const response = await axiosClient.get('/permission-groups'); // Assuming this endpoint exists
      setPermissionGroups(response.data);
    } catch (err) {
      console.error('Failed to fetch permission groups:', err);
      setError('Failed to load permission groups.');
      toast.error('Failed to load permission groups.');
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
    fetchPermissionGroups();
  }, [fetchPermissions, fetchPermissionGroups]);

  // God Mode Logic
  useEffect(() => {
    if (manageAllChecked) {
      const allChecked: Record<string, boolean> = {};
      allPermissions.forEach(perm => {
        allChecked[perm.id] = true;
      });
      setSelectedPermissions(allChecked);
    } else {
      // If "Manage All" is unchecked, don't automatically uncheck others
      // This allows individual permissions to remain checked if they were before
    }
  }, [manageAllChecked, allPermissions]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionId]: checked,
    }));
    // If any individual permission is unchecked, "Manage All" should be unchecked
    if (!checked) {
      setManageAllChecked(false);
    }
  };

  const handleManageAllChange = (checked: boolean) => {
    setManageAllChecked(checked);
    if (checked) {
      const allChecked: Record<string, boolean> = {};
      allPermissions.forEach(perm => {
        allChecked[perm.id] = true;
      });
      setSelectedPermissions(allChecked);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('Group name cannot be empty.');
      return;
    }

    setIsCreatingGroup(true);
    try {
      const permissionsToAssign = Object.keys(selectedPermissions).filter(
        (permId) => selectedPermissions[permId]
      );

      const payload: Omit<PermissionGroup, 'id'> = {
        name: newGroupName,
        permissions: permissionsToAssign,
        ...(newGroupParent && { parentGroupId: newGroupParent }),
      };

      await axiosClient.post('/permission-groups', payload); // Assuming this endpoint exists
      toast.success('Permission group created successfully!');
      setNewGroupName('');
      setSelectedPermissions({});
      setManageAllChecked(false);
      setNewGroupParent(undefined);
      fetchPermissionGroups(); // Refresh the list of groups
    } catch (err) {
      console.error('Failed to create permission group:', err);
      toast.error('Failed to create permission group.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Group permissions by label
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const label = permission.label || 'Other';
    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loadingPermissions || loadingGroups) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-brand" />
        <span className="ml-2 text-lg">Loading permissions...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Permission Management</h1>

      {/* Create New Group Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Permission Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Support Agents, Senior Admins"
            />
          </div>

          <div>
            <Label htmlFor="parentGroup">Parent Group (Optional)</Label>
            <Select onValueChange={setNewGroupParent} value={newGroupParent}>
              <SelectTrigger id="parentGroup">
                <SelectValue placeholder="Select a parent group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent Group</SelectItem>
                {permissionGroups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Permissions</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="manageAll"
                checked={manageAllChecked}
                onCheckedChange={handleManageAllChange}
              />
              <label
                htmlFor="manageAll"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Manage All (God Mode)
              </label>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([label, permissions]) => (
                <div key={label}>
                  <h3 className="text-lg font-semibold mb-2">{label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map(perm => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`perm-${perm.id}`}
                          checked={selectedPermissions[perm.id] || false}
                          onCheckedChange={(checked) => handlePermissionChange(perm.id, checked as boolean)}
                          disabled={manageAllChecked}
                        />
                        <label
                          htmlFor={`perm-${perm.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {perm.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateGroup} disabled={isCreatingGroup}>
            {isCreatingGroup ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Group
          </Button>
        </CardFooter>
      </Card>

      {/* Existing Permission Groups Section (Optional: for display/editing) */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Permission Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {permissionGroups.length === 0 ? (
            <p className="text-muted-foreground">No permission groups found.</p>
          ) : (
            <ul className="space-y-2">
              {permissionGroups.map(group => (
                <li key={group.id} className="border p-3 rounded-md">
                  <h3 className="font-semibold">{group.name}</h3>
                  {group.parentGroupId && (
                    <p className="text-sm text-muted-foreground">
                      Parent: {permissionGroups.find(p => p.id === group.parentGroupId)?.name || 'Unknown'}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Permissions: {group.permissions.join(', ')}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManager;
