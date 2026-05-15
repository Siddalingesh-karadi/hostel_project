import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineUserGroup, HiOutlineIdentification, HiOutlineMail, HiOutlineBadgeCheck, HiPlus, HiTrash } from 'react-icons/hi';


const StaffList = () => {
  const [data, setData] = useState({ staff: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'student' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
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
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 mb-2"
        >
          <HiPlus /> Create New Account
        </button>
      </div>
      
      <div className="flex justify-end mb-8">

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
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{u.name}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-400">{u.role}</p>
                </div>
                {u.id !== user.id && (
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <HiTrash />
                  </button>
                )}
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

      {/* Create User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8 border-indigo-500/30 border-2">
            <h2 className="text-xl font-bold text-white mb-6">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Full Name</label>
                <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Email Address</label>
                <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Password</label>
                <input type="password" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Role</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="warden">Warden</option>
                  <option value="housekeeper">Housekeeper</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 btn-primary">Create Account</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold">Cancel</button>
              </div>
            </form>
          </div>
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
