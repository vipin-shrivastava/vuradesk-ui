import React, { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, ChevronsUpDown, Lock, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/hooks/useRoles';
import { Permission, PermissionGroup } from '@/pages/admin/TeamPage';
import { motion } from 'framer-motion';

interface EditAgentDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  isFormValid: boolean;
  activeTab: string;
  setActiveTab: (value: string) => void;
  // Details Tab Props
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  street: string;
  setStreet: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  pin: string;
  setPin: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  selectedRoles: string[];
  setSelectedRoles: (value: string[]) => void;
  avatarPreviewUrl: string | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, type: 'invite' | 'edit') => void;
  filteredRoles: Role[];
  // Permissions Tab Props
  loadingPermissions: boolean;
  permissionsError: string | null;
  permissionGroups: PermissionGroup[];
  selectedAgentGroups: string[];
  setSelectedAgentGroups: (value: string[]) => void;
  groupedPermissions: Record<string, Permission[]>;
  inheritedSources: { [key: string]: string[] };
  selectedDirectPermissions: Record<string, boolean>;
  setSelectedDirectPermissions: (value: Record<string, boolean>) => void;
}

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
          <span key={i} className="bg-yellow-200 text-yellow-800">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export const EditAgentDrawer: React.FC<EditAgentDrawerProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSaving,
  isFormValid,
  activeTab,
  setActiveTab,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  street,
  setStreet,
  city,
  setCity,
  pin,
  setPin,
  state,
  setState,
  selectedRoles,
  setSelectedRoles,
  avatarPreviewUrl,
  handleFileChange,
  filteredRoles,
  loadingPermissions,
  permissionsError,
  permissionGroups,
  selectedAgentGroups,
  setSelectedAgentGroups,
  groupedPermissions,
  inheritedSources,
  selectedDirectPermissions,
  setSelectedDirectPermissions,
}) => {
  const editFileInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPermissions = useMemo(() => {
    if (!searchTerm) {
      return groupedPermissions;
    }
    const filtered: Record<string, Permission[]> = {};
    for (const label in groupedPermissions) {
      const matchingPermissions = groupedPermissions[label].filter(perm =>
        perm.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingPermissions.length > 0) {
        filtered[label] = matchingPermissions;
      }
    }
    return filtered;
  }, [searchTerm, groupedPermissions]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit {`${firstName} ${lastName}`}</SheetTitle>
          <SheetDescription>Make changes to the agent's profile and permissions here.</SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions & Access</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-grow overflow-y-auto p-4 -mx-6">
            <form onSubmit={onSubmit} className="grid gap-4 py-4 px-6">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                    <AvatarImage src={avatarPreviewUrl || undefined} alt="Avatar Preview" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : <User className="h-12 w-12" />}
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
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEmail">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                  <Input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    placeholder="Pin Code"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                  <Input
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
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
                      {selectedRoles.length > 0
                        ? selectedRoles
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
                              setSelectedRoles(
                                selectedRoles.includes(role.id.toString())
                                  ? selectedRoles.filter(r => r !== role.id.toString())
                                  : [...selectedRoles, role.id.toString()]
                              );
                            }}
                            style={{ pointerEvents: 'auto' }}
                          >
                            <Checkbox
                              checked={selectedRoles.includes(role.id.toString())}
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
              <Button type="submit" disabled={isSaving || !isFormValid}>
                {isSaving && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-2 border-white border-t-transparent" />}
                Save Changes
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="permissions" className="flex-grow overflow-y-auto p-4 -mx-6">
            {loadingPermissions ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading permissions...</p>
              </div>
            ) : permissionsError ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
                <AlertTriangle className="w-10 h-10 mb-4" />
                <p className="font-semibold">{permissionsError}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-4 py-4 px-6">
                <div className="grid gap-2">
                  <Label htmlFor="agentGroups">Assigned Groups</Label>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="justify-between"
                      >
                        {selectedAgentGroups.length > 0
                          ? selectedAgentGroups
                              .map(groupId => permissionGroups.find(g => g.id === groupId)?.name)
                              .filter(Boolean)
                              .join(', ')
                          : "Select groups..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search group..." />
                        <CommandEmpty>No group found.</CommandEmpty>
                        <CommandGroup>
                          {permissionGroups.map((group) => (
                            <CommandItem
                              key={group.id}
                              onSelect={() => {
                                setSelectedAgentGroups(
                                  selectedAgentGroups.includes(group.id)
                                    ? selectedAgentGroups.filter(gId => gId !== group.id)
                                    : [...selectedAgentGroups, group.id]
                                );
                              }}
                              style={{ pointerEvents: 'auto' }}
                            >
                              <Checkbox
                                checked={selectedAgentGroups.includes(group.id)}
                                className="mr-2"
                              />
                              {group.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-4">
                  <Label>Individual Permissions</Label>
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                  {Object.entries(filteredPermissions).map(([label, permissions]) => (
                    <motion.div layout key={label}>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">{label}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {permissions.map(perm => {
                          const isInherited = inheritedSources[perm.id] && inheritedSources[perm.id].length > 0;
                          const isDirectlyAssigned = selectedDirectPermissions[perm.id];
                          const isChecked = isDirectlyAssigned || isInherited;

                          return (
                            <motion.div layout key={perm.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={`perm-${perm.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  if (!isInherited) {
                                    setSelectedDirectPermissions({
                                      ...selectedDirectPermissions,
                                      [perm.id]: checked as boolean,
                                    });
                                  }
                                }}
                                disabled={isInherited}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={`perm-${perm.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  <Highlight text={perm.name} highlight={searchTerm} />
                                </label>
                                {isInherited && (
                                  <p className="text-xs text-muted-foreground flex items-center">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Inherited from: {inheritedSources[perm.id].join(', ')}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-2 border-white border-t-transparent" /> : null}
                  Save Changes
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
