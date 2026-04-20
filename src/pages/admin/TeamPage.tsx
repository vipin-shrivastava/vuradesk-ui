import React, { useState } from 'react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { useRoles, Role } from '@/hooks/useRoles';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { InviteModal } from '@/components/admin/InviteModal';
import { TeamMemberCard } from '@/components/admin/TeamMemberCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleSlug } from '@/utils/roleUtils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  label: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: string[];
  parentGroupId?: string;
}

const TeamPage = () => {
  const { user, activeRole } = useAuth();
  const { agents, setAgents, loading, error, fetchAgents } = useAgents();
  const { roles } = useRoles();
  const navigate = useNavigate();
  const roleSlug = getRoleSlug(activeRole);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite Form State
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteStreet, setInviteStreet] = useState('');
  const [inviteCity, setInviteCity] = useState('');
  const [invitePin, setInvitePin] = useState('');
  const [inviteState, setInviteState] = useState('');
  const [inviteSelectedRoles, setInviteSelectedRoles] = useState<string[]>([]);
  const [inviteAvatarFile, setInviteAvatarFile] = useState<File | null>(null);
  const [inviteAvatarPreviewUrl, setInviteAvatarPreviewUrl] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  const handleStatusChange = async (agent: Agent, newStatus: boolean) => {
    const originalAgents = [...agents];
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, enabled: newStatus } : a));
    const toastId = toast.loading(`Updating status for ${agent.firstName} ${agent.lastName}...`);
    try {
      await axiosClient.patch(`/admin/users/${agent.id}/status`, { enabled: newStatus });
      toast.success(`Status for ${agent.firstName} ${agent.lastName} updated successfully!`, { id: toastId });
    } catch (err) {
      setAgents(originalAgents);
      toast.error(`Failed to update status for ${agent.firstName} ${agent.lastName}.`, { id: toastId });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInviteAvatarFile(file);
        setInviteAvatarPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setInviteAvatarFile(null);
      setInviteAvatarPreviewUrl(null);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    const toastId = toast.loading('Sending invitation...');
    const formData = new FormData();
    formData.append('firstName', inviteFirstName);
    formData.append('lastName', inviteLastName);
    formData.append('email', inviteEmail);
    formData.append('password', invitePassword);
    formData.append('phone', invitePhone);
    formData.append('street', inviteStreet);
    formData.append('city', inviteCity);
    formData.append('pin', invitePin);
    formData.append('state', inviteState);
    inviteSelectedRoles.forEach(roleId => formData.append('roleIds', roleId));
    if (inviteAvatarFile) {
      formData.append('profilePicture', inviteAvatarFile);
    }
    try {
      await axiosClient.post('/admin/users/invite', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Invitation sent successfully!', { id: toastId });
      setIsInviteModalOpen(false);
      setInviteFirstName('');
      setInviteLastName('');
      setInviteEmail('');
      setInvitePassword('');
      setInvitePhone('');
      setInviteStreet('');
      setInviteCity('');
      setInvitePin('');
      setInviteState('');
      setInviteSelectedRoles([]);
      setInviteAvatarFile(null);
      setInviteAvatarPreviewUrl(null);
      fetchAgents();
    } catch (err) {
      toast.error('Failed to send invitation.', { id: toastId });
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) return <div className="p-4">Loading team data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const agentsToDisplay = Array.isArray(agents) ? agents : [];
  const filteredRoles = roles.filter(role => role.name !== 'ROLE_ADMIN');
  const isInviteFormValid = inviteFirstName && inviteLastName && inviteEmail && invitePassword && inviteSelectedRoles.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
            <Button
              size="sm"
              variant="ghost"
              className={cn('rounded-full', viewMode === 'grid' ? 'bg-[#00A3E0] text-white hover:bg-[#00A3E0] hover:text-white' : '')}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn('rounded-full', viewMode === 'table' ? 'bg-[#00A3E0] text-white hover:bg-[#00A3E0] hover:text-white' : '')}
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Invite New Member
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentsToDisplay.map((agent) => (
            <TeamMemberCard
              key={agent.id}
              agent={agent}
              onStatusChange={handleStatusChange}
              onCardClick={() => navigate(`/${roleSlug}/team/edit/${agent.id}`)}
            />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-slate-500">Name</TableHead>
              <TableHead className="text-xs text-slate-500">Email</TableHead>
              <TableHead className="text-xs text-slate-500">Roles</TableHead>
              <TableHead className="text-xs text-slate-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agentsToDisplay.map((agent) => (
              <TableRow key={agent.id} onClick={() => navigate(`/${roleSlug}/team/edit/${agent.id}`)} className="cursor-pointer">
                <TableCell className="font-semibold text-sm">{`${agent.firstName} ${agent.lastName}`}</TableCell>
                <TableCell className="font-semibold text-sm">{agent.email}</TableCell>
                <TableCell className="font-semibold text-sm">{agent.roles.map(r => r.replace('ROLE_', '')).join(', ')}</TableCell>
                <TableCell>{agent.enabled ? 'Active' : 'Inactive'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <InviteModal
        isOpen={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onInviteSubmit={handleInviteSubmit}
        isInviting={isInviting}
        isInviteFormValid={isInviteFormValid}
        inviteFirstName={inviteFirstName}
        setInviteFirstName={setInviteFirstName}
        inviteLastName={inviteLastName}
        setInviteLastName={setInviteLastName}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        invitePassword={invitePassword}
        setInvitePassword={setInvitePassword}
        invitePhone={invitePhone}
        setInvitePhone={setInvitePhone}
        inviteStreet={inviteStreet}
        setInviteStreet={setInviteStreet}
        inviteCity={inviteCity}
        setInviteCity={setInviteCity}
        invitePin={invitePin}
        setInvitePin={setInvitePin}
        inviteState={inviteState}
        setInviteState={setInviteState}
        inviteSelectedRoles={inviteSelectedRoles}
        setInviteSelectedRoles={setInviteSelectedRoles}
        inviteAvatarPreviewUrl={inviteAvatarPreviewUrl}
        handleFileChange={handleFileChange}
        filteredRoles={filteredRoles}
      />
    </motion.div>
  );
};

export default TeamPage;