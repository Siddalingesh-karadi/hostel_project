import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiClipboardList, HiLocationMarker, HiClock } from 'react-icons/hi';

const ParentLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/parents/leaves', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeaves(res.data.data);
      } catch (err) {
        console.error('Failed to fetch leaves');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-black text-white mb-2">
          <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">Leave Requests</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">Track all leave applications and their approval status.</p>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5 text-center">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total</p>
            <p className="text-2xl font-black text-white mt-1">{leaves.length}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Approved</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{leaves.filter(l => l.status === 'approved').length}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Pending</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{leaves.filter(l => l.status === 'pending').length}</p>
          </div>
        </div>

        {/* Leave List */}
        {leaves.length > 0 ? (
          <div className="space-y-4">
            {leaves.map(leave => (
              <div key={leave.leave_id} className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <HiClipboardList className="text-xl" />
                    </div>
                    <div>
                      <p className="text-white font-bold">{leave.reason}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        Applied: {new Date(leave.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${statusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2">
                    <HiClock className="text-indigo-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500">Duration</p>
                      <p className="text-white text-sm font-bold">
                        {new Date(leave.from_date).toLocaleDateString()} — {new Date(leave.to_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiLocationMarker className="text-amber-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500">Destination</p>
                      <p className="text-white text-sm font-bold">{leave.destination || 'N/A'}</p>
                    </div>
                  </div>
                  {leave.warden_name && (
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500">Approved By</p>
                      <p className="text-emerald-400 text-sm font-bold">{leave.warden_name}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card py-16 text-center">
            <HiClipboardList className="text-5xl text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No leave requests found.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ParentLeaves;
