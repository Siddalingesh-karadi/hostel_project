import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiPlus, HiPencil, HiTrash, HiUserAdd, HiLogout } from 'react-icons/hi';

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
  
  const [formData, setFormData] = useState({ room_number: '', block: '', capacity: '' });
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
      console.error('Failed to fetch data');
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
      setFormData({ room_number: '', block: '', capacity: '' });
      fetchData();
    } catch (err) { alert('Failed to add room'); }
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
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/rooms/allocate', { room_id: selectedRoom.room_id, student_id: selectedStudent }, { headers: { Authorization: `Bearer ${token}` } });
      setShowAllocateModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Allocation failed'); }
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
            <p className="text-slate-400">Manage hostel rooms and student allocations</p>
          </div>
          {user.role === 'admin' && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
              <HiPlus /> Add New Room
            </button>
          )}
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
                    onClick={() => { setSelectedRoom(room); setFormData({ room_number: room.room_number, block: room.block, capacity: room.capacity }); setShowEditModal(true); }}
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

        {/* Allocation Modal */}
        {showAllocateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8">
              <h2 className="text-xl font-bold text-white mb-6">Allocate Room {selectedRoom.room_number}</h2>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white mb-6 outline-none"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Select Student...</option>
                {students.filter(s => !s.room_id).map(s => (
                  <option key={s.student_id} value={s.student_id}>{s.name} ({s.student_number})</option>
                ))}
              </select>
              <div className="flex gap-4">
                <button onClick={handleAllocate} className="flex-1 btn-primary">Allocate</button>
                <button onClick={() => setShowAllocateModal(false)} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold">Cancel</button>
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
