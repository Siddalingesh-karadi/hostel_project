import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiChatAlt2, HiShieldCheck, HiUser, HiClock, HiInbox } from 'react-icons/hi';

const StudentSupport = () => {
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReplies(response.data.data);
    } catch (err) {
      console.error('Failed to fetch replies');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages', { recipient_role: recipient, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent('');
      alert(`Your message has been sent directly to the ${recipient === 'admin' ? 'Administrator' : 'Head Warden'}. Only they can see it.`);
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left Column: Send Message */}
        <div>
          <header className="mb-10">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-2xl text-indigo-400 mb-6">
              <HiChatAlt2 />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Direct Support</h1>
            <p className="text-slate-400 text-sm">Send private messages to the hostel administration.</p>
          </header>

          <div className="glass-card p-8 border-t-4 border-indigo-500">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-widest">Select Recipient</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setRecipient('admin')}
                    className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-bold ${
                      recipient === 'admin' 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <HiShieldCheck /> Admin
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRecipient('warden')}
                    className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-bold ${
                      recipient === 'warden' 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <HiUser /> Warden
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-widest">Message</label>
                <textarea 
                  required
                  placeholder="Describe your concern..."
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500 transition-all text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Private Inbox (Replies) */}
        <div>
          <header className="mb-10">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl text-emerald-400 mb-6">
              <HiInbox />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Private Inbox</h1>
            <p className="text-slate-400 text-sm">Official replies from the administration.</p>
          </header>

          <div className="space-y-4">
            {fetching ? (
              <div className="text-slate-500 animate-pulse">Loading inbox...</div>
            ) : replies.length > 0 ? replies.map(msg => (
              <div key={msg.message_id} className="glass-card p-6 border-l-4 border-emerald-500">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 font-bold">
                      {msg.sender_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{msg.sender_name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{msg.sender_role}</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <HiClock /> {new Date(msg.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-xs text-slate-300 leading-relaxed border border-white/5">
                  "{msg.content}"
                </div>
              </div>
            )) : (
              <div className="glass-card p-12 text-center text-slate-600 italic text-sm">
                No replies yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentSupport;

