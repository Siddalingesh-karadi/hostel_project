import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiUserGroup, HiSearch, HiIdentification, HiPhone, HiAcademicCap, HiLocationMarker } from 'react-icons/hi';

const StudentNetwork = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch student directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.usn && s.usn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-glow">Hostel Network</h1>
            <p className="text-slate-400">Connect with your fellow hostel residents.</p>
          </div>
          <div className="relative max-w-md w-full">
            <input 
              type="text" 
              placeholder="Search by name, branch, or USN..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:border-indigo-500 outline-none transition-all shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl" />
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <div key={student.student_id} className="glass-card p-6 hover:scale-[1.02] transition-all border-l-4 border-indigo-500 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{student.name}</h3>
                    <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{student.branch}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                      <HiAcademicCap className="text-indigo-400" /> Academic
                    </p>
                    <p className="text-sm font-bold text-white">{student.semester} Sem</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                      <HiLocationMarker className="text-indigo-400" /> Room
                    </p>
                    <p className="text-sm font-bold text-white">{student.room_number || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <HiPhone className="text-indigo-400" />
                    <span className="text-sm font-medium">{student.phone || 'Not Shared'}</span>
                  </div>
                  <div className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    {student.usn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNetwork;
