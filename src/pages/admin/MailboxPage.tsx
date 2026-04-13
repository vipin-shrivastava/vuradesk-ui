import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Eye, EyeOff, Mail, Trash2 } from 'lucide-react'; // Added Mail and Trash2 icons
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Added Avatar imports

// Define the Mailbox interface
interface Mailbox {
  id?: string;
  configurationName: string;
  host: string;
  port: number;
  username: string;
  isActive: boolean;
}

// Placeholder for a real permission check function
// In a real application, this would come from an authentication/authorization context or hook
const hasPermission = (permission: string): boolean => {
  // For now, we'll return true to allow deletion, but this should be replaced
  // with actual permission logic (e.g., checking user roles/permissions from a context)
  console.log(`Checking permission: ${permission}`);
  return true; // Assume permission for now
};

const MailboxPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<Mailbox | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [mailboxToDelete, setMailboxToDelete] = useState<Mailbox | null>(null);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loadingMailboxes, setLoadingMailboxes] = useState(true);
  const [errorMailboxes, setErrorMailboxes] = useState<string | null>(null);

  // Form state for the modal
  const [formConfigurationName, setFormConfigurationName] = useState('');
  const [formHost, setFormHost] = useState('');
  const [formPort, setFormPort] = useState<number | ''>('');
  const [formUsername, setFormUsername] = useState('');
  const [formIsActive, setFormIsActive] = useState(false);
  const [formPassword, setFormPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const fetchMailboxes = async () => {
    setLoadingMailboxes(true);
    setErrorMailboxes(null);
    try {
      const response = await axiosClient.get('/admin/email-channels');
      const fetchedMailboxes: Mailbox[] = response.data.map((channel: any) => ({
        id: channel.id,
        configurationName: channel.configurationName || channel.username,
        host: channel.host,
        port: channel.port,
        username: channel.username,
        isActive: channel.isActive,
      }));
      setMailboxes(fetchedMailboxes);
    } catch (err) {
      console.error('Failed to fetch mailboxes:', err);
      setErrorMailboxes('Failed to load mailboxes.');
      toast.error('Failed to load mailboxes.');
    } finally {
      setLoadingMailboxes(false);
    }
  };

  useEffect(() => {
    fetchMailboxes();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      if (editingMailbox) {
        setFormConfigurationName(editingMailbox.configurationName);
        setFormHost(editingMailbox.host);
        setFormPort(editingMailbox.port);
        setFormUsername(editingMailbox.username);
        setFormIsActive(editingMailbox.isActive);
        setFormPassword(''); // Password is not fetched for security, user must re-enter if changing
      } else {
        setFormConfigurationName('');
        setFormHost('');
        setFormPort('');
        setFormUsername('');
        setFormIsActive(false);
        setFormPassword('');
      }
      setIsPasswordVisible(false);
    }
  }, [isModalOpen, editingMailbox]);

  const handleAddMailboxClick = () => {
    setEditingMailbox(null);
    setIsModalOpen(true);
  };

  const handleEditMailbox = (mailbox: Mailbox) => {
    setEditingMailbox(mailbox);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (mailbox: Mailbox) => {
    setMailboxToDelete(mailbox);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteMailbox = async () => {
    if (!mailboxToDelete?.id) {
      toast.error('Cannot delete mailbox: ID is missing.');
      return;
    }
    const toastId = toast.loading('Deleting mailbox...');
    try {
      await axiosClient.delete(`/settings/admin/email-channels/${mailboxToDelete.id}`); // Updated path
      toast.success('Mailbox deleted successfully!', { id: toastId });
      setIsConfirmModalOpen(false);
      setMailboxToDelete(null);
      fetchMailboxes();
    } catch (error) {
      console.error('Failed to delete mailbox:', error);
      toast.error('Failed to delete mailbox.', { id: toastId });
    }
  };

  const handleToggleStatus = async (mailboxId: string, currentStatus: boolean) => {
    const toastId = toast.loading('Updating mailbox status...');
    try {
      await axiosClient.put(`/admin/email-channels/${mailboxId}/status`, { isActive: !currentStatus });
      toast.success('Mailbox status updated!', { id: toastId });
      fetchMailboxes();
    } catch (error) {
      console.error('Failed to update mailbox status:', error);
      toast.error('Failed to update mailbox status.', { id: toastId });
    }
  };

  const handleSaveMailbox = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(editingMailbox ? 'Updating mailbox...' : 'Adding new mailbox...');

    const mailboxData: any = {
      configurationName: formConfigurationName,
      host: formHost,
      port: typeof formPort === 'number' ? formPort : 0,
      username: formUsername,
      isActive: formIsActive,
    };

    if (!editingMailbox || formPassword !== '') {
      mailboxData.password = formPassword;
    }

    try {
      if (editingMailbox) {
        await axiosClient.put(`/admin/email-channels/${editingMailbox.id}`, mailboxData);
        toast.success('Mailbox updated successfully!', { id: toastId });
      } else {
        await axiosClient.post('/admin/email-channels', mailboxData);
        toast.success('Mailbox added successfully!', { id: toastId });
      }
      setIsModalOpen(false);
      setEditingMailbox(null);
      fetchMailboxes();
    } catch (error) {
      console.error('Failed to save mailbox:', error);
      toast.error('Failed to save mailbox.', { id: toastId });
    }
  };

  // Determine if the delete button should be disabled based on permissions
  const canDeleteMailbox = hasPermission('system:settings');

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main">Mailbox Settings</h1>
        <Button onClick={handleAddMailboxClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Mailbox
        </Button>
      </div>

      {loadingMailboxes ? (
        <div className="text-center py-8">Loading mailboxes...</div>
      ) : errorMailboxes ? (
        <div className="text-red-500 text-center py-8">{errorMailboxes}</div>
      ) : mailboxes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-8">
          <p className="text-lg text-gray-500 mb-4">No mailboxes configured yet.</p>
          <Button onClick={handleAddMailboxClick}>
            Add First Mailbox
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mailboxes.map((mailbox) => {
            console.log("Card Data:", mailbox); // Verification log
            return (
              <div
                key={mailbox.id}
                className="relative bg-card rounded-lg shadow-sm border-2 border-gray-200 p-4 hover:shadow-md transition-shadow duration-200" // Updated styling
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-gray-400 hover:text-destructive"
                  onClick={() => handleDeleteClick(mailbox)}
                  disabled={!canDeleteMailbox}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="flex items-start gap-4">
                  <Avatar className="bg-primary/10">
                    <AvatarFallback>
                      <Mail className="h-6 w-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-1">
                      {mailbox.configurationName || mailbox.username}
                    </h2>
                    <p className="text-gray-600 text-sm mb-2">Host: {mailbox.host}:{mailbox.port}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={mailbox.isActive ? "success" : "secondary"}>
                        {mailbox.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={mailbox.isActive}
                        onCheckedChange={() => handleToggleStatus(mailbox.id!, mailbox.isActive)}
                      />
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditMailbox(mailbox)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mailbox Configuration Modal (Dialog) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] bg-background border border-slate-200/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle>{editingMailbox ? 'Edit Mailbox' : 'Add New Mailbox'}</DialogTitle>
            <DialogDescription>
              {editingMailbox
                ? 'Edit the details of your existing mailbox.'
                : 'Configure a new email mailbox to integrate with the system.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMailbox}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="font-semibold text-right">
                  Configuration Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formConfigurationName}
                  onChange={(e) => setFormConfigurationName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Support Inbox"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="host" className="font-semibold text-right">
                  Host & Port
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                  <Input
                    id="host"
                    name="host"
                    value={formHost}
                    onChange={(e) => setFormHost(e.target.value)}
                    placeholder="e.g., mail.example.com"
                    required
                  />
                  <Input
                    id="port"
                    name="port"
                    type="number"
                    value={formPort}
                    onChange={(e) => setFormPort(parseInt(e.target.value) || '')}
                    placeholder="e.g., 587"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="font-semibold text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., support@example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="font-semibold text-right">
                  Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={editingMailbox && formPassword === '' ? '********' : formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="pr-10"
                    placeholder={editingMailbox ? 'Leave blank to keep current' : 'Enter password'}
                    required={!editingMailbox}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-0 h-full px-3"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div> {/* End of main grid gap-4 py-4 div */}

            {/* Active Toggle in a clean, separate flex row */}
            <div className="flex items-center justify-between py-4">
              <Label htmlFor="isActive" className="font-semibold">
                Active
              </Label>
              <Switch
                id="isActive"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>

            <DialogFooter>
              <Button variant="secondary" type="button" onClick={() => console.log('Test Connection')}>
                Test Connection
              </Button>
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Deletion */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background border border-slate-200/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the mailbox.
            </DialogDescription>
          </DialogHeader>
          <p className="mb-4">
            Are you sure you want to delete the mailbox "
            <span className="font-semibold">{mailboxToDelete?.configurationName || mailboxToDelete?.username}</span>
            "?
          </p>
          {mailboxToDelete?.isActive && (
            <p className="text-red-600 font-medium mb-4">
              This mailbox is currently active. Deleting it might disrupt services.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsConfirmModalOpen(false);
              setMailboxToDelete(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteMailbox}
              disabled={!canDeleteMailbox}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MailboxPage;
