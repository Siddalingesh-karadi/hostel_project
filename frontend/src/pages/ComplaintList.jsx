import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiExclamation, HiCheckCircle, HiClock, HiFilter } from 'react-icons/hi';

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'other', priority: 'medium'
  });
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user.role === 'student' ? '/api/complaints/my' : '/api/complaints';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data.data);
    } catch (err) {
      console.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user.role]);

  const handleRaiseComplaint = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/complaints', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'other', priority: 'medium' });
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to raise complaint');
    }
  };

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/complaints/${id}`, { status: 'resolved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update complaint');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'in-progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-rose-500';
      case 'high': return 'text-amber-500';
      case 'medium': return 'text-indigo-400';
      default: return 'text-emerald-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {user.role === 'student' ? 'My Complaints' : 'Student Complaints'}
            </h1>
            <p className="text-slate-400">Track and manage maintenance requests</p>
          </div>
          {user.role === 'student' && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Raise New Complaint
            </button>
          )}
        </div>

        {/* Raise Complaint Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">New Complaint</h2>
              <form onSubmit={handleRaiseComplaint} className="space-y-4">
                <input type="text" placeholder="Issue Title" required className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <textarea placeholder="Describe the problem..." required className="w-full bg-slate-800 border-none rounded-lg p-3 text-white h-32" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="internet">Internet</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                  <select className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">Submit Issue</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {loading ? (
            <p className="text-slate-400">Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <HiCheckCircle className="mx-auto text-6xl text-emerald-500/20 mb-4" />
              <p className="text-slate-400 text-lg">No active complaints found. Everything looks good!</p>
            </div>
          ) : complaints.map((complaint) => (
            <div key={complaint.complaint_id} className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start md:items-center transition-all hover:bg-white/5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <span className={`text-xs font-bold uppercase flex items-center gap-1 ${getPriorityColor(complaint.priority)}`}>
                    <HiExclamation /> {complaint.priority} priority
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{complaint.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">{complaint.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><HiClock /> {new Date(complaint.created_at).toLocaleDateString()}</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded border border-white/5 lowercase">{complaint.category}</span>
                  {user.role !== 'student' && <span className="text-indigo-400 font-bold italic">Student: {complaint.name}</span>}
                </div>
              </div>

              {user.role !== 'student' && complaint.status !== 'resolved' && (
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleResolve(complaint.complaint_id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold border border-emerald-500/20 transition-all"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplaintList;
