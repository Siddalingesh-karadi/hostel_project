import React, { useState } from 'react';
import axios from 'axios';
import { HiChatAlt2, HiShieldCheck, HiUser } from 'react-icons/hi';

const StudentSupport = () => {
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('admin');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages', { recipient_role: recipient, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent('');
      alert('Your message has been sent directly to the Administrator. Only they can see it.');
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-3xl text-indigo-400 mx-auto mb-6">
            <HiChatAlt2 />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Direct Admin Support</h1>
          <p className="text-slate-400">Share your feedback or concerns privately with the hostel administration.</p>
        </header>

        <div className="glass-card p-8 border-t-4 border-indigo-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-widest">Select Recipient</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setRecipient('admin')}
                  className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    recipient === 'admin' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <HiShieldCheck /> Administrator
                </button>
                <button 
                  type="button"
                  onClick={() => setRecipient('warden')}
                  className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    recipient === 'warden' 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <HiUser /> Head Warden
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-3 block tracking-widest">Message Content</label>
              <textarea 
                required
                placeholder="Type your private message here... It will be visible only to the selected recipient."
                rows="6"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-indigo-500 transition-all"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : (
                <>
                  <HiChatAlt2 /> Send Private Message
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HiShieldCheck />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-emerald-400 font-bold">Privacy Guaranteed:</span> This message is encrypted and sent directly. No other students or staff can view this conversation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSupport;
