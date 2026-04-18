import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/hooks/useRoles';

interface InviteModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onInviteSubmit: (e: React.FormEvent) => void;
  isInviting: boolean;
  isInviteFormValid: boolean;
  inviteFirstName: string;
  setInviteFirstName: (value: string) => void;
  inviteLastName: string;
  setInviteLastName: (value: string) => void;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  invitePassword: string;
  setInvitePassword: (value: string) => void;
  invitePhone: string;
  setInvitePhone: (value: string) => void;
  inviteStreet: string;
  setInviteStreet: (value: string) => void;
  inviteCity: string;
  setInviteCity: (value: string) => void;
  invitePin: string;
  setInvitePin: (value: string) => void;
  inviteState: string;
  setInviteState: (value: string) => void;
  inviteSelectedRoles: string[];
  setInviteSelectedRoles: (value: string[]) => void;
  inviteAvatarPreviewUrl: string | null;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>, type: 'invite' | 'edit') => void;
  filteredRoles: Role[];
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onOpenChange,
  onInviteSubmit,
  isInviting,
  isInviteFormValid,
  inviteFirstName,
  setInviteFirstName,
  inviteLastName,
  setInviteLastName,
  inviteEmail,
  setInviteEmail,
  invitePassword,
  setInvitePassword,
  invitePhone,
  setInvitePhone,
  inviteStreet,
  setInviteStreet,
  inviteCity,
  setInviteCity,
  invitePin,
  setInvitePin,
  inviteState,
  setInviteState,
  inviteSelectedRoles,
  setInviteSelectedRoles,
  inviteAvatarPreviewUrl,
  handleFileChange,
  filteredRoles,
}) => {
  const inviteFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white p-0">
        <div className="border-t-4 border-[#00A3E0]"></div>
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Invite New Member</DialogTitle>
          <DialogDescription>Enter the details to invite a new team member.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onInviteSubmit}>
          <div className="grid gap-4 p-6">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inviteFirstName">First Name <span className="text-destructive">*</span></Label>
                <Input
                  id="inviteFirstName"
                  placeholder="First Name"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="inviteLastName">Last Name <span className="text-destructive">*</span></Label>
                <Input
                  id="inviteLastName"
                  placeholder="Last Name"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inviteEmail">Email <span className="text-destructive">*</span></Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invitePassword">Password <span className="text-destructive">*</span></Label>
              <Input
                id="invitePassword"
                type="password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invitePhone">Phone</Label>
              <Input
                id="invitePhone"
                value={invitePhone}
                onChange={(e) => setInvitePhone(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="inviteStreet">Street</Label>
                <Input
                  id="inviteStreet"
                  placeholder="Street"
                  value={inviteStreet}
                  onChange={(e) => setInviteStreet(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="inviteCity">City</Label>
                <Input
                  id="inviteCity"
                  placeholder="City"
                  value={inviteCity}
                  onChange={(e) => setInviteCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="inviteState">State</Label>
                <Input
                  id="inviteState"
                  placeholder="State"
                  value={inviteState}
                  onChange={(e) => setInviteState(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="invitePin">Pin Code</Label>
                <Input
                  id="invitePin"
                  placeholder="Pin Code"
                  value={invitePin}
                  onChange={(e) => setInvitePin(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inviteRoles">Roles <span className="text-destructive">*</span></Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="justify-between"
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
                            setInviteSelectedRoles(
                              inviteSelectedRoles.includes(role.id.toString())
                                ? inviteSelectedRoles.filter(r => r !== role.id.toString())
                                : [...inviteSelectedRoles, role.id.toString()]
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
          <DialogFooter className="p-6 pt-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              type="submit"
              disabled={isInviting || !isInviteFormValid}
              className="bg-gradient-to-r from-[#00A3E0] to-[#0081b0] text-white"
            >
              {isInviting && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-2 border-white border-t-transparent" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
