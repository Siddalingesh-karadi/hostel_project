import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCalendar, HiClock, HiClipboardList } from 'react-icons/hi';

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reason: '', from_date: '', to_date: ''
  });
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user.role === 'student' ? '/api/leaves/my' : '/api/leaves';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data.data);
    } catch (err) {
      console.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user.role]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/leaves', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ reason: '', from_date: '', to_date: '' });
      fetchLeaves();
    } catch (err) {
      alert('Failed to apply for leave');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (err) {
      alert('Failed to update request');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {user.role === 'student' ? 'My Leave History' : 'Leave Request Management'}
            </h1>
            <p className="text-slate-400">Monitor and approve student absences</p>
          </div>
          {user.role === 'student' && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Apply for Leave
            </button>
          )}
        </div>

        {/* Apply Leave Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Apply for Leave</h2>
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <textarea placeholder="Reason for leave..." required className="w-full bg-slate-800 border-none rounded-lg p-3 text-white h-32" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">From Date</label>
                    <input type="date" required className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.from_date} onChange={(e) => setFormData({...formData, from_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">To Date</label>
                    <input type="date" required className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.to_date} onChange={(e) => setFormData({...formData, to_date: e.target.value})} />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">Submit Request</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {loading ? (
            <p className="text-slate-400">Loading requests...</p>
          ) : leaves.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <HiClipboardList className="mx-auto text-6xl text-slate-500/20 mb-4" />
              <p className="text-slate-400 text-lg">No leave requests found.</p>
            </div>
          ) : leaves.map((leave) => (
            <div key={leave.leave_id} className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getStatusStyle(leave.status)}`}>
                    {leave.status}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <HiClock /> Applied on {new Date(leave.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{leave.reason}</h3>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <HiCalendar className="text-lg" />
                    <span>From: <strong>{new Date(leave.from_date).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-400">
                    <HiCalendar className="text-lg" />
                    <span>To: <strong>{new Date(leave.to_date).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                {user.role !== 'student' && (
                  <div className="mt-3 text-xs text-slate-500">
                    Student: <span className="text-slate-300 font-medium">{leave.name}</span> ({leave.phone})
                  </div>
                )}
              </div>

              {user.role !== 'student' && leave.status === 'pending' && (
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleStatusUpdate(leave.leave_id, 'approved')}
                    className="flex-1 md:flex-none px-6 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold border border-emerald-500/20 transition-all"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(leave.leave_id, 'rejected')}
                    className="flex-1 md:flex-none px-6 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-sm font-bold border border-rose-500/20 transition-all"
                  >
                    Reject
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

export default LeaveList;
