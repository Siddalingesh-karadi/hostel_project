import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  HiUserGroup, HiOfficeBuilding, HiCheckCircle, HiCurrencyRupee,
  HiClipboardList, HiExclamation, HiOutlineSpeakerphone, HiBell,
  HiOutlineCalendar, HiChartBar
} from 'react-icons/hi';

const ParentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/parents/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch parent dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || !data.student) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <HiExclamation className="text-6xl text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">No Student Linked</h2>
          <p className="text-slate-400">Your account is not linked to any student yet. Please contact the hostel administration.</p>
        </div>
      </div>
    );
  }

  const { student, attendance, fee, leaves, complaints, notices, unread_notifications } = data;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              Welcome, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{user.name}</span>
            </h1>
            <p className="text-slate-400 text-sm">Monitor your child's hostel life — attendance, fees, leaves, and more.</p>
          </div>
          <button
            onClick={() => navigate('/parent/notifications')}
            className="relative px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-2xl font-bold transition-all flex items-center gap-2"
          >
            <HiBell className="text-xl" /> Notifications
            {unread_notifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/20">
                {unread_notifications}
              </span>
            )}
          </button>
        </div>

        {/* Student Profile Card */}
        <div className="glass-card p-8 mb-8 border-l-4 border-indigo-500">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-3xl font-black text-indigo-400">
              {student.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white">{student.name}</h2>
              <p className="text-slate-400 text-sm">{student.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <InfoItem label="USN" value={student.usn || student.student_number || 'N/A'} />
            <InfoItem label="Branch" value={`${student.branch || 'N/A'} - Sem ${student.semester || 'N/A'}`} />
            <InfoItem label="Room" value={student.room_number ? `${student.block} - ${student.room_number}` : 'Not Allocated'} />
            <InfoItem label="Phone" value={student.phone || 'N/A'} />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Attendance Card */}
          <div
            onClick={() => navigate('/parent/attendance')}
            className="glass-card p-6 cursor-pointer hover:border-emerald-500/30 transition-all border-t-4 border-emerald-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-2xl">
                <HiCheckCircle />
              </div>
              <div>
                <h3 className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Attendance (30 Days)</h3>
                <p className="text-3xl font-black text-white">{attendance.percentage}%</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-emerald-400 font-bold">Present: {attendance.present}</span>
              <span className="text-rose-400 font-bold">Absent: {attendance.absent}</span>
              <span className="text-amber-400 font-bold">Leave: {attendance.on_leave}</span>
            </div>
          </div>

          {/* Fee Card */}
          <div
            onClick={() => navigate('/parent/fees')}
            className="glass-card p-6 cursor-pointer hover:border-amber-500/30 transition-all border-t-4 border-amber-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 text-2xl">
                <HiCurrencyRupee />
              </div>
              <div>
                <h3 className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Fee Status</h3>
                <p className={`text-3xl font-black ${fee?.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {fee ? fee.status.toUpperCase() : 'N/A'}
                </p>
              </div>
            </div>
            {fee && (
              <p className="text-sm text-slate-400">
                Paid: <span className="text-emerald-400 font-bold">₹{(fee.paid_amount || 0).toLocaleString()}</span>
              </p>
            )}
          </div>

          {/* Leaves Card */}
          <div
            onClick={() => navigate('/parent/leaves')}
            className="glass-card p-6 cursor-pointer hover:border-indigo-500/30 transition-all border-t-4 border-indigo-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 text-2xl">
                <HiClipboardList />
              </div>
              <div>
                <h3 className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Leave Requests</h3>
                <p className="text-3xl font-black text-white">{leaves.length}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              {leaves.filter(l => l.status === 'approved').length} approved, {leaves.filter(l => l.status === 'pending').length} pending
            </p>
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Complaints */}
          <div className="glass-card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HiExclamation className="text-rose-500" /> Recent Complaints
            </h3>
            {complaints.length > 0 ? (
              <div className="space-y-3">
                {complaints.map(c => (
                  <div key={c.complaint_id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <p className="text-white text-sm font-bold">{c.title}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">{c.category} • {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">No complaints raised.</p>
            )}
            <button onClick={() => navigate('/parent/complaints')} className="mt-4 w-full py-2 text-xs font-bold text-slate-400 hover:text-indigo-400 uppercase tracking-widest transition-all">
              View All →
            </button>
          </div>

          {/* Latest Notices */}
          <div className="glass-card p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HiOutlineSpeakerphone className="text-indigo-500" /> Hostel Notices
            </h3>
            {notices.length > 0 ? (
              <div className="space-y-3">
                {notices.map(n => (
                  <div key={n.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-white text-sm font-bold">{n.title}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      By {n.created_by_name} • {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">No notices posted.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
    <p className="text-[9px] font-black uppercase text-slate-500 mb-1">{label}</p>
    <p className="text-white font-bold text-sm truncate">{value}</p>
  </div>
);

export default ParentDashboard;
