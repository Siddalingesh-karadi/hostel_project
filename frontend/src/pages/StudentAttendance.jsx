import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HiCheckCircle, HiXCircle, HiPaperAirplane, HiSearch, 
  HiCalendar, HiFilter, HiSave, HiSparkles 
} from 'react-icons/hi';

const StudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch student attendance list for the selected date
  const fetchAttendance = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/attendance/students?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Store the retrieved records
      setStudents(response.data.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to fetch attendance data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  // Handle status toggle for a student
  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev => prev.map(student => {
      if (student.student_id === studentId) {
        return { ...student, status: newStatus };
      }
      return student;
    }));
  };

  // Shortcut: Mark all unmarked students as Present
  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(student => {
      if (student.status === 'unmarked') {
        return { ...student, status: 'present' };
      }
      return student;
    }));
    setMessage({ text: 'Marked all unmarked students as Present locally. Remember to click Save!', type: 'info' });
  };

  // Submit the updated attendance list to the database
  const handleSubmit = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      
      // Filter records that aren't unmarked to save space, or submit everything
      // We submit only records that have a status set (present, absent, or on_leave)
      const recordsToSubmit = students
        .filter(s => s.status !== 'unmarked')
        .map(s => ({
          student_id: s.student_id,
          status: s.status
        }));

      if (recordsToSubmit.length === 0) {
        setMessage({ text: 'Please mark attendance for at least one student before saving.', type: 'warning' });
        setSaving(false);
        return;
      }

      await axios.post('/api/attendance/submit', {
        date,
        records: recordsToSubmit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ text: 'Attendance saved successfully!', type: 'success' });
      
      // Re-fetch to ensure sync with database
      fetchAttendance();
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || 'Failed to save attendance', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Extract unique blocks and floors dynamically for the filter menus
  const blocks = ['All', ...new Set(students.map(s => s.block).filter(Boolean))];
  const floors = ['All', ...new Set(students.map(s => s.floor).filter(f => f !== null))];

  // Filter students based on UI selections
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.usn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBlock = selectedBlock === 'All' || s.block === selectedBlock;
    const matchesFloor = selectedFloor === 'All' || String(s.floor) === String(selectedFloor);

    return matchesSearch && matchesBlock && matchesFloor;
  });

  // Calculate live counters
  const stats = students.reduce((acc, curr) => {
    if (curr.status === 'present') acc.present++;
    else if (curr.status === 'absent') acc.absent++;
    else if (curr.status === 'on_leave') acc.on_leave++;
    else acc.unmarked++;
    return acc;
  }, { present: 0, absent: 0, on_leave: 0, unmarked: 0 });

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Daily Attendance Roll Call</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                <HiSparkles className="animate-pulse" /> Warden Desk
              </span>
            </h1>
            <p className="text-slate-400 text-sm">Select a date, filter by block/floor, and record student attendance status.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
              <HiCalendar className="text-indigo-400 text-xl" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none text-white focus:ring-0 outline-none text-sm font-bold"
              />
            </div>

            <button 
              onClick={handleMarkAllPresent}
              className="px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <HiCheckCircle className="text-emerald-400 text-lg" /> Mark Unmarked Present
            </button>

            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-black tracking-wide shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
            >
              <HiSave className="text-lg" /> {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border text-sm font-semibold transition-all ${
            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
            message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' :
            message.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
            'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
          }`}>
            {message.text}
          </div>
        )}

        {/* Status Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Students" value={students.length} color="indigo" />
          <StatBox label="Present" value={stats.present} color="emerald" highlight />
          <StatBox label="Absent" value={stats.absent} color="rose" highlight />
          <StatBox label="On Leave" value={stats.on_leave} color="amber" highlight />
        </div>

        {/* Controls Card */}
        <div className="bg-slate-900/50 border border-white/5 backdrop-blur-xl rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 w-full md:max-w-md">
            <HiSearch className="text-slate-400 text-xl" />
            <input 
              type="text" 
              placeholder="Search by student name or USN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-white focus:ring-0 outline-none w-full text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <HiFilter className="text-indigo-400 text-sm" />
              <span className="text-xs text-slate-400 uppercase font-black tracking-wider">Filters</span>
            </div>
            
            {/* Block Filter */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-black">Block:</span>
              <select 
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="bg-transparent border-none text-white focus:ring-0 outline-none text-xs font-bold py-0.5"
              >
                {blocks.map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
              </select>
            </div>

            {/* Floor Filter */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-black">Floor:</span>
              <select 
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="bg-transparent border-none text-white focus:ring-0 outline-none text-xs font-bold py-0.5"
              >
                {floors.map(f => <option key={f} value={f} className="bg-slate-900">{f === 'All' ? 'All' : `${f} Floor`}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Students Roll Call Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-slate-900/20 border border-white/5 rounded-3xl py-20 text-center text-slate-400">
            <p className="text-lg font-bold">No students found</p>
            <p className="text-sm text-slate-500 mt-1">Try tweaking your search term, Block, or Floor selections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => {
              const isDefaultLeave = student.on_approved_leave > 0 && student.status === 'on_leave';
              
              return (
                <div 
                  key={student.student_id} 
                  className={`relative bg-slate-900/40 border transition-all duration-300 rounded-[2rem] p-6 group ${
                    student.status === 'present' ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/5 bg-emerald-500/[0.01]' :
                    student.status === 'absent' ? 'border-rose-500/20 shadow-lg shadow-rose-500/5 bg-rose-500/[0.01]' :
                    student.status === 'on_leave' ? 'border-amber-500/20 shadow-lg shadow-amber-500/5 bg-amber-500/[0.01]' :
                    'border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Leave Badge */}
                  {student.on_approved_leave > 0 && (
                    <span className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                      <HiPaperAirplane className="text-xs" /> Approved Leave
                    </span>
                  )}

                  {/* Student Details */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl transition-all duration-300 ${
                      student.status === 'present' ? 'bg-emerald-600 shadow-emerald-600/10' :
                      student.status === 'absent' ? 'bg-rose-600 shadow-rose-600/10' :
                      student.status === 'on_leave' ? 'bg-amber-600 shadow-amber-600/10' :
                      'bg-slate-800 shadow-black/20 group-hover:bg-slate-700'
                    }`}>
                      {student.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate group-hover:text-indigo-300 transition-colors">{student.name}</h3>
                      <p className="text-xs font-bold text-slate-500 tracking-wider uppercase truncate mt-0.5">{student.usn || student.student_number || 'STU_PENDING'}</p>
                    </div>
                  </div>

                  {/* Metadata (Room & Branch) */}
                  <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl mb-6 border border-white/5 text-xs">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500 mb-0.5">Location</p>
                      <p className="text-white font-bold truncate">
                        {student.room_number ? `${student.block} Block - ${student.room_number}` : 'No Room'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500 mb-0.5">Academic</p>
                      <p className="text-white font-bold truncate">
                        {student.branch ? `${student.semester} Sem ${student.branch}` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Controls */}
                  <div className="flex gap-2">
                    <ToggleButton 
                      active={student.status === 'present'} 
                      onClick={() => handleStatusChange(student.student_id, 'present')} 
                      label="Present" 
                      color="emerald" 
                      icon={<HiCheckCircle />} 
                    />
                    <ToggleButton 
                      active={student.status === 'absent'} 
                      onClick={() => handleStatusChange(student.student_id, 'absent')} 
                      label="Absent" 
                      color="rose" 
                      icon={<HiXCircle />} 
                    />
                    <ToggleButton 
                      active={student.status === 'on_leave'} 
                      onClick={() => handleStatusChange(student.student_id, 'on_leave')} 
                      label="On Leave" 
                      color="amber" 
                      icon={<HiPaperAirplane />} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

const StatBox = ({ label, value, color, highlight }) => {
  const colorMap = {
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-400 border-rose-500/20 shadow-rose-500/5',
    amber: 'from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20 shadow-amber-500/5'
  };

  return (
    <div className={`bg-gradient-to-br border backdrop-blur-xl rounded-3xl p-5 shadow-lg transition-all duration-300 flex flex-col justify-between ${colorMap[color] || colorMap.indigo}`}>
      <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-black text-white mt-2 font-mono">{value}</span>
    </div>
  );
};

const ToggleButton = ({ active, onClick, label, color, icon }) => {
  const activeColorMap = {
    emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10',
    rose: 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10',
    amber: 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10'
  };

  const hoverColorMap = {
    emerald: 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20',
    rose: 'hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20',
    amber: 'hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20'
  };

  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border text-[11px] font-bold transition-all ${
        active ? activeColorMap[color] : `bg-white/5 border-white/5 text-slate-400 ${hoverColorMap[color]}`
      }`}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
};

export default StudentAttendance;
