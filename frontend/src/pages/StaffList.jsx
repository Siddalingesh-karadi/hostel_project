import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineUserGroup, HiOutlineIdentification, HiOutlineMail, HiOutlineBadgeCheck } from 'react-icons/hi';

const StaffList = () => {
  const [data, setData] = useState({ staff: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch users');
      setLoading(false);
    }
  };

  if (user.role !== 'admin') {
    return <div className="p-8 text-white">Access Denied. Admins only.</div>;
  }

  const allUsers = [...data.staff, ...data.students];
  const filteredUsers = filter === 'all' 
    ? allUsers 
    : allUsers.filter(u => u.role === filter);

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow">Hostel Community</h1>
          <p className="text-slate-400">Comprehensive list of all students and staff members.</p>
        </div>
        
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['all', 'student', 'warden', 'housekeeper', 'security'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(u => (
            <div key={u.id} className="glass-card p-6 group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full ${getRoleColor(u.role)} text-white shadow-lg`}>
                  {u.role === 'student' ? <HiOutlineIdentification className="text-xl" /> : <HiOutlineBadgeCheck className="text-xl" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{u.name}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-400">{u.role}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <InfoRow icon={<HiOutlineMail />} label="Email" value={u.email} />
                {u.role === 'student' && (
                  <>
                    <InfoRow icon={<HiOutlineUserGroup />} label="Course" value={`${u.course || 'N/A'} - ${u.branch || ''}`} />
                    <InfoRow icon={<HiOutlineUserGroup />} label="Phone" value={u.phone || 'N/A'} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getRoleColor = (role) => {
  switch(role) {
    case 'admin': return 'bg-rose-500';
    case 'warden': return 'bg-amber-500';
    case 'student': return 'bg-indigo-500';
    case 'housekeeper': return 'bg-emerald-500';
    case 'security': return 'bg-slate-500';
    default: return 'bg-slate-700';
  }
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-slate-500">{icon}</span>
    <span className="text-slate-400 w-16">{label}:</span>
    <span className="text-slate-200 truncate">{value}</span>
  </div>
);

export default StaffList;
