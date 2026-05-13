import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiPlus, HiHome, HiUserGroup } from 'react-icons/hi';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const [formData, setFormData] = useState({
    room_number: '', block: '', floor: '', capacity: 3
  });

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data.data);
    } catch (err) {
      console.error('Failed to fetch rooms');
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRooms(), fetchStudents()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/rooms', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ room_number: '', block: '', floor: '', capacity: 3 });
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add room');
    }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/rooms/allocate', {
        student_id: selectedStudent,
        room_id: selectedRoom.room_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAllocateModal(false);
      setSelectedStudent('');
      fetchRooms();
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Allocation failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Room Management</h1>
            <p className="text-slate-400">Track occupancy and manage room allocations</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <HiPlus className="text-xl" />
            Add Room
          </button>
        </div>

        {/* Add Room Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Room</h2>
              <form onSubmit={handleAddRoom} className="space-y-4">
                <input type="text" placeholder="Room Number (e.g. 101)" required className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} />
                <input type="text" placeholder="Block (e.g. A)" className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} />
                <input type="number" placeholder="Floor" className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} />
                <input type="number" placeholder="Capacity" className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} />
                
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">Save Room</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Allocate Student Modal */}
        {showAllocateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Allocate Student</h2>
              <p className="text-slate-400 mb-6 text-sm">Assign a student to Room {selectedRoom?.room_number}</p>
              <form onSubmit={handleAllocate} className="space-y-4">
                <select 
                  required 
                  className="w-full bg-slate-800 border-none rounded-lg p-3 text-white"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select Student...</option>
                  {students.filter(s => !s.room_id).map(student => (
                    <option key={student.student_id} value={student.student_id}>{student.name} ({student.branch})</option>
                  ))}
                </select>
                
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">Confirm Allocation</button>
                  <button type="button" onClick={() => setShowAllocateModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Loading rooms...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <div key={room.room_id} className="glass-card p-6 flex flex-col justify-between border-t-4 border-indigo-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <HiHome className="text-2xl" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded ${
                    room.status === 'available' ? 'bg-emerald-500/10 text-emerald-400' : 
                    room.status === 'full' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {room.status}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">Room {room.room_number}</h3>
                  <p className="text-sm text-slate-500">Block {room.block} • Floor {room.floor}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Occupancy</span>
                    <span className="text-white font-medium">{room.occupied} / {room.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        room.occupied === room.capacity ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  disabled={room.status === 'full'}
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowAllocateModal(true);
                  }}
                  className={`mt-6 w-full py-2 rounded-lg text-sm font-semibold transition-colors border border-white/10 ${
                    room.status === 'full' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {room.status === 'full' ? 'Room Full' : 'Allocate Student'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;
