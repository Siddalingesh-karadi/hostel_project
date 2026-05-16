import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiPlus, HiPencil, HiTrash, HiUserAdd, HiLogout, HiSearch, HiCheckCircle } from 'react-icons/hi';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ room_number: '', block: '', floor: '', capacity: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [roomsRes, studentsRes] = await Promise.all([
        axios.get('/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRooms(roomsRes.data.data);
      setStudents(studentsRes.data.data);
    } catch (err) { 
      console.error('Failed to fetch data', err);
      alert('Failed to load student data. Check console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/rooms', formData, { headers: { Authorization: `Bearer ${token}` } });
      setShowAddModal(false);
      setFormData({ room_number: '', block: '', floor: '', capacity: '' });
      fetchData();
    } catch (err) { 
      alert(err.response?.data?.message || 'Failed to add room'); 
    }

  };

  const handleEditRoom = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/rooms/${selectedRoom.room_id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setShowEditModal(false);
      fetchData();
    } catch (err) { alert('Failed to update room'); }
  };

  const handleAllocate = async () => {
    if (!selectedStudent) {
      return alert('Please select a student to allocate');
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/rooms/allocate', { room_id: selectedRoom.room_id, student_id: selectedStudent }, { headers: { Authorization: `Bearer ${token}` } });
      setShowAllocateModal(false);
      setSelectedStudent('');
      fetchData();
    } catch (err) { 
      alert(err.response?.data?.message || 'Allocation failed'); 
    }
  };

  const handleDeallocate = async (roomId, studentId) => {
    if (!window.confirm('Remove student from this room?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/rooms/deallocate', { room_id: roomId, student_id: studentId }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { alert('Deallocation failed'); }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-glow">Room Management</h1>
            <p className="text-slate-400">Rooms: {rooms.length} | Unallocated: {students.filter(s => !s.room_id).length} | Total Students: {students.length}</p>
          </div>
        <div className="flex gap-4 mb-2">
          <button 
            onClick={fetchData}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-all border border-white/5"
          >
            Refresh
          </button>
          {(user.role === 'admin' || user.role === 'warden') && (
            <button onClick={() => { setFormData({ room_number: '', block: '', floor: '', capacity: '' }); setShowAddModal(true); }} className="btn-primary flex items-center gap-2">
              <HiPlus /> Add New Room
            </button>
          )}
        </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.room_id} className="glass-card p-6 border-t-4 border-indigo-500 hover:scale-[1.02] transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Room {room.room_number}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{room.block} Block</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelectedRoom(room); setFormData({ room_number: room.room_number, block: room.block, floor: room.floor, capacity: room.capacity }); setShowEditModal(true); }}
                    className="p-2 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"
                  ><HiPencil /></button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <span>Occupancy</span>
                  <span>{room.occupied} / {room.capacity} Slots</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all" style={{ width: `${(room.occupied/room.capacity)*100}%` }}></div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {room.students?.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm font-medium text-slate-300">{s.name}</span>
                    <button onClick={() => handleDeallocate(room.room_id, s.id)} className="text-rose-400 hover:text-rose-300 text-xs font-bold uppercase">Remove</button>
                  </div>
                ))}
                {room.occupied < room.capacity && (
                  <button onClick={() => { setSelectedRoom(room); setShowAllocateModal(true); }} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                    <HiUserAdd /> Allocate Student
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Room Modal */}
        {showAddModal && (
          <RoomModal 
            title="Add New Room" 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleAddRoom} 
            onClose={() => setShowAddModal(false)} 
          />
        )}

        {/* Edit Room Modal */}
        {showEditModal && (
          <RoomModal 
            title="Edit Room Details" 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={handleEditRoom} 
            onClose={() => setShowEditModal(false)} 
          />
        )}

        {showAllocateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-lg p-8 border-indigo-500/30 border-2">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Allocate Room {selectedRoom.room_number}</h2>
                  <p className="text-slate-400 text-sm">Select an unallocated student to assign</p>
                </div>
                <button onClick={() => setShowAllocateModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <HiLogout className="text-2xl rotate-180" />
                </button>
              </div>

              {/* Search Box */}
              <div className="relative mb-6">
                <input 
                  type="text" 
                  placeholder="Search students by name or USN..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white pl-12 focus:border-indigo-500 outline-none transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl" />
              </div>

              {/* Scrollable List */}
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {students && students.filter(s => (!s.room_id || s.room_id === 0) && (
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (s.student_number && s.student_number.toLowerCase().includes(searchTerm.toLowerCase()))
                )).length > 0 ? (
                  students.filter(s => (!s.room_id || s.room_id === 0) && (
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    (s.student_number && s.student_number.toLowerCase().includes(searchTerm.toLowerCase()))
                  )).map(s => (
                    <div 
                      key={s.student_id} 
                      onClick={() => setSelectedStudent(s.student_id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center group ${
                        selectedStudent === s.student_id 
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedStudent === s.student_id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{s.name}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-tighter">{s.student_number || 'STU-PENDING'}</p>
                        </div>
                      </div>
                      {selectedStudent === s.student_id && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                          <HiCheckCircle />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <HiUserAdd className="text-5xl text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">No unallocated students match your search.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
                <button 
                  onClick={handleAllocate} 
                  disabled={!selectedStudent}
                  className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                    selectedStudent 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Confirm Allocation
                </button>
                <button onClick={() => setShowAllocateModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RoomModal = ({ title, formData, setFormData, onSubmit, onClose }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="glass-card w-full max-w-md p-8">
      <h2 className="text-xl font-bold text-white mb-6">{title}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Room Number</label>
          <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Block</label>
          <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Floor</label>
          <input type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Capacity</label>
          <input type="number" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 btn-primary">Save Changes</button>
          <button type="button" onClick={onClose} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold">Cancel</button>
        </div>
      </form>
    </div>
  </div>
);

export default RoomList;
