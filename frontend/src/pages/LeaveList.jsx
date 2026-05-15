import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiClipboardList, HiCheckCircle, HiXCircle, HiCalendar, HiClock } from 'react-icons/hi';

const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    from_date: '', to_date: '', reason: ''
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
      console.error('Failed to fetch leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Calculate number of days
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e - s;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; // Inclusive
    return days > 0 ? days : 0;
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    
    // Date Validation
    const days = calculateDays(formData.from_date, formData.to_date);
    if (days <= 0) {
      return alert('End Date must be after Start Date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(formData.from_date) < today) {
      return alert('Leave cannot be applied for previous days');
    }


    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/leaves', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ from_date: '', to_date: '', reason: '' });
      fetchLeaves();

    } catch (err) {
      alert('Failed to apply for leave');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeaves();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-glow">Leave Management</h1>
            <p className="text-slate-400">Apply for and manage leave requests</p>
          </div>
          {user.role === 'student' && (
            <button onClick={() => setShowModal(true)} className="btn-primary">Apply for Leave</button>
          )}
        </div>

        {/* Leave Requests Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                {(user.role === 'admin' || user.role === 'warden') && <th className="px-6 py-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center">Loading...</td></tr>
              ) : leaves.map(leave => (
                <tr key={leave.leave_id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{leave.name}</p>
                    <p className="text-xs text-slate-500">{leave.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-indigo-400 font-bold mb-1">
                      <HiCalendar />
                      {calculateDays(leave.from_date, leave.to_date)} Days
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                    </p>

                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 italic">"{leave.reason}"</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      leave.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      leave.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  {(user.role === 'admin' || user.role === 'warden') && (
                    <td className="px-6 py-4">
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateStatus(leave.leave_id, 'approved')} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg"><HiCheckCircle className="text-xl" /></button>
                          <button onClick={() => handleUpdateStatus(leave.leave_id, 'rejected')} className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg"><HiXCircle className="text-xl" /></button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Apply Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8">
              <h2 className="text-xl font-bold text-white mb-6">Leave Application</h2>
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Start Date</label>
                    <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" value={formData.from_date} onChange={(e) => setFormData({...formData, from_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">End Date</label>
                    <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" value={formData.to_date} onChange={(e) => setFormData({...formData, to_date: e.target.value})} />
                  </div>
                </div>
                
                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Total Duration</span>
                  <span className="text-xl font-black text-white">{calculateDays(formData.from_date, formData.to_date)} Days</span>
                </div>


                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Reason for Leave</label>
                  <textarea required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white h-24" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 btn-primary">Submit Application</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveList;
