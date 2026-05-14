import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineSpeakerphone, HiOutlineTrash, HiOutlinePlusCircle } from 'react-icons/hi';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/notices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch notices');
      setLoading(false);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/notices', newNotice, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewNotice({ title: '', content: '' });
      fetchNotices();
    } catch (err) {
      alert('Failed to post notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow">Hostel Notices</h1>
          <p className="text-slate-400">Stay updated with the latest announcements.</p>
        </div>
        {(user.role === 'admin' || user.role === 'warden') && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            <HiOutlinePlusCircle className="text-xl" /> Post Notice
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading notices...</p>
      ) : notices.length === 0 ? (
        <div className="glass-card p-20 text-center">
          <HiOutlineSpeakerphone className="text-6xl text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No notices posted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {notices.map(notice => (
            <div key={notice.id} className="glass-card p-6 border-l-4 border-indigo-500 relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{notice.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Posted by <span className="text-indigo-400 font-bold uppercase">{notice.posted_by}</span> ({notice.poster_role}) • {new Date(notice.created_at).toLocaleDateString()}
                  </p>
                </div>
                {(user.role === 'admin' || user.role === 'warden') && (
                  <button 
                    onClick={() => handleDelete(notice.id)}
                    className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <HiOutlineTrash />
                  </button>
                )}
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{notice.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-8 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Notice</h2>
            <form onSubmit={handlePostNotice}>
              <div className="mb-4">
                <label className="block text-slate-400 text-sm font-bold mb-2">Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  placeholder="e.g., Holiday Announcement"
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-400 text-sm font-bold mb-2">Content</label>
                <textarea 
                  required
                  rows="5"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                  placeholder="Type your notice message here..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
