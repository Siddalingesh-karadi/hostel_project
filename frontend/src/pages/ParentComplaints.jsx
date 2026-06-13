import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiExclamation } from 'react-icons/hi';

const ParentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/parents/complaints', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaints(res.data.data);
      } catch (err) {
        console.error('Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const priorityColor = (p) => {
    switch (p) {
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const statusColor = (s) => {
    switch (s) {
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'in_progress': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-black text-white mb-2">
          <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">Complaints</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">View complaints raised by your child and their resolution status.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5 text-center">
            <p className="text-[10px] font-black uppercase text-slate-500">Total</p>
            <p className="text-2xl font-black text-white mt-1">{complaints.length}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-[10px] font-black uppercase text-slate-500">Resolved</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{complaints.filter(c => c.status === 'resolved').length}</p>
          </div>
          <div className="glass-card p-5 text-center">
            <p className="text-[10px] font-black uppercase text-slate-500">Pending</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{complaints.filter(c => c.status === 'pending').length}</p>
          </div>
        </div>

        {/* Complaint List */}
        {complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map(c => (
              <div key={c.complaint_id} className="glass-card p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{c.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      {c.category} • {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${priorityColor(c.priority)}`}>
                      {c.priority || 'low'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm bg-white/5 p-4 rounded-xl border border-white/5">{c.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card py-16 text-center">
            <HiExclamation className="text-5xl text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No complaints found.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ParentComplaints;
