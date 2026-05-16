import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiSearch, HiUserAdd, HiPencil, HiTrash } from 'react-icons/hi';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', course: '', branch: '', year: '', phone: '', blood_group: '', address: '',
    parent_name: '', parent_phone: '', aadhar_number: '', age: '', permanent_address: '',
    usn: '', semester: ''
  });


  const user = JSON.parse(localStorage.getItem('user'));

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

  const handleOpenEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course || '',
      branch: student.branch || '',
      year: student.year || '',
      phone: student.phone || '',
      blood_group: student.blood_group || '',
      address: student.address || '',
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      aadhar_number: student.aadhar_number || '',
      age: student.age || '',
      permanent_address: student.permanent_address || '',
      usn: student.usn || '',
      semester: student.semester || ''
    });

    setSelectedStudentId(student.student_id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setFormData({ 
      name: '', email: '', course: '', branch: '', year: '', phone: '', blood_group: '', address: '',
      parent_name: '', parent_phone: '', aadhar_number: '', age: '', permanent_address: '',
      usn: '', semester: ''
    });

    setIsEditing(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (isEditing) {
        await axios.put(`/api/students/${selectedStudentId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/students', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (user.role !== 'admin') return alert('Only Head Warden (Admin) can delete records.');
    if (!window.confirm('Are you sure you want to remove this student?')) return;
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
    student.student_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-glow">Student Directory</h1>
            <p className="text-slate-400">Total Registered: {students.length} | Click a name to view full details</p>
          </div>
          {user.role === 'admin' && (
            <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
              <HiUserAdd className="text-xl" /> Add New Admission
            </button>
          )}
        </div>

        {/* Admission Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f0f13] border border-white/10 w-full max-w-4xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl shadow-indigo-500/10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                {isEditing ? 'Update Student Record' : 'New Admission Form'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormInput label="Full Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} required />
                  <FormInput label="Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} required type="email" />
                  <FormInput label="Phone" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
                  <FormInput label="Age" value={formData.age} onChange={(v) => setFormData({...formData, age: v})} type="number" />
                  <FormInput label="Aadhar" value={formData.aadhar_number} onChange={(v) => setFormData({...formData, aadhar_number: v})} />
                  <FormInput label="Course" value={formData.course} onChange={(v) => setFormData({...formData, course: v})} />
                  <FormInput label="Branch" value={formData.branch} onChange={(v) => setFormData({...formData, branch: v})} />
                  <FormInput label="Year" value={formData.year} onChange={(v) => setFormData({...formData, year: v})} type="number" />
                  <FormInput label="Parent Name" value={formData.parent_name} onChange={(v) => setFormData({...formData, parent_name: v})} />
                  <FormInput label="Parent Phone" value={formData.parent_phone} onChange={(v) => setFormData({...formData, parent_phone: v})} />
                  <FormInput label="USN" value={formData.usn} onChange={(v) => setFormData({...formData, usn: v})} />
                  <FormInput label="Semester" value={formData.semester} onChange={(v) => setFormData({...formData, semester: v})} type="number" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormTextArea label="Local Address" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} />
                  <FormTextArea label="Permanent Address" value={formData.permanent_address} onChange={(v) => setFormData({...formData, permanent_address: v})} />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 btn-primary py-4">{isEditing ? 'Update Student' : 'Confirm Admission'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-4 rounded-xl font-bold transition-all">Discard</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showViewModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f0f13] border-2 border-indigo-500/30 w-full max-w-2xl rounded-[2.5rem] p-10 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-500/20">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">{selectedStudent.name}</h2>
                    <p className="text-indigo-400 font-bold tracking-widest uppercase text-xs">{selectedStudent.usn || selectedStudent.student_number}</p>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl text-slate-400 hover:text-white transition-all">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <DetailRow label="Email" value={selectedStudent.email} />
                <DetailRow label="Phone" value={selectedStudent.phone} />
                <DetailRow label="Course" value={`${selectedStudent.course} (${selectedStudent.branch})`} />
                <DetailRow label="Semester / Year" value={`${selectedStudent.semester} Sem / ${selectedStudent.year} Year`} />
                <DetailRow label="Guardian" value={selectedStudent.parent_name} />
                <DetailRow label="Guardian Phone" value={selectedStudent.parent_phone} />
                <DetailRow label="Blood Group" value={selectedStudent.blood_group} />
                <DetailRow label="Aadhar" value={selectedStudent.aadhar_number} />
              </div>

              <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Local Address</p>
                  <p className="text-white text-sm">{selectedStudent.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Permanent Address</p>
                  <p className="text-white text-sm">{selectedStudent.permanent_address || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                <button onClick={() => { setShowViewModal(false); handleOpenEdit(selectedStudent); }} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20">Edit Record</button>
                <button onClick={() => setShowViewModal(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold transition-all">Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/5">
            <HiSearch className="text-slate-500 text-xl" />
            <input 
              type="text" 
              placeholder="Search by name or Student ID (e.g. STU2024)..." 
              className="bg-transparent border-none text-white w-full focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Student ID / Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Academic</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.map(student => (
                <tr key={student.student_id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-indigo-400 font-bold text-[10px] mb-1 tracking-widest">{student.student_number || 'PENDING'}</p>
                    <button 
                      onClick={() => { setSelectedStudent(student); setShowViewModal(true); }}
                      className="text-white font-bold hover:text-indigo-400 transition-colors text-left"
                    >
                      {student.name}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{student.email}</p>
                    <p className="text-xs text-slate-500">{student.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{student.course} - {student.year} Year</p>
                    <p className="text-xs text-slate-500">{student.branch}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${student.room_number ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {student.room_number ? `Room ${student.room_number}` : 'No Room'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(student)} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"><HiPencil /></button>
                      {user.role === 'admin' && (
                        <button onClick={() => handleDeleteStudent(student.student_id)} className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all"><HiTrash /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{label}</p>
    <p className="text-white font-bold">{value || 'Not Provided'}</p>
  </div>
);

const FormInput = ({ label, value, onChange, type = "text", required = false }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <input 
      type={type} required={required} value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 focus:ring-0 outline-none transition-all"
    />
  </div>
);

const FormTextArea = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <textarea 
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 focus:ring-0 outline-none transition-all h-24"
    />
  </div>
);

export default StudentList;
