import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Agent } from '@/hooks/useAgents';
import { useRoles, Role } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { motion } from 'framer-motion';
import { Lock, User, AlertTriangle, Camera } from 'lucide-react';
import { Permission, PermissionGroup } from './TeamPage';

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={`highlight-${i}`} className="bg-yellow-200 text-yellow-800">
            {part}
          </span>
        ) : (
          <span key={`highlight-${i}`}>{part}</span>
        )
      )}
    </span>
  );
};

const getAvatarUrl = (path?: string) => {
  if (!path) return "/default-avatar.png";
  if (path.startsWith('http')) return path;
  const imageUrl = `${import.meta.env.VITE_API_BASE_URL}${path}`;
  console.log("Loading Image from:", imageUrl);
  return imageUrl;
};

const EditAgentPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { roles } = useRoles();

  const [baseAgent, setBaseAgent] = useState<Agent | null>(null);
  const [editAgent, setEditAgent] = useState<Partial<Agent>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Permissions State
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedAgentGroups, setSelectedAgentGroups] = useState<string[]>([]);

  const fetchAgentDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosClient.get<Agent>(`/users/${agentId}`);
      setBaseAgent(response.data);
      setEditAgent(response.data);
      setSelectedAgentGroups(response.data.assignedGroupIds || []);
    } catch (err) {
      setError("Failed to load agent details. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId, fetchAgentDetails]);

  useEffect(() => {
    const fetchAllPermissionsAndGroups = async () => {
      try {
        const [permissionsRes, groupsRes] = await Promise.all([
          axiosClient.get<Permission[]>('/permissions'),
          axiosClient.get<PermissionGroup[]>('/permission-groups'),
        ]);
        setAllPermissions(permissionsRes.data);
        setPermissionGroups(groupsRes.data);
      } catch (err) {
        toast.error('Failed to load permission data.');
      }
    };
    fetchAllPermissionsAndGroups();
  }, []);

  const handlePermissionChange = (permKey: string, isChecked: boolean) => {
    setEditAgent(prev => {
      if (!prev) return prev;
      const currentPermissions = prev.directPermissions || [];
      const updatedPermissions = isChecked
        ? [...currentPermissions, permKey]
        : currentPermissions.filter(key => key !== permKey);
      return { ...prev, directPermissions: updatedPermissions };
    });
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleStatusChange = async (enabled: boolean) => {
    setEditAgent(prev => ({ ...prev, enabled }));
    try {
      await axiosClient.patch(`/admin/users/${agentId}/status`, { enabled });
      toast.success(`Agent has been ${enabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      toast.error('Failed to update agent status.');
      // Revert state on failure
      setEditAgent(prev => ({ ...prev, enabled: !enabled }));
    }
  };

  const calculateEffectivePermissions = useCallback(() => {
    const inheritedSources: { [key: string]: string[] } = {};
    if (!editAgent) return { inheritedSources };

    const agentRoles = roles.filter(r => editAgent.roles?.includes(r.name));
    agentRoles.forEach(role => {
      (role.permissions || []).forEach(permKey => {
        inheritedSources[permKey] = inheritedSources[permKey] || [];
        inheritedSources[permKey].push(`Role: ${role.name.replace('ROLE_', '')}`);
      });
    });

    selectedAgentGroups.forEach(groupId => {
      const group = permissionGroups.find(g => g.id === groupId);
      if (group) {
        (group.permissions || []).forEach(permKey => {
          inheritedSources[permKey] = inheritedSources[permKey] || [];
          inheritedSources[permKey].push(`Group: ${group.name}`);
        });
      }
    });
    return { inheritedSources };
  }, [editAgent, roles, selectedAgentGroups, permissionGroups]);

  const { inheritedSources } = calculateEffectivePermissions();

  const groupedPermissions = useMemo(() => {
    const grouped: Record<string, Permission[]> = {};
    allPermissions.forEach(p => {
      const label = p.label || 'Other';
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(p);
    });
    return grouped;
  }, [allPermissions]);

  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return groupedPermissions;
    const filtered: Record<string, Permission[]> = {};
    for (const label in groupedPermissions) {
      const matchingPermissions = groupedPermissions[label].filter(perm =>
        (perm.label || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingPermissions.length > 0) filtered[label] = matchingPermissions;
    }
    return filtered;
  }, [searchTerm, groupedPermissions]);

  const handleSaveChanges = async () => {
    if (!editAgent || !baseAgent) return;
    setIsSaving(true);
    const toastId = toast.loading('Saving changes...');

    try {
      let updatedPayload = { ...editAgent };

      // Step 1: Upload profile picture if a new one is selected
      if (profilePictureFile) {
        const response = await axiosClient.postForm<{ profilePictureUrl: string }>(
          `/users/${baseAgent.id}/profile-picture`,
          { file: profilePictureFile }
        );
        updatedPayload.profilePictureUrl = response.data.profilePictureUrl;
      }

      // Step 2: Update the rest of the agent details
      const { assignedGroupIds, ...cleanPayload } = updatedPayload;
      await axiosClient.put<Agent>(`/users/${baseAgent.id}`, cleanPayload);

      // Step 3: Refetch the agent details to ensure UI is in sync
      await fetchAgentDetails();

      toast.success('Agent updated successfully!', { id: toastId });
      navigate('/admin/team');
    } catch (error) {
      toast.error('Failed to save changes.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Loading agent...</div>;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
        <AlertTriangle className="w-10 h-10 mb-4" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (!baseAgent) return <div>Agent not found.</div>;

  const fullName = `${editAgent?.firstName} ${editAgent?.lastName}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4"
    >
      <div className="grid grid-cols-10 gap-8 items-start">
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Details for {fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePicturePreview || getAvatarUrl(baseAgent?.profilePictureUrl)} />
                    <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                  </Avatar>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    size="icon"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange} className="hidden" accept="image/*" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={editAgent?.firstName || ''} onChange={e => setEditAgent({...editAgent, firstName: e.target.value})} readOnly={false} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={editAgent?.lastName || ''} onChange={e => setEditAgent({...editAgent, lastName: e.target.value})} readOnly={false} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input value={editAgent?.email} readOnly />
              </div>
              <div className="flex items-center justify-between">
                <Label>Status</Label>
                <Switch checked={editAgent?.enabled || false} onCheckedChange={handleStatusChange} disabled={false} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-7">
          <div className="mb-4">
            <Input
              placeholder="Search Permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-6">
            {Object.entries(filteredPermissions).map(([label, permissions]) => (
              <Card key={label}>
                <CardHeader><CardTitle>{label}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {permissions.map(perm => {
                    const isInherited = inheritedSources[perm.key] && inheritedSources[perm.key].length > 0;
                    return (
                      <motion.div layout key={perm.key} className="flex items-start space-x-2">
                        <Checkbox
                          id={`perm-${perm.key}`}
                          checked={!!(editAgent.directPermissions?.includes(perm.key) || editAgent.permissions?.includes(perm.key))}
                          onCheckedChange={(checked) => handlePermissionChange(perm.key, checked as boolean)}
                          disabled={isInherited}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`perm-${perm.key}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            <Highlight text={perm.label} highlight={searchTerm} />
                          </label>
                          {isInherited && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Lock className="h-3 w-3 mr-1" />
                              Inherited from: {inheritedSources[perm.key].join(', ')}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 border-t border-slate-200 flex justify-end gap-2 mt-8">
        <Button variant="outline" onClick={() => navigate('/admin/team')}>Cancel</Button>
        <Button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#00A3E0] to-[#0081b0] text-white"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </motion.div>
  );
};

export default EditAgentPage;
