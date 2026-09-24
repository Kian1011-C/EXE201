import React, { useState } from 'react';

export default function StaffTaskDetail({ task, onBack, onSelectContact, onSelectDeal, onSelectTicket }) {
  const [currentTask, setCurrentTask] = useState(task || {
    id: 'TSK-0000',
    title: 'Sample Task',
    status: 'Not Started',
    priority: 'Medium',
    assignee: { name: 'Unknown' },
    dueDate: '2026-01-01',
    dueTime: '12:00',
    type: 'General',
  });

  const [activities, setActivities] = useState([
    {
      id: 1,
      date: '2026-09-23 10:15 AM',
      action: 'Task Created',
      content: 'Task was created and assigned.',
      author: 'System'
    }
  ]);
  const [newActivity, setNewActivity] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentTask.title);

  const handleStatusChange = (newStatus) => {
    setCurrentTask({ ...currentTask, status: newStatus });
    addActivity(`Status changed to ${newStatus}`, '');
  };

  const addActivity = (action, content) => {
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    setActivities([
      {
        id: Date.now(),
        date: dateStr,
        action,
        content,
        author: 'Current User'
      },
      ...activities
    ]);
  };

  const handleAddComment = () => {
    if (!newActivity.trim()) return;
    addActivity('Comment Added', newActivity);
    setNewActivity('');
  };

  const saveTitle = () => {
    setCurrentTask({ ...currentTask, title: editedTitle });
    setIsEditingTitle(false);
    addActivity('Title Updated', `Changed title to: ${editedTitle}`);
  };

  // UI Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Completed</span>;
      case 'In Progress': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">In Progress</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">Not Started</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-semibold border border-red-200">High Priority</span>;
      case 'Medium': return <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-semibold border border-yellow-200">Medium Priority</span>;
      default: return <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold border border-green-200">Low Priority</span>;
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-full space-y-6">
      {/* Header Navigation */}
      <div>
        <button onClick={onBack} className="text-blue-600 hover:underline text-sm font-medium flex items-center mb-4">
          &larr; Back to Tasks
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Task Info + Activity */}
        <div className="flex-1 space-y-6">
          {/* Main Task Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gray-500 font-mono text-sm">{currentTask.id}</span>
                  {getStatusBadge(currentTask.status)}
                  {getPriorityBadge(currentTask.priority)}
                </div>
                
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="text" 
                      value={editedTitle} 
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-xl font-bold border border-blue-500 rounded px-2 py-1 flex-1"
                      autoFocus
                    />
                    <button onClick={saveTitle} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Save</button>
                    <button onClick={() => { setIsEditingTitle(false); setEditedTitle(currentTask.title); }} className="text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
                  </div>
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2 group">
                    {currentTask.title}
                    <button onClick={() => setIsEditingTitle(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity">
                      ✎
                    </button>
                  </h1>
                )}
              </div>

              {/* Status Transition Buttons */}
              <div className="flex gap-2 shrink-0 ml-4">
                {currentTask.status === 'Not Started' && (
                  <button onClick={() => handleStatusChange('In Progress')} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium hover:bg-blue-100">
                    Start Task
                  </button>
                )}
                {currentTask.status === 'In Progress' && (
                  <button onClick={() => handleStatusChange('Completed')} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                    Complete Task
                  </button>
                )}
                {currentTask.status === 'Completed' && (
                  <button onClick={() => handleStatusChange('In Progress')} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
                    Reopen Task
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Due Date</label>
                <div className={`font-medium ${isOverdue(currentTask.dueDate, currentTask.status) ? 'text-red-600' : 'text-gray-900'}`}>
                  {currentTask.dueDate} at {currentTask.dueTime}
                </div>
                {isOverdue(currentTask.dueDate, currentTask.status) && (
                  <div className="text-xs text-red-500 mt-1">Overdue!</div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Assignee</label>
                <div className="font-medium text-gray-900">{currentTask.assignee?.name || 'Unassigned'}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Type</label>
                <div className="inline-flex bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-sm font-medium">{currentTask.type}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reminders</label>
                <div className="text-sm text-gray-700">1 day before</div>
              </div>
            </div>

            {currentTask.description && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentTask.description}</p>
              </div>
            )}
          </div>

          {/* Activity Log Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Activity & Comments</h2>
            
            {/* Add Comment Input */}
            <div className="mb-6 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                U
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Add a comment or log an activity..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                ></textarea>
                <div className="mt-2 flex justify-end">
                  <button onClick={handleAddComment} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Activities List (Reverse Chronological) */}
            <div className="space-y-6 border-l-2 border-gray-100 ml-4 pl-4">
              {activities.map(act => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[25px] top-1 w-3 h-3 bg-blue-200 border-2 border-white rounded-full"></div>
                  <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{act.author}</span>
                    <span>•</span>
                    <span>{act.date}</span>
                    <span>•</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{act.action}</span>
                  </div>
                  {act.content && (
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md mt-1 border border-gray-100">
                      {act.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Linked Entities */}
        <div className="w-full lg:w-80 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Linked Entities</h3>
            <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-2 rounded">
              ℹ️ Files must be attached to Deal/Ticket/Contact, not Task.
            </p>

            <div className="space-y-3">
              {/* Linked Contact */}
              {currentTask.contact ? (
                <div 
                  className="border border-gray-200 rounded p-3 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => onSelectContact && onSelectContact(currentTask.contact)}
                >
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Contact</div>
                  <div className="font-medium text-blue-600">{currentTask.contact.name}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {currentTask.contact.id}</div>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded p-3 text-center text-sm text-gray-500">
                  No Contact Linked
                </div>
              )}

              {/* Linked Deal */}
              {currentTask.deal ? (
                <div 
                  className="border border-gray-200 rounded p-3 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => onSelectDeal && onSelectDeal(currentTask.deal)}
                >
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Deal</div>
                  <div className="font-medium text-blue-600 line-clamp-1">{currentTask.deal.title}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {currentTask.deal.id}</div>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded p-3 text-center text-sm text-gray-500">
                  No Deal Linked
                </div>
              )}

              {/* Linked Ticket (If applicable) */}
              {currentTask.ticket ? (
                <div 
                  className="border border-gray-200 rounded p-3 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => onSelectTicket && onSelectTicket(currentTask.ticket)}
                >
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Ticket</div>
                  <div className="font-medium text-blue-600">{currentTask.ticket.subject}</div>
                  <div className="text-xs text-gray-400 mt-1">ID: {currentTask.ticket.id}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
