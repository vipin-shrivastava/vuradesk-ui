import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTicket, ThreadEntry } from '@/hooks/useTicket';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { Paperclip, Send, Loader2, ArrowLeft, Lock } from 'lucide-react';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { formatBackendDate } from '@/utils/dateUtils';

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { ticket, loading, error, refetch, setTicket } = useTicket(ticketId);
  const { user, activeRole } = useAuth();
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);

  const scrollRef = useAutoScroll(ticket?.threadEntries);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !ticketId || !ticket) return;

    setIsReplying(true);
    const payload = { message: newReply, isInternal: isInternalNote };
    console.log("Submit Reply Payload:", payload);

    const newEntryObject: ThreadEntry = {
      id: `temp-${Date.now()}`,
      author: user?.username || 'You',
      authorRole: activeRole as 'AGENT' | 'CUSTOMER',
      message: newReply, // Use 'message' to match the updated interface
      createdAt: new Date().toISOString(),
      isInternal: isInternalNote,
    };

    setTicket(prev => prev ? ({ ...prev, threadEntries: [...prev.threadEntries, newEntryObject] }) : null);
    setNewReply('');
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
          threadEntries: prev.threadEntries.map(entry => entry.id === newEntryObject.id ? savedEntry : entry),
        };
      });

      toast.success('Reply submitted successfully!');
    } catch (err) {
      console.error('Failed to submit reply:', err);
      toast.error('Failed to submit reply. Please try again.');
      setTicket(ticket); // Rollback
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading ticket details...</div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!ticket) return <div className="text-center p-8">Ticket not found.</div>;

  console.log("Entries to render:", ticket.threadEntries);

  const renderThreadEntry = (entry: ThreadEntry, index: number) => {
    const isAgent = entry.authorRole === 'AGENT';
    let bubbleClasses = 'self-start text-left ';

    if (entry.isInternal) {
      bubbleClasses += 'bg-yellow-100/50 dark:bg-yellow-900/30 border-l-4 border-yellow-400';
    } else if (isAgent) {
      bubbleClasses = 'bg-blue-100 dark:bg-blue-900/50 self-end text-right';
    } else {
      bubbleClasses += 'bg-gray-100 dark:bg-slate-700';
    }

    return (
      <div key={`${entry.id}-${index}`} className={`flex flex-col w-full ${isAgent && !entry.isInternal ? 'items-end' : 'items-start'}`}>
        <div className={`p-4 rounded-lg mb-4 max-w-2xl ${bubbleClasses}`}>
          <div className="flex items-center mb-2">
            <span className="font-bold text-sm text-text-main">{entry.author}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mx-2">({formatBackendDate(entry.createdAt as any)})</span>
            {entry.isInternal && (
              <span className="flex items-center text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-200/50 dark:bg-yellow-800/50 px-2 py-0.5 rounded-full">
                <Lock size={12} className="mr-1" />
                Internal Note
              </span>
            )}
          </div>
          {/* Use entry.message with a fallback to entry.content (which was the old name, just in case) */}
          <p className="text-text-main whitespace-pre-wrap">{entry.message || (entry as any).content}</p>
        </div>
      </div>
    );
  };

  const replyBoxBorder = isInternalNote ? 'border-yellow-400 focus:ring-yellow-400' : 'border-gray-300 dark:border-slate-700 focus:ring-primary-brand';

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col bg-card-bg rounded-lg shadow-md border border-card-border">
        <div className="p-4 border-b border-card-border">
          <Link to="/tickets" className="flex items-center text-sm text-gray-500 hover:text-primary-brand mb-4">
            <ArrowLeft size={16} className="mr-2" />
            Back to Tickets
          </Link>
          <h1 className="text-2xl font-bold text-text-main">{ticket.subject}</h1>
        </div>

        <div ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px]">
          <div className="flex flex-col w-full items-start">
            <div className="p-4 rounded-lg mb-4 max-w-2xl bg-slate-50 dark:bg-slate-800/50 self-start text-left">
              <div className="flex items-center mb-2">
                <span className="font-bold text-sm text-gray-800 dark:text-gray-300">{ticket.customerName} (Initial Request)</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({formatBackendDate(ticket.createdAt as any)})</span>
              </div>
              <p className="text-text-main whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>
          {ticket?.threadEntries?.map(renderThreadEntry)}
        </div>

        <div className={`p-4 border-t bg-background-main transition-colors ${isInternalNote ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
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
            <div className="flex items-center justify-between mt-2">
              {activeRole !== 'CUSTOMER' ? (
                <label className="flex items-center cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={isInternalNote} onChange={(e) => setIsInternalNote(e.target.checked)} className="form-checkbox h-4 w-4 text-yellow-500 rounded focus:ring-yellow-400" />
                  <Lock size={14} className="ml-2 mr-1" />
                  Private Note
                </label>
              ) : <div />}
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-500 hover:text-primary-brand" disabled={isReplying}>
                  <Paperclip size={20} />
                </button>
                <button type="submit" className="p-2 rounded-full text-white flex items-center justify-center w-9 h-9" style={{ backgroundColor: 'var(--primary-brand)' }} disabled={!newReply.trim() || isReplying}>
                  {isReplying ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <aside className="w-64 ml-6 bg-card-bg rounded-lg shadow-md border border-card-border p-6">
        <h3 className="text-lg font-semibold mb-4 border-b border-card-border pb-2">Ticket Details</h3>
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-500 dark:text-gray-400">Ticket ID</label>
            <span className="font-semibold text-text-main">#{ticket.id}</span>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400">Status</label>
            <span className="font-semibold text-text-main">{ticket.status}</span>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400">Priority</label>
            <span className="font-semibold text-text-main">{ticket.priority}</span>
          </div>
          <div>
            <label className="block text-gray-500 dark:text-gray-400">Created</label>
            <span className="font-semibold text-text-main">{formatBackendDate(ticket.createdAt as any)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default TicketDetailPage;
