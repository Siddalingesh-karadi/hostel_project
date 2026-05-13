import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiSearch, HiUserAdd, HiPencil, HiTrash } from 'react-icons/hi';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', course: '', branch: '', year: '', phone: '', blood_group: '', address: ''
  });

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/students', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ name: '', email: '', course: '', branch: '', year: '', phone: '', blood_group: '', address: '' });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student? All their data will be deleted.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Student Directory</h1>
            <p className="text-slate-400">Manage and track all students in the hostel</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <HiUserAdd className="text-xl" />
            Add Student
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">New Student Admission</h2>
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" required className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email" required className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <input type="text" placeholder="Course (e.g. B.Tech)" className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})} />
                <input type="text" placeholder="Branch" className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} />
                <input type="number" placeholder="Year" className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                <input type="text" placeholder="Phone" className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <input type="text" placeholder="Blood Group" className="bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.blood_group} onChange={(e) => setFormData({...formData, blood_group: e.target.value})} />
                <textarea placeholder="Address" className="bg-slate-800 border-none rounded-lg p-3 text-white md:col-span-2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                
                <div className="md:col-span-2 flex gap-4 mt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">Create Student</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl" />
              <input 
                type="text" 
                placeholder="Search by name or branch..." 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-300 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Course / Branch</th>
                  <th className="px-6 py-4 font-semibold">Phone</th>
                  <th className="px-6 py-4 font-semibold">Room</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center">Loading students...</td></tr>
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center">No students found</td></tr>
                ) : filteredStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{student.name}</span>
                        <span className="text-xs text-slate-500">{student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span>{student.course}</span>
                        <span className="text-slate-500 italic">{student.branch}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{student.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/20">
                        {student.room_id ? `Room ${student.room_id}` : 'Unallocated'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors">
                          <HiPencil className="text-xl" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.student_id)}
                          className="p-2 hover:bg-white/10 rounded-lg text-rose-400 transition-colors"
                        >
                          <HiTrash className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
