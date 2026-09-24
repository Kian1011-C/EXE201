import React, { useState, useEffect } from 'react';

export default function StaffTicketDetail({ ticket, onBack, onSelectContact, onSelectDeal }) {
  const [currentStatus, setCurrentStatus] = useState(ticket?.status || 'Open');
  const [dueDate, setDueDate] = useState(ticket?.dueDate || '');
  const [ticketResult, setTicketResult] = useState(ticket?.ticketResult || '');
  const [description, setDescription] = useState(ticket?.description || '');
  const [toastMsg, setToastMsg] = useState(null);
  
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [tempDueDate, setTempDueDate] = useState('');
  const [reason, setReason] = useState('');

  const [comments, setComments] = useState([
    { id: 1, author: 'Anya Nguyen', avatar: 'A', bg: 'bg-pink-100 text-pink-700', time: '2 hours ago', content: 'Left a voicemail for the client.' },
    { id: 2, author: 'Khanh Nguyen', avatar: 'K', bg: 'bg-blue-100 text-blue-700', time: '1 day ago', content: 'Ticket created and assigned.' }
  ]);
  const [newComment, setNewComment] = useState('');

  if (!ticket) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus === 'Closed' && !ticketResult.trim()) {
      showToast('Error: Ticket Result is required before closing.');
      return;
    }
    setCurrentStatus(newStatus);
    showToast(`Status updated to ${newStatus}`);
  };

  const handleDueDateRequest = (e) => {
    setTempDueDate(e.target.value);
    setShowReasonModal(true);
  };

  const confirmDueDateChange = () => {
    if (!reason.trim()) {
      alert('Reason is required!');
      return;
    }
    setDueDate(tempDueDate);
    setShowReasonModal(false);
    setReason('');
    showToast('Due date updated successfully.');
  };

  const getPipelineColor = (pipe) => {
    switch (pipe) {
      case 'Client Support': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Payment': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Collect Document': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Choose Doctor': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Agent Support': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      author: 'You',
      avatar: 'Y',
      bg: 'bg-slate-200 text-slate-700',
      time: 'Just now',
      content: newComment
    };
    setComments([comment, ...comments]); // newest on top
    setNewComment('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Toast */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded shadow-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">info</span>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-200 shrink-0">
        <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-800">{ticket.title}</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getPipelineColor(ticket.pipeline)}`}>
              {ticket.pipeline}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{ticket.id} • Created on {ticket.created}</p>
        </div>
      </div>

      {/* Body: 3 columns */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Left Column: Properties */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col p-4 space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">Properties</h2>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select value={currentStatus} onChange={handleStatusChange} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500">
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting">Waiting</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={handleDueDateRequest} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Priority (Auto)</label>
            <div className="px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded text-slate-700 font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ticket.priority === 'HIGH' ? 'bg-rose-500' : ticket.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              {ticket.priority}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
            <textarea rows="4" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500"></textarea>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Ticket Result <span className="text-rose-500">*</span></label>
            <textarea rows="3" placeholder="Required before closing..." value={ticketResult} onChange={e => setTicketResult(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded bg-slate-50 focus:outline-none focus:border-blue-500"></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400">Owner</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${ticket.owner?.bg || 'bg-slate-200 text-slate-700'}`}>{ticket.owner?.avatar || 'U'}</div>
                <span className="text-xs text-slate-700 truncate">{ticket.owner?.name || 'Unassigned'}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Service Agent</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${ticket.serviceAgent?.bg || 'bg-slate-200 text-slate-700'}`}>{ticket.serviceAgent?.avatar || 'U'}</div>
                <span className="text-xs text-slate-700 truncate">{ticket.serviceAgent?.name || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Activity Feed */}
        <div className="flex-grow bg-slate-50 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-slate-200 bg-white">
            <h2 className="text-sm font-semibold text-slate-800">Activity & Comments</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${c.bg}`}>{c.avatar}</div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{c.author}</span>
                    <span className="text-[11px] text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-sm text-slate-600">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <textarea rows="2" placeholder="Add a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full p-2 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 mb-2"></textarea>
            <div className="flex justify-end">
              <button onClick={handleAddComment} className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition">Post Comment</button>
            </div>
          </div>
        </div>

        {/* Right Column: Linked Entities */}
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto p-4 space-y-6">
          
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Linked Contact</h3>
            <div onClick={() => onSelectContact(ticket.contactName)} className="p-3 border border-slate-200 rounded-lg hover:border-blue-400 cursor-pointer transition group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition">{ticket.contactName}</p>
                  <p className="text-xs text-slate-500">Client</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Linked Deal</h3>
            <div onClick={() => onSelectDeal(ticket.dealTitle)} className="p-3 border border-slate-200 rounded-lg hover:border-blue-400 cursor-pointer transition group">
              <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition mb-1">{ticket.dealTitle}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">Policy</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              Attachments
              <button className="text-blue-600 hover:text-blue-700"><span className="material-symbols-outlined text-[16px]">add</span></button>
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border border-slate-200 rounded text-sm group hover:border-blue-300 cursor-pointer transition">
                <div className="flex items-center gap-2 text-slate-600 group-hover:text-blue-600">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span className="truncate w-40">id_card_scan.pdf</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 opacity-0 group-hover:opacity-100 transition">download</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Due Date Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 text-sm">Change Due Date</h3>
              <button onClick={() => setShowReasonModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-[18px]">close</span></button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-600 mb-3">Please provide a reason for changing the due date to <strong className="text-slate-800">{tempDueDate}</strong>.</p>
              <textarea 
                rows="3" 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500"
                placeholder="Reason..."
                autoFocus
              ></textarea>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setShowReasonModal(false)} className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded hover:bg-slate-100">Cancel</button>
              <button onClick={confirmDueDateChange} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">Confirm Change</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
