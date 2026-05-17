import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { HiOutlineSpeakerphone, HiOutlineTrash, HiOutlinePlusCircle, HiPaperClip, HiDocumentDownload, HiX, HiCheck } from 'react-icons/hi';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const [attachment, setAttachment] = useState(null); // { url, name }
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('/api/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setAttachment({
        url: res.data.fileUrl,
        name: res.data.fileName
      });
    } catch (err) {
      console.error(err);
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newNotice,
        attachment_url: attachment ? attachment.url : null,
        file_name: attachment ? attachment.name : null
      };

      await axios.post('/api/notices', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewNotice({ title: '', content: '' });
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchNotices();
    } catch (err) {
      alert('Failed to post notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await axios.delete(`/api/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  const renderNoticeAttachment = (notice) => {
    if (!notice.attachment_url) return null;
    const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(notice.attachment_url);

    if (isImage) {
      return (
        <div className="mt-4">
          <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
            <img 
              src={notice.attachment_url} 
              alt="Notice Attachment" 
              className="max-h-96 rounded-xl border border-white/10 shadow-lg hover:opacity-95 transition-all cursor-zoom-in"
            />
          </a>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <a 
          href={notice.attachment_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all max-w-sm text-left"
        >
          <HiDocumentDownload className="text-2xl text-indigo-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{notice.file_name || 'Download PDF/Attachment'}</p>
            <p className="text-[10px] text-slate-500">Click to view or download</p>
          </div>
        </a>
      </div>
    );
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
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
              {renderNoticeAttachment(notice)}
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
              <div className="mb-4">
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

              {/* Attachment option */}
              <div className="mb-6">
                <label className="block text-slate-400 text-sm font-bold mb-2">File Attachment (Optional)</label>
                
                {attachment ? (
                  <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <HiDocumentDownload className="text-xl text-indigo-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{attachment.name}</p>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <HiCheck /> Uploaded successfully
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachment(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                    >
                      <HiX className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-4 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all bg-slate-900/50 ${
                        uploading ? 'animate-pulse text-indigo-400 border-indigo-500/40' : ''
                      }`}
                    >
                      <HiPaperClip className="text-2xl" />
                      <span className="text-xs font-bold">
                        {uploading ? 'Uploading notice file...' : 'Choose Image or PDF (Max 10MB)'}
                      </span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setAttachment(null);
                  }}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
