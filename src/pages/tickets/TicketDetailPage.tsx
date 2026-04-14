import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTicket, ThreadEntry, Attachment } from '@/hooks/useTicket';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { Paperclip, Send, Loader2, ArrowLeft, Lock, ShieldCheck, User as UserIcon, FileText, Download, X } from 'lucide-react';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { formatBackendDate } from '@/utils/dateUtils';
import SecureImage from '@/components/SecureImage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
}

// Helper function to get initials for the avatar
const getInitials = (fullName?: string) => {
  if (!fullName) return '?';
  const names = fullName.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return fullName[0].toUpperCase();
};

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { ticket, loading, error, refetch, setTicket } = useTicket(ticketId);
  const { user, activeRole } = useAuth();
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRef = useAutoScroll(ticket?.threadEntries);

  useEffect(() => {
    const fetchAgents = async () => {
      setAgentsLoading(true);
      try {
        const response = await axiosClient.get('/users/list/agents-admins');
        setAgents(response.data.content || []);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        toast.error('Failed to load agents for assignment.');
      } finally {
        setAgentsLoading(false);
      }
    };

    if (activeRole === 'ADMIN' || activeRole === 'AGENT') {
      fetchAgents();
    }
  }, [activeRole]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(event.target.files as FileList)]);
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(event.dataTransfer.files)]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newReply.trim() && selectedFiles.length === 0) || !ticketId || !ticket || !user) return;

    setIsReplying(true);
    let attachmentIds: string[] = [];

    if (selectedFiles.length > 0) {
      toast.info('Uploading attachments...');
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileData = new FormData();
          fileData.append('file', file);
          const response = await axiosClient.post('/attachments/upload', fileData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          return response.data.id || response.data.uuid || response.data;
        });
        attachmentIds = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error('Failed to upload one or more attachments:', uploadError);
        toast.error('Failed to upload attachments. Reply cancelled.');
        setIsReplying(false);
        return;
      }
    }

    const payload = {
      message: newReply,
      internal: isInternalNote,
      attachmentIds: attachmentIds,
    };

    const tempId = `temp-${Date.now()}`;
    const newEntryObject: ThreadEntry = {
      id: tempId,
      posterFirstName: user.firstName || '',
      posterLastName: user.lastName || '',
      posterId: user.id,
      posterRole: activeRole as string,
      message: newReply,
      createdAt: new Date().toISOString(),
      internal: isInternalNote,
      attachments: [],
    };

    setTicket(prev => prev ? ({ ...prev, threadEntries: [...prev.threadEntries, newEntryObject] }) : null);
    setNewReply('');
    setSelectedFiles([]);
    setIsInternalNote(false);

    try {
      const response = await axiosClient.post(`/tickets/${ticketId}/replies`, payload);
      const savedEntry = response.data;

      setTicket(prev => {
        if (!prev) return null;
        const newStatus = (activeRole === 'AGENT' && !isInternalNote) ? 'IN_PROGRESS' : prev.status;
        return {
          ...prev,
          status: newStatus,
          threadEntries: prev.threadEntries.map(entry => entry.id === tempId ? savedEntry : entry),
        };
      });

      toast.success('Reply submitted successfully!');
    } catch (err) {
      console.error('Failed to submit reply:', err);
      toast.error('Failed to submit reply. Please try again.');
      setTicket(ticket);
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticketId || !ticket || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const response = await axiosClient.patch(`/tickets/${ticketId}/status`, { status: newStatus });
      setTicket(prev => prev ? { ...prev, status: response.data.status } : null);
      toast.success(`Ticket status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      toast.error('Failed to update ticket status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignAgent = async (value: string) => {
    if (!ticketId || isAssigning) return;

    setIsAssigning(true);
    try {
      const userIdToSend = value === "unassigned" ? null : value;
      const response = await axiosClient.patch(`/tickets/${ticketId}/assign`, { userId: userIdToSend });
      setTicket(prev => prev ? { ...prev, ...response.data } : null);
      if (value === "unassigned") {
        toast.success('Ticket unassigned successfully!');
      } else {
        const agent = agents.find(a => a.id === value);
        toast.success(`Ticket assigned to ${agent?.firstName} ${agent?.lastName}`);
      }
    } catch (err) {
      console.error('Failed to assign agent:', err);
      toast.error('Failed to assign agent. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const cleanSrc = attachment.downloadUrl.startsWith('/api/') ? attachment.downloadUrl.replace('/api/', '') : attachment.downloadUrl;
      const response = await axiosClient.get(cleanSrc, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file.');
    }
  };

  const handleDownloadAll = async (entryId?: string) => {
    if (!ticketId || isDownloadingAll) return;

    if (entryId && typeof entryId !== 'string' && typeof entryId !== 'number') {
        console.error("handleDownloadAll received an invalid entryId (likely an event object). Expected string or undefined. Received:", entryId);
        toast.error("An error occurred preparing the download.");
        return;
    }

    setIsDownloadingAll(true);
    toast.info('Preparing your download...');
    try {
      const urlPath = `/attachments/download/all?ticketId=${ticketId}${entryId ? `&threadEntryId=${entryId}` : ''}`;
      const response = await axiosClient.get(urlPath, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ticket_#${ticketId}_Attachments.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download all failed:', error);
      toast.error('Failed to download all attachments.');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading ticket details...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!ticket || !user) return <div className="text-center p-8">Ticket not found or user not loaded.</div>;

  const replyBoxBorder = isDragging
    ? 'border-blue-500 bg-blue-50/10 ring-2 ring-blue-500/20'
    : 'border-slate-700';

  const renderAttachment = (attachment: Attachment) => (
    <div key={attachment.id} className="relative group w-32 h-32 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => attachment.fileType && attachment.fileType.startsWith('image/') ? setSelectedImage(attachment) : handleDownload(attachment)}>
      {attachment.fileType && attachment.fileType.startsWith('image/') ? (
        <SecureImage
          id={attachment.id}
          src={attachment.downloadUrl}
          alt={attachment.fileName}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 cursor-default">
          <FileText className="w-10 h-10 text-slate-400" />
          <span className="text-xs text-center text-slate-500 dark:text-slate-300 mt-2 w-full truncate px-1" title={attachment.fileName}>
            {attachment.fileName}
          </span>
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-white/20 dark:group-hover:bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-end p-2">
        <button
          onClick={(e) => {
             e.stopPropagation();
             handleDownload(attachment);
          }}
          className="pointer-events-auto p-1.5 bg-white/50 dark:bg-black/50 shadow-md rounded-md text-slate-800 dark:text-white hover:bg-white dark:hover:bg-black transition-colors"
          aria-label="Download file"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );

  const renderThreadEntry = (entry: ThreadEntry, index: number) => {
    const isMe = entry.posterId === user.id;
    const effectiveRole = entry.posterRole;
    const isAdmin = effectiveRole === 'ADMIN';

    let containerClasses = `flex flex-col w-full mb-4 ${isMe ? 'items-end' : 'items-start'}`;

    const hasText = entry.message && entry.message.trim().length > 0;
    const hasAttachments = entry.attachments && entry.attachments.length > 0;

    let bubbleClasses = 'p-3 rounded-xl mb-1 ';

    if (isMe) {
      bubbleClasses += hasText ? 'bg-blue-600/90 text-white shadow-sm' : 'bg-transparent text-white p-0';
    } else if (entry.internal) {
      bubbleClasses += hasText ? 'bg-yellow-100/50 dark:bg-slate-900 border-l-4 border-yellow-400 dark:border-slate-800 text-text-main shadow-sm' : 'bg-transparent p-0 text-text-main';
    } else {
      bubbleClasses += hasText ? 'bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-text-main shadow-sm' : 'bg-transparent p-0 text-text-main';
    }

    const displayName = isMe ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'You' : `${entry.posterFirstName || ''} ${entry.posterLastName || ''}`.trim() || 'User';
    const avatarInitials = getInitials(displayName);
    const avatarColor = isMe ? 'bg-blue-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

    return (
      <div key={`${entry.id}-${index}`} className={containerClasses}>
        <div className={`flex items-center mb-1 ${isMe ? 'mr-1 justify-end flex-row-reverse' : 'ml-1 flex-row'}`}>
           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColor} ${isMe ? 'ml-2' : 'mr-2'}`}>
              {avatarInitials}
           </div>

          <span className="font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center">
            {isMe && isAdmin && (
              <span className="mr-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                <ShieldCheck size={10} className="mr-1" />
                Staff
              </span>
            )}

            {displayName}

            {!isMe && isAdmin && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                <ShieldCheck size={10} className="mr-1" />
                Staff
              </span>
            )}

            {!isMe && entry.internal && (
              <span className="ml-2 flex items-center text-xs text-yellow-700 dark:text-yellow-400">
                <Lock size={10} className="mr-1" />
                Private
              </span>
            )}
          </span>
        </div>

        {hasText && (
          <div className={`w-fit max-w-[80%] ${bubbleClasses}`}>
            <p className="whitespace-pre-wrap">{entry.message || (entry as any).content}</p>
          </div>
        )}

        {hasAttachments && (
          <div className={`w-fit max-w-[80%] ${!hasText ? 'mt-0' : 'mt-1'}`}>
             <div className={`grid ${entry.attachments!.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800`}>
                {entry.attachments!.map(renderAttachment)}
             </div>
             {entry.attachments!.length > 1 && (
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <Button variant="ghost" size="sm" className="mt-2 text-xs text-slate-500 hover:text-primary-brand" onClick={() => handleDownloadAll(entry.id)} disabled={isDownloadingAll}>
                    {isDownloadingAll ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Download size={12} className="mr-1" />}
                    Download All (.zip)
                  </Button>
                </div>
              )}
          </div>
        )}

        <div className={`mt-1 text-[10px] ${isMe ? 'text-slate-400 text-right mr-1' : 'text-slate-400 dark:text-slate-500 text-left ml-1'}`}>
          {formatBackendDate(entry.createdAt as any)}
        </div>
      </div>
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-500 hover:bg-green-600';
      case 'IN_PROGRESS': return 'bg-blue-500 hover:bg-blue-600';
      case 'RESOLVED': return 'bg-purple-500 hover:bg-purple-600';
      case 'CLOSED': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden w-full flex">
      <div className="flex-1 flex flex-col bg-card-bg shadow-sm border-r border-card-border overflow-hidden">
        <div className="p-3 border-b border-card-border shrink-0 flex items-center justify-between">
          <div className="flex items-center">
             <Link to="/tickets" className="flex items-center text-sm text-gray-500 hover:text-primary-brand mr-4">
              <ArrowLeft size={16} className="mr-1" />
              Back
             </Link>
             <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-lg mr-4">{ticket.subject}</h1>
             {activeRole !== 'CUSTOMER' && (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Badge
                     className={`cursor-pointer ${getStatusBadgeColor(ticket.status)} text-white px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200`}
                     disabled={isUpdatingStatus}
                   >
                     {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                     {ticket.status.replace('_', ' ')}
                   </Badge>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-40 bg-white dark:bg-slate-800 border border-card-border rounded-md shadow-lg z-50">
                   {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                     <DropdownMenuItem
                       key={status}
                       onClick={() => handleStatusChange(status)}
                       className="cursor-pointer px-4 py-2 text-sm text-text-main hover:bg-slate-100 dark:hover:bg-slate-700"
                       disabled={isUpdatingStatus || ticket.status === status}
                     >
                       {status.replace('_', ' ')}
                     </DropdownMenuItem>
                   ))}
                   {activeRole === 'ADMIN' && (
                     <DropdownMenuItem
                       onClick={() => handleStatusChange('CLOSED')}
                       className="cursor-pointer px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                       disabled={isUpdatingStatus || ticket.status === 'CLOSED'}
                     >
                       CLOSED
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             )}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6 w-full">
          <div className="flex flex-col w-full items-start mb-4">
            <div className="flex items-center mb-1 ml-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mr-2">
                 {getInitials(ticket.customerName)}
              </div>
              <span className="font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center">
                 {ticket.customerName} (Initial Request)
              </span>
            </div>

            {ticket.description && ticket.description.trim().length > 0 && (
               <div className="w-fit max-w-[80%] p-4 rounded-xl mb-1 bg-slate-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 self-start text-left mr-auto text-text-main shadow-sm">
                 <p className="whitespace-pre-wrap">{ticket.description}</p>
               </div>
            )}

            {ticket.attachments && ticket.attachments.length > 0 && (
                <div className={`w-fit max-w-[80%] ${!ticket.description || ticket.description.trim().length === 0 ? 'mt-0' : 'mt-1'}`}>
                  <div className={`grid ${ticket.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-1 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800`}>
                    {ticket.attachments.map(renderAttachment)}
                  </div>
                  {ticket.attachments.length > 1 && (
                    <div className="flex justify-start">
                       <Button variant="ghost" size="sm" className="mt-2 text-xs text-slate-500 hover:text-primary-brand" onClick={() => handleDownloadAll()} disabled={isDownloadingAll}>
                         {isDownloadingAll ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Download size={12} className="mr-1" />}
                         Download All (.zip)
                       </Button>
                    </div>
                  )}
                </div>
            )}
            <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 text-left ml-1">
              {formatBackendDate(ticket.createdAt as any)}
            </div>
          </div>

          {ticket?.threadEntries?.map((entry, idx) => (
             <div key={`${entry.id}-${idx}`} className="w-full flex justify-center">
               <div className="w-full max-w-5xl">
                 {renderThreadEntry(entry, idx)}
                 <div className={`flex ${entry.posterId === user?.id ? 'justify-end' : 'justify-start'} w-full`}>
                   <div className="text-[10px] text-slate-400 dark:text-slate-500 mx-1">
                      {formatBackendDate(entry.createdAt as any)}
                   </div>
                 </div>
               </div>
             </div>
          ))}
        </div>

        <div
          className={`p-4 border-t bg-background-main shrink-0 transition-colors ${isInternalNote ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <div className="w-full max-w-5xl mx-auto">
            <form onSubmit={handleReplySubmit}>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder={isInternalNote ? "Type an internal note... (visible to agents only)" : "Type your reply..."}
                rows={3}
                className={`w-full p-4 pr-24 rounded-lg border dark:bg-slate-800 focus:outline-none focus:ring-2 transition-colors ${replyBoxBorder}`}
                disabled={isReplying}
                spellCheck="false"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-700 p-1.5 rounded-md text-xs border border-slate-600">
                      <FileText size={14} className="text-slate-300" />
                      <span className="truncate max-w-[150px] text-slate-200">{file.name}</span>
                      <button type="button" onClick={() => handleRemoveFile(file)} className="text-slate-400 hover:text-red-400 transition-colors"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                {activeRole !== 'CUSTOMER' ? (
                  <label className="flex items-center cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} className="form-checkbox h-4 w-4 text-yellow-500 rounded focus:ring-yellow-400" />
                    <Lock size={14} className="ml-2 mr-1" />
                    Private Note
                  </label>
                ) : <div />}
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isReplying}
                    multiple
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary-brand" disabled={isReplying}>
                    <Paperclip size={20} />
                  </button>
                  <button type="submit" className="p-2 rounded-full text-white flex items-center justify-center w-9 h-9" style={{ backgroundColor: 'var(--primary-brand)' }} disabled={(!newReply.trim() && selectedFiles.length === 0) || isReplying}>
                    {isReplying ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <aside className="w-64 bg-card-bg shadow-sm border-l border-card-border p-6 shrink-0 h-full overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 border-b border-card-border pb-2">Ticket Details</h3>
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-500 dark:text-slate-500">Ticket ID</label>
            <span className="font-semibold text-text-main">#{ticket.id}</span>
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-500">Status</label>
            <span className="font-semibold text-text-main">{ticket.status}</span>
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-500">Priority</label>
            <span className="font-semibold text-text-main">{ticket.priority}</span>
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-500">Department</label>
            <span className="font-semibold text-text-main">{ticket.department}</span>
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-500">Created</label>
            <span className="font-semibold text-slate-500 dark:text-slate-500">{formatBackendDate(ticket.createdAt as any)}</span>
          </div>

          {(activeRole === 'ADMIN' || activeRole === 'AGENT') && (
            <div>
              <label htmlFor="assignee" className="block text-slate-500 dark:text-slate-500 mb-1">Assignee</label>
              <Select
                onValueChange={handleAssignAgent}
                value={ticket.assignedAgentId || "unassigned"}
                disabled={isAssigning || agentsLoading}
              >
                <SelectTrigger id="assignee" className="w-full bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder={agentsLoading ? "Loading..." : "Unassigned"}>
                    {ticket.assignedAgentName || (agentsLoading ? "Loading..." : "Unassigned")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800">
                  {!agentsLoading && (
                    <>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {agents?.filter(a => a.id).map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.id === user.id ? `${agent.firstName} ${agent.lastName} (You)` : `${agent.firstName} ${agent.lastName}`}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </aside>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setSelectedImage(null)} className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300 transition-colors z-50">
              <X size={32} />
            </button>
            <SecureImage id={selectedImage.id} src={selectedImage.downloadUrl} alt={selectedImage.fileName} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;
