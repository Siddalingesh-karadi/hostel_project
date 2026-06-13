import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCheckCircle, HiXCircle, HiCalendar, HiChartBar } from 'react-icons/hi';

const ParentAttendance = () => {
  const [data, setData] = useState({ history: [], monthlyStats: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/parents/attendance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Calculate overall stats
  const totalPresent = data.history.filter(h => h.status === 'present').length;
  const totalAbsent = data.history.filter(h => h.status === 'absent').length;
  const totalLeave = data.history.filter(h => h.status === 'on_leave').length;
  const totalDays = totalPresent + totalAbsent + totalLeave;
  const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

  // Group monthly stats for display
  const monthlyMap = {};
  data.monthlyStats.forEach(row => {
    if (!monthlyMap[row.month]) monthlyMap[row.month] = { present: 0, absent: 0, on_leave: 0 };
    monthlyMap[row.month][row.status] = row.count;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-black text-white mb-2">
          <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Attendance Report</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">Detailed attendance history for your child.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Days" value={totalDays} color="indigo" />
          <StatBox label="Present" value={totalPresent} color="emerald" />
          <StatBox label="Absent" value={totalAbsent} color="rose" />
          <StatBox label="Attendance %" value={`${percentage}%`} color="cyan" />
        </div>

        {/* Monthly Breakdown */}
        {Object.keys(monthlyMap).length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <HiChartBar className="text-indigo-500" /> Monthly Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(monthlyMap).map(([month, stats]) => {
                const total = stats.present + stats.absent + stats.on_leave;
                const pct = total > 0 ? Math.round((stats.present / total) * 100) : 0;
                return (
                  <div key={month} className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-bold text-sm">{month}</span>
                      <span className={`font-bold text-sm ${pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-4 mt-2 text-[10px] font-bold text-slate-500">
                      <span>Present: {stats.present}</span>
                      <span>Absent: {stats.absent}</span>
                      <span>Leave: {stats.on_leave}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily History */}
        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <HiCalendar className="text-indigo-500" /> Day-by-Day History
          </h3>
          {data.history.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {data.history.map((log, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div>
                    <p className="text-white text-sm font-bold">
                      {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      Marked by: {log.marked_by_name || 'System'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                    log.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    log.status === 'absent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic py-8 text-center">No attendance records found.</p>
          )}
        </div>

      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }) => {
  const colorMap = {
    indigo: 'from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    rose: 'from-rose-500/10 to-rose-500/5 text-rose-400 border-rose-500/20',
    cyan: 'from-cyan-500/10 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
  };
  return (
    <div className={`bg-gradient-to-br border rounded-3xl p-5 ${colorMap[color]}`}>
      <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">{label}</span>
      <span className="block text-2xl font-black text-white mt-2">{value}</span>
    </div>
  );
};

export default ParentAttendance;
