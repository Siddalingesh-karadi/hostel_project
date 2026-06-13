import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiUserGroup, HiPlus, HiTrash, HiSearch, HiOutlineX } from 'react-icons/hi';

const ManageParents = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', phone: '', relationship: 'guardian', student_id: ''
  });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchParents = async () => {
    try {
      const res = await axios.get('/api/parents', { headers });
      setParents(res.data.data);
    } catch (err) {
      console.error('Failed to fetch parents');
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students', { headers });
      setStudents(res.data.data);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchParents(), fetchStudents()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      await axios.post('/api/parents', form, { headers });
      setShowCreateModal(false);
      setForm({ name: '', email: '', phone: '', relationship: 'guardian', student_id: '' });
      setMessage({ text: 'Parent account created successfully! Default password is the parent\'s name.', type: 'success' });
      fetchParents();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create parent', type: 'error' });
    }
  };

  const handleDelete = async (parentUserId) => {
    if (!window.confirm('Are you sure you want to delete this parent account?')) return;
    try {
      await axios.delete(`/api/parents/${parentUserId}`, { headers });
      setMessage({ text: 'Parent account deleted.', type: 'success' });
      fetchParents();
    } catch (err) {
      setMessage({ text: 'Failed to delete parent', type: 'error' });
    }
  };

  const filteredParents = parents.filter(p =>
    p.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.parent_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Manage Parents</span>
            </h1>
            <p className="text-slate-400 text-sm">Create and manage parent accounts linked to students.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-black tracking-wide shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <HiPlus className="text-lg" /> Add Parent
          </button>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border text-sm font-semibold transition-all ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
            'bg-rose-500/10 text-rose-400 border-rose-500/25'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-8 max-w-md">
          <HiSearch className="text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search by parent name, email, or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-white focus:ring-0 outline-none w-full text-sm"
          />
        </div>

        {/* Parents Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Parent</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Email</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Phone</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Relationship</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Linked Student</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map(p => (
                  <tr key={p.parent_user_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                          {p.parent_name?.charAt(0)}
                        </div>
                        <span className="text-white font-bold text-sm">{p.parent_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{p.parent_email}</td>
                    <td className="p-4 text-slate-400 text-sm">{p.parent_phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                        {p.relationship}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm font-bold">{p.student_name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{p.usn || p.student_number}</p>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(p.parent_user_id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-lg transition-all"
                      >
                        <HiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredParents.length === 0 && (
              <div className="py-16 text-center">
                <HiUserGroup className="text-5xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No parent accounts found.</p>
                <p className="text-slate-500 text-sm mt-1">Click "Add Parent" to create one.</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== Create Parent Modal ===== */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-lg p-8 border-indigo-500/30 border-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HiUserGroup className="text-indigo-500" /> Create Parent Account
                  </h2>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-black mt-1">Link parent to a student</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white text-xl">
                  <HiOutlineX />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Parent Name *</label>
                    <input
                      required type="text" placeholder="Full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all text-sm"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Email *</label>
                    <input
                      required type="email" placeholder="parent@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all text-sm"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Phone</label>
                    <input
                      type="text" placeholder="9876543210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all text-sm"
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Relationship</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all text-sm"
                      value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                    >
                      <option value="father" className="bg-slate-900">Father</option>
                      <option value="mother" className="bg-slate-900">Mother</option>
                      <option value="guardian" className="bg-slate-900">Guardian</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Link to Student *</label>
                  <select
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition-all text-sm"
                    value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  >
                    <option value="" className="bg-slate-900">-- Select a Student --</option>
                    {students.map(s => (
                      <option key={s.student_id} value={s.student_id} className="bg-slate-900">
                        {s.name} ({s.usn || s.student_number || 'N/A'}) — {s.branch || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300">
                  <strong>Note:</strong> The parent's default password will be their <strong>name</strong>. They can change it after logging in.
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
                    Create Account
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-white/5 text-slate-300 font-bold p-3 rounded-xl">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageParents;
