import React, { useEffect } from 'react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { useRoles } from '@/hooks/useRoles';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { Plus } from 'lucide-react';

const TeamPage = () => {
  const { agents, setAgents, loading, error } = useAgents();
  const { roles } = useRoles();

  useEffect(() => {
    console.log("Team Page Data:", agents);
  }, [agents]);

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

  if (loading) return <div className="p-4">Loading team data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const agentsToDisplay = Array.isArray(agents) ? agents : (agents?.content || []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">Team Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Invite New Member
        </Button>
      </div>

      <div className="bg-card-bg rounded-lg shadow-md border border-card-border overflow-hidden">
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
            {agentsToDisplay.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              agentsToDisplay.map((agent) => {
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamPage;
