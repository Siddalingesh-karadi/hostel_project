import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCheckCircle, HiOutlineClock, HiClipboardList } from 'react-icons/hi';

const HousekeeperDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/housekeeper/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data.data);
    } catch (err) {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAttendance = async (type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/attendance/toggle', { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Attendance recorded: ${type}`);
    } catch (err) {
      alert('Failed to record attendance');
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/housekeeper/tasks/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading cleaning schedule...</div>;

  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cleaning Schedule</h1>
            <p className="text-slate-400">Assigned rooms for today's maintenance.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleAttendance('check-in')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              Check In
            </button>
            <button 
              onClick={() => handleAttendance('check-out')}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20"
            >
              Check Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Assigned" value={tasks.length} icon={<HiClipboardList />} color="text-indigo-400" />
          <StatCard title="Completed" value={completedCount} icon={<HiCheckCircle />} color="text-emerald-400" />
          <StatCard title="Remaining" value={tasks.length - completedCount} icon={<HiOutlineClock />} color="text-amber-400" />
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-6 bg-white/5 border-b border-white/5 font-bold uppercase text-xs tracking-widest text-slate-500">
            Assigned Rooms
          </div>
          <div className="divide-y divide-white/5">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.task_id} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {task.room_number}
                  </div>
                  <div>
                    <p className="text-white font-bold">{task.block} Block - Floor {task.floor}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Room Maintenance</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {task.status === 'completed' && (
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Done at {new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <button 
                    onClick={() => handleUpdateStatus(task.task_id, task.status)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      task.status === 'completed' 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white/5 text-slate-500 hover:text-white border border-white/10'
                    }`}
                  >
                    <HiCheckCircle className="text-2xl" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center text-slate-500 italic">No tasks assigned for today.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card p-6 flex items-center gap-6">
    <div className={`p-4 rounded-2xl bg-white/5 ${color} text-2xl`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </div>
);

export default HousekeeperDashboard;
