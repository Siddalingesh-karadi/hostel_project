import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiChatAlt2, HiUser, HiClock } from 'react-icons/hi';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleSendReply = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages', {
        recipient_id: replyTo.sender_id,
        content: replyContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowReplyModal(false);
      setReplyContent('');
      alert('Reply sent successfully!');
    } catch (err) {
      alert('Failed to send reply');
    }
  };



  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data);
    } catch (err) {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading private messages...</div>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Student Feedback & Inbox</h1>
          <p className="text-slate-400">Private messages sent directly to your {user.role} account.</p>
        </header>


      <div className="grid grid-cols-1 gap-6">
        {messages.length > 0 ? messages.map(msg => (
          <div key={msg.message_id} className="glass-card p-8 border-l-4 border-indigo-500 hover:bg-white/[0.02] transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl text-indigo-400 font-bold">
                  {msg.sender_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{msg.sender_name}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{msg.sender_role} Profile</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <HiClock className="text-indigo-500" />
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
            
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 italic text-slate-300 leading-relaxed shadow-inner">
              "{msg.content}"
            </div>
            
            <div className="mt-6 flex gap-4">
              <button 
                onClick={() => { setReplyTo(msg); setShowReplyModal(true); }}
                className="text-xs font-black uppercase text-indigo-400 hover:text-white transition-colors"
              >
                Reply to Student
              </button>
              <button className="text-xs font-black uppercase text-slate-500 hover:text-rose-400 transition-colors">Mark as Read</button>
            </div>
          </div>
        )) : (
          <div className="glass-card p-20 text-center text-slate-500 italic">
            <HiChatAlt2 className="text-6xl mx-auto mb-6 opacity-10" />
            Your private inbox is empty.
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-8">
            <h2 className="text-xl font-bold text-white mb-2">Reply to {replyTo.sender_name}</h2>
            <p className="text-xs text-slate-500 mb-6 uppercase tracking-widest italic">Original Message: "{replyTo.content.substring(0, 50)}..."</p>
            
            <textarea 
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-indigo-500 transition-all mb-6"
              rows="5"
              placeholder="Type your official reply here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            
            <div className="flex gap-4">
              <button 
                onClick={handleSendReply}
                disabled={!replyContent.trim()}
                className="flex-1 btn-primary py-4 disabled:opacity-50"
              >
                Send Official Reply
              </button>
              <button 
                onClick={() => { setShowReplyModal(false); setReplyContent(''); }}
                className="flex-1 bg-white/5 text-slate-300 rounded-2xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};


export default AdminMessages;
