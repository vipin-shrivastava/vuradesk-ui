import React from 'react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { useRoles } from '@/hooks/useRoles';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';

const AgentManagement = () => {
  const { agents, setAgents, loading, error } = useAgents();
  const { roles } = useRoles();

  const handleStatusChange = async (agent: Agent, newStatus: boolean) => {
    const originalAgents = [...agents];
    const updatedAgents = agents.map(a => a.id === agent.id ? { ...a, enabled: newStatus } : a);
    setAgents(updatedAgents);

    const toastId = toast.loading(`Updating status for ${agent.fullName}...`);

    try {
      await axiosClient.patch(`/admin/users/${agent.id}/status`, { enabled: newStatus });
      toast.success(`Status for ${agent.fullName} updated successfully!`, { id: toastId });
    } catch (err) {
      setAgents(originalAgents);
      toast.error(`Failed to update status for ${agent.fullName}.`, { id: toastId });
    }
  };

  const handleRoleChange = async (agentId: string, roleId: string) => {
    const originalAgents = [...agents];
    const roleName = roles.find(r => r.id === roleId)?.name || '';
    const updatedAgents = agents.map(a => a.id === agentId ? { ...a, roles: [roleName] } : a);
    setAgents(updatedAgents);

    const toastId = toast.loading('Updating role...');
    try {
      await axiosClient.patch(`/admin/users/${agentId}/role`, { roleId });
      toast.success('Role updated successfully!', { id: toastId });
    } catch (err) {
      setAgents(originalAgents);
      toast.error('Failed to update role.', { id: toastId });
    }
  };

  if (loading) return <div>Loading staff...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-text-main mb-4">Staff Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => {
            const currentRoleId = roles.find(r => agent.roles.includes(r.name))?.id?.toString() || '';

            return (
              <TableRow key={agent.id}>
                <TableCell>{agent.fullName}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>
                  <Select onValueChange={(roleId) => handleRoleChange(agent.id, roleId)} value={currentRoleId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id.toString()}>{role.name.replace('ROLE_', '')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={(newStatus) => handleStatusChange(agent, newStatus)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgentManagement;
