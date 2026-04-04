import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTicket, TicketReply } from '@/hooks/useTicket';
import { Paperclip, Send, Loader2, ArrowLeft } from 'lucide-react';
import axiosClient from '@/api/axiosClient';
import { toast } from 'sonner';
import { formatBackendDate } from '@/utils/dateUtils'; // Import the shared date utility

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { ticket, loading, error, refetch } = useTicket(ticketId);
  const [newReply, setNewReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !ticketId) return;

    setIsReplying(true);
    try {
      await axiosClient.post(`/tickets/${ticketId}/replies`, { content: newReply });
      setNewReply('');
      toast.success('Reply submitted successfully!');
      refetch();
    } catch (err) {
      console.error('Failed to submit reply:', err);
      toast.error('Failed to submit reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading ticket details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  if (!ticket) {
    return <div className="text-center p-8">Ticket not found.</div>;
  }

  const renderReply = (reply: TicketReply) => {
    const isAgent = reply.authorRole === 'AGENT';
    const bubbleClasses = isAgent
      ? 'bg-blue-100 dark:bg-blue-900/50 self-end text-right'
      : 'bg-gray-100 dark:bg-slate-700 self-start text-left';
    const authorClasses = isAgent ? 'text-blue-800 dark:text-blue-300' : 'text-gray-800 dark:text-gray-300';

    return (
      <div key={reply.id} className={`flex flex-col w-full ${isAgent ? 'items-end' : 'items-start'}`}>
        <div className={`p-4 rounded-lg mb-4 max-w-2xl ${bubbleClasses}`}>
          <div className="flex items-center mb-2">
            <span className={`font-bold text-sm ${authorClasses}`}>{reply.author}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              ({formatBackendDate(reply.createdAt as any)})
            </span>
          </div>
          <p className="text-text-main whitespace-pre-wrap">{reply.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-card-bg rounded-lg shadow-md border border-card-border">
          {/* Header */}
          <div className="p-4 border-b border-card-border">
            <Link to="/tickets" className="flex items-center text-sm text-gray-500 hover:text-primary-brand mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Tickets
            </Link>
            <h1 className="text-2xl font-bold text-text-main">
              {ticket.subject}
            </h1>
          </div>

          {/* Thread */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Initial Message */}
            <div className="flex flex-col w-full items-start">
              <div className="p-4 rounded-lg mb-4 max-w-2xl bg-slate-50 dark:bg-slate-800/50 self-start text-left">
                <div className="flex items-center mb-2">
                  <span className="font-bold text-sm text-gray-800 dark:text-gray-300">{ticket.customerName} (Initial Request)</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    ({formatBackendDate(ticket.createdAt as any)})
                  </span>
                </div>
                <p className="text-text-main whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>

            {/* Replies */}
            {ticket?.replies?.map(renderReply)}
          </div>

          {/* Reply Box */}
          <div className="p-4 border-t border-card-border bg-background-main">
            <form onSubmit={handleReplySubmit} className="relative">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                className="w-full p-4 pr-24 rounded-lg border border-gray-300 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-brand"
                disabled={isReplying}
                spellCheck="false"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-500 hover:text-primary-brand" disabled={isReplying}>
                  <Paperclip size={20} />
                </button>
                <button
                  type="submit"
                  className="p-2 rounded-full text-white flex items-center justify-center w-9 h-9"
                  style={{ backgroundColor: 'var(--primary-brand)' }}
                  disabled={!newReply.trim() || isReplying}
                >
                  {isReplying ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar for Metadata */}
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
    </div>
  );
};

export default TicketDetailPage;
