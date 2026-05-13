import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiUserGroup, HiOfficeBuilding, HiExclamation, HiCurrencyDollar } from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0, occupancy: '0/0', pendingComplaints: 0, unpaidFees: 0
  });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user.role === 'admin' || user.role === 'warden') {
      const fetchStats = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('/api/analytics/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStats(response.data.data);
        } catch (err) {
          console.error('Failed to fetch stats');
        }
      };
      fetchStats();
    }
  }, [user.role]);

  // Admin Dashboard View
  if (user.role === 'admin' || user.role === 'warden') {
    return (
      <div className="p-8 bg-slate-950 min-h-screen">
        <h1 className="text-3xl font-bold text-white mb-2">Hostel Overview</h1>
        <p className="text-slate-400 mb-10">Welcome back, {user.name}. Here is what's happening today.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Students" value={stats.totalStudents} icon={<HiUserGroup />} color="bg-indigo-500" />
          <StatCard title="Occupancy" value={stats.occupancy} icon={<HiOfficeBuilding />} color="bg-emerald-500" />
          <StatCard title="Pending" value={stats.pendingComplaints} icon={<HiExclamation />} color="bg-rose-500" />
          <StatCard title="Unpaid Fees" value={`$${stats.unpaidFees}`} icon={<HiCurrencyDollar />} color="bg-amber-500" />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6">
            <h3 className="text-white font-bold mb-4">Recent Admissions</h3>
            <p className="text-slate-500 text-sm italic">New students will appear here as they join...</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-white font-bold mb-4">Urgent Maintenance</h3>
            <p className="text-slate-500 text-sm italic">High priority complaints will be listed here...</p>
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard View
  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-2">Welcome Home, {user.name}</h1>
      <p className="text-slate-400 mb-10">Your hostel portal and personal details.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 border-t-4 border-indigo-500">
          <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-4">Your Room</h3>
          <p className="text-3xl font-bold text-white">Block A - 204</p>
          <p className="text-slate-500 text-sm mt-2">Shared with 2 others</p>
        </div>
        <div className="glass-card p-8 border-t-4 border-emerald-500">
          <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-4">Fee Status</h3>
          <p className="text-3xl font-bold text-emerald-400">Paid</p>
          <p className="text-slate-500 text-sm mt-2">No outstanding dues</p>
        </div>
        <div className="glass-card p-8 border-t-4 border-amber-500">
          <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-4">Leave Status</h3>
          <p className="text-3xl font-bold text-white">At Hostel</p>
          <p className="text-slate-500 text-sm mt-2">No active leave requests</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card p-6 flex items-center gap-6">
    <div className={`p-4 rounded-2xl ${color} text-white text-2xl shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export default Dashboard;
