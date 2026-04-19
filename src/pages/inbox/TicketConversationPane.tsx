import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTicket, ThreadEntry, Attachment } from '@/hooks/useTicket';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { Paperclip, Send, Loader2, ArrowLeft, Lock, ShieldCheck, FileText, Download, X, Sparkles } from 'lucide-react';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { formatBackendDate } from '@/utils/dateUtils';
import SecureImage from '@/components/SecureImage';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';

// Helper function to get initials for the avatar
const getInitials = (fullName?: string) => {
  if (!fullName) return '?';
  const names = fullName.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return fullName[0].toUpperCase();
};

const AiHud = () => (
  <div className="bg-blue-50/80 dark:bg-blue-900/20 border-l-4 border-blue-500 p-2 mb-4 rounded-r-xl shadow-sm flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
        <Sparkles className="h-5 w-5" />
        <p className="font-bold text-sm uppercase tracking-wider">AI Briefing</p>
      </div>
      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
        Sentiment: Frustrated
      </Badge>
    </div>
    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
      This ticket is about a login issue. The user has attempted to reset their password but isn't receiving the emails. Recommend checking the email logs or sending a manual reset link.
    </p>
  </div>
);

interface TicketConversationPaneProps {
  popoutTicketId?: string;
  isModal?: boolean; // New prop to indicate if it's rendered in a modal
}

const TicketConversationPane: React.FC<TicketConversationPaneProps> = ({ popoutTicketId, isModal = false }) => {
  const { ticketId: routeTicketId } = useParams<{ ticketId: string }>();
  const currentTicketId = popoutTicketId || routeTicketId;
  const { ticket, loading, error, setTicket } = useTicket(currentTicketId);
  const { user, activeRole, hasPermission } = useAuth();
  const [newReply, setNewReply] = useState('');
  // ...
  const scrollRef = useAutoScroll(ticket?.threadEntries);
  const isCustomer = hasPermission('ticket:own') && activeRole === 'CUSTOMER';
  const backLink = isCustomer ? '/inbox' : '/tickets';

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
    if ((!newReply.trim() && selectedFiles.length === 0) || !currentTicketId || !ticket || !user) return;

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
      const response = await axiosClient.post(`/tickets/${currentTicketId}/replies`, payload);
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
      setTicket(ticket); // Revert to original ticket state on error
    } finally {
      setIsReplying(false);
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
    if (!currentTicketId || isDownloadingAll) return;

    if (entryId && typeof entryId !== 'string' && typeof entryId !== 'number') {
        console.error("handleDownloadAll received an invalid entryId (likely an event object). Expected string or undefined. Received:", entryId);
        toast.error("An error occurred preparing the download.");
        return;
    }

    setIsDownloadingAll(true);
    toast.info('Preparing your download...');
    try {
      const urlPath = `/attachments/download/all?ticketId=${currentTicketId}${entryId ? `&threadEntryId=${entryId}` : ''}`;
      const response = await axiosClient.get(urlPath, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ticket_#${currentTicketId}_Attachments.zip`);
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
    const isAgent = effectiveRole === 'AGENT' || effectiveRole === 'ADMIN';

    let containerClasses = `flex flex-col w-full mb-4 ${isMe ? 'items-end' : 'items-start'}`;

    const hasText = entry.message && entry.message.trim().length > 0;
    const hasAttachments = entry.attachments && entry.attachments.length > 0;

    let bubbleClasses = 'p-3 rounded-2xl mb-1 ';

    if (entry.internal) {
      bubbleClasses += hasText ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-slate-800 dark:text-slate-200 shadow-sm' : 'bg-transparent p-0 text-slate-800 dark:text-slate-200';
    } else if (isAgent) {
      bubbleClasses += hasText ? 'bg-blue-50/50 dark:bg-blue-900/20 text-slate-800 dark:text-slate-200 shadow-sm border border-blue-100 dark:border-blue-800/50' : 'bg-transparent text-slate-800 dark:text-slate-200 p-0';
    } else {
      bubbleClasses += hasText ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm' : 'bg-transparent p-0 text-slate-800 dark:text-slate-200';
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

  return (
    <div className="h-full flex flex-col bg-card-bg shadow-sm border-r border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-3 border-b border-card-border shrink-0 flex items-center justify-between">
          <div className="flex items-center">
             {!isModal && !isCustomer && ( // Conditionally render "Back" link
               <Link to={backLink} className="flex items-center text-sm text-gray-500 hover:text-primary-brand mr-4">
                <ArrowLeft size={16} className="mr-1" />
                Back
               </Link>
             )}
             <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-lg mr-4">{ticket.subject}</h1>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col space-y-3 w-full">
          {!isCustomer && <AiHud />}
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
               <div className="w-fit max-w-[80%] p-3 rounded-xl mb-1 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-800 self-start text-left mr-auto text-slate-800 dark:text-slate-200 shadow-sm">
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
          className={`px-4 pt-4 pb-6 border-t border-slate-200 dark:border-slate-800 bg-background-main shrink-0 transition-colors ${isInternalNote ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
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
                {hasPermission('ticket:view_internal_notes') ? (
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

export default TicketConversationPane;
