import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import { useAgents, Agent } from '@/hooks/useAgents';
import { useRoles } from '@/hooks/useRoles';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axiosClient from '@/api/axiosClient';
import { Plus, User, Mail, Briefcase, X, Check, ChevronsUpDown, Camera } from 'lucide-react'; // Added Camera icon
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added AvatarImage
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const TeamPage = () => {
  const { agents, setAgents, loading, error, fetchAgents } = useAgents();
  const { roles } = useRoles();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // State for Invite Form
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

  // State for Edit Form
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editState, setEditState] = useState('');
  const [editSelectedRoles, setEditSelectedRoles] = useState<string[]>([]);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreviewUrl, setEditAvatarPreviewUrl] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Refs for hidden file inputs
  const inviteFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("Team Page Data:", agents);
  }, [agents]);

  useEffect(() => {
    if (isEditSheetOpen && editingAgent) {
      setEditFirstName(editingAgent.firstName);
      setEditLastName(editingAgent.lastName);
      setEditEmail(editingAgent.email);
      setEditPhone(editingAgent.phone || '');
      setEditStreet(editingAgent.street || '');
      setEditCity(editingAgent.city || '');
      setEditPin(editingAgent.pin || '');
      setEditState(editingAgent.state || '');
      const agentRoleIds = roles
        .filter(r => editingAgent.roles.includes(r.name))
        .map(r => r.id.toString());
      setEditSelectedRoles(agentRoleIds);
      setEditAvatarPreviewUrl(editingAgent.profilePictureUrl || null);
      setEditAvatarFile(null);
    }
  }, [isEditSheetOpen, editingAgent, roles]);

  const handleStatusChange = async (agent: Agent, newStatus: boolean) => {
    const originalAgents = { ...agents };

    setAgents(prev => {
      if (Array.isArray(prev)) {
        return prev.map(a => a.id === agent.id ? { ...a, enabled: newStatus } : a);
      }
      return {
        ...prev,
        content: prev.content.map(a => a.id === agent.id ? { ...a, enabled: newStatus } : a)
      };
    });

    const toastId = toast.loading(`Updating status for ${agent.firstName} ${agent.lastName}...`);

    try {
      await axiosClient.patch(`/admin/users/${agent.id}/status`, { enabled: newStatus });
      toast.success(`Status for ${agent.firstName} ${agent.lastName} updated successfully!`, { id: toastId });
    } catch (err) {
      setAgents(originalAgents);
      toast.error(`Failed to update status for ${agent.firstName} ${agent.lastName}.`, { id: toastId });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'invite' | 'edit') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'invite') {
          setInviteAvatarFile(file);
          setInviteAvatarPreviewUrl(reader.result as string);
        } else {
          setEditAvatarFile(file);
          setEditAvatarPreviewUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (type === 'invite') {
        setInviteAvatarFile(null);
        setInviteAvatarPreviewUrl(null);
      } else {
        setEditAvatarFile(null);
        setEditAvatarPreviewUrl(editingAgent?.profilePictureUrl || null);
      }
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
      await axiosClient.post('/admin/users/invite', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Invitation sent successfully!', { id: toastId });
      setIsInviteModalOpen(false);
      // Reset form fields
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent?.id) return;

    setIsSavingEdit(true);
    const toastId = toast.loading(`Saving changes for ${editFirstName} ${editLastName}...`);

    const formData = new FormData();
    formData.append('firstName', editFirstName);
    formData.append('lastName', editLastName);
    formData.append('email', editEmail);
    formData.append('phone', editPhone);
    formData.append('street', editStreet);
    formData.append('city', editCity);
    formData.append('pin', editPin);
    formData.append('state', editState);
    editSelectedRoles.forEach(roleId => formData.append('roleIds', roleId));
    if (editAvatarFile) {
      formData.append('profilePicture', editAvatarFile);
    }

    try {
      await axiosClient.put(`/admin/users/${editingAgent.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Agent updated successfully!', { id: toastId });
      setIsEditSheetOpen(false);
      setEditingAgent(null);
      setEditAvatarFile(null);
      setEditAvatarPreviewUrl(null);
      fetchAgents();
    } catch (err) {
      toast.error('Failed to update agent.', { id: toastId });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getAvatarSrc = (path: string | null | undefined) => {
    if (!path) return undefined;
    return `http://localhost:8080${path}`;
  };

  if (loading) return <div className="p-4">Loading team data...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const agentsToDisplay = agents && 'content' in agents ? agents.content : (Array.isArray(agents) ? agents : []);
  const filteredRoles = roles.filter(role => role.name !== 'ROLE_ADMIN');

  const isInviteFormValid = inviteFirstName && inviteLastName && inviteEmail && invitePassword && inviteSelectedRoles.length > 0;
  const isEditFormValid = editFirstName && editLastName && editEmail && editSelectedRoles.length > 0;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
        <Button onClick={() => {
          setIsInviteModalOpen(true);
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
        }}>
          <Plus className="h-4 w-4 mr-2" /> Invite New Member
        </Button>
      </div>

      <div className="bg-card-bg rounded-lg shadow-md border border-card-border p-4">
        {agentsToDisplay.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No staff members found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentsToDisplay.map((agent) => (
              <div
                key={agent.id}
                className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer"
                onClick={() => {
                  setEditingAgent(agent);
                  setIsEditSheetOpen(true);
                }}
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={getAvatarSrc(agent.profilePictureUrl)} alt={`${agent.firstName} ${agent.lastName}`} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {`${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{`${agent.firstName} ${agent.lastName}`}</h3>
                    <p className="text-sm text-muted-foreground">{agent.email}</p>
                  </div>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={(newStatus) => handleStatusChange(agent, newStatus)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.roles.map(role => (
                    <Badge key={role} variant="secondary">
                      <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" /> {role.replace('ROLE_', '')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite New Member Dialog */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>
              Enter the details to invite a new team member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={() => inviteFileInputRef.current?.click()}>
                    <AvatarImage src={inviteAvatarPreviewUrl || undefined} alt="Avatar Preview" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {inviteFirstName && inviteLastName ? `${inviteFirstName.charAt(0)}${inviteLastName.charAt(0)}`.toUpperCase() : <User className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer" onClick={() => inviteFileInputRef.current?.click()}>
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={inviteFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'invite')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name <span className="text-destructive">*</span></Label>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Last Name"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inviteEmail" className="text-right">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invitePassword" className="text-right">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="invitePassword"
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invitePhone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="invitePhone"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Address</Label>
                <div className="col-span-3 grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Street"
                    value={inviteStreet}
                    onChange={(e) => setInviteStreet(e.target.value)}
                  />
                  <Input
                    placeholder="City"
                    value={inviteCity}
                    onChange={(e) => setInviteCity(e.target.value)}
                  />
                  <Input
                    placeholder="Pin Code"
                    value={invitePin}
                    onChange={(e) => setInvitePin(e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={inviteState}
                    onChange={(e) => setInviteState(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="inviteRoles" className="text-right">
                  Roles <span className="text-destructive">*</span>
                </Label>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="col-span-3 justify-between"
                    >
                      {inviteSelectedRoles.length > 0
                        ? inviteSelectedRoles
                            .map(roleId => filteredRoles.find(r => r.id.toString() === roleId)?.name.replace('ROLE_', ''))
                            .filter(Boolean)
                            .join(', ')
                        : "Select roles..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search role..." />
                      <CommandEmpty>No role found.</CommandEmpty>
                      <CommandGroup>
                        {filteredRoles.map((role) => (
                          <CommandItem
                            key={role.id}
                            onSelect={() => {
                              setInviteSelectedRoles(prev =>
                                prev.includes(role.id.toString())
                                  ? prev.filter(r => r !== role.id.toString())
                                  : [...prev, role.id.toString()]
                              );
                            }}
                            style={{ pointerEvents: 'auto' }}
                          >
                            <Checkbox
                              checked={inviteSelectedRoles.includes(role.id.toString())}
                              className="mr-2"
                            />
                            {role.name.replace('ROLE_', '')}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isInviting || !isInviteFormValid}>
                {isInviting && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-2 border-white border-t-transparent" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit {`${editFirstName} ${editLastName}`}</SheetTitle>
            <SheetDescription>
              Make changes to the agent's profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                  <AvatarImage src={editAvatarPreviewUrl || undefined} alt="Avatar Preview" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {editFirstName && editLastName ? `${editFirstName.charAt(0)}${editLastName.charAt(0)}`.toUpperCase() : <User className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={editFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'edit')}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Last Name"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEmail">Email <span className="text-destructive">*</span></Label>
              <Input
                id="editEmail"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Street"
                  value={editStreet}
                  onChange={(e) => setEditStreet(e.target.value)}
                />
                <Input
                  placeholder="City"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
                <Input
                  placeholder="Pin Code"
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                />
                <Input
                  placeholder="State"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRoles">Roles <span className="text-destructive">*</span></Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="justify-between"
                  >
                    {editSelectedRoles.length > 0
                      ? editSelectedRoles
                          .map(roleId => filteredRoles.find(r => r.id.toString() === roleId)?.name.replace('ROLE_', ''))
                          .filter(Boolean)
                          .join(', ')
                      : "Select roles..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search role..." />
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup>
                      {filteredRoles.map((role) => (
                        <CommandItem
                          key={role.id}
                          onSelect={() => {
                            setEditSelectedRoles(prev =>
                              prev.includes(role.id.toString())
                                ? prev.filter(r => r !== role.id.toString())
                                : [...prev, role.id.toString()]
                            );
                          }}
                          style={{ pointerEvents: 'auto' }}
                        >
                          <Checkbox
                            checked={editSelectedRoles.includes(role.id.toString())}
                            className="mr-2"
                          />
                          {role.name.replace('ROLE_', '')}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button type="submit" disabled={isSavingEdit || !isEditFormValid}>
              {isSavingEdit && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-2 border-white border-t-transparent" />}
              Save Changes
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TeamPage;
