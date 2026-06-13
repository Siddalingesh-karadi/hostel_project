import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import {
  HiQrcode, HiPlus, HiClock, HiUserGroup, HiCheckCircle, HiXCircle,
  HiOutlineX, HiRefresh, HiEye, HiStop, HiSparkles, HiChartBar
} from 'react-icons/hi';

const QrAttendanceAdmin = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(null);
  const [showReportModal, setShowReportModal] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [viewTab, setViewTab] = useState('active'); // 'active' | 'history'
  const intervalRef = useRef(null);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    try {
      const res = await axios.get('/api/qr-attendance/sessions', { headers });
      setActiveSessions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch active sessions');
    }
  };

  // Fetch session history
  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/qr-attendance/sessions/history', { headers });
      setSessionHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch session history');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchActiveSessions(), fetchHistory()]);
      setLoading(false);
    };
    loadData();

    // Auto-refresh active sessions every 10 seconds
    intervalRef.current = setInterval(fetchActiveSessions, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Create a new session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/qr-attendance/sessions', { title, duration_minutes: duration }, { headers });
      setShowCreateModal(false);
      setTitle('');
      setDuration(10);
      setMessage({ text: 'QR Attendance session created!', type: 'success' });
      fetchActiveSessions();
      fetchHistory();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to create session', type: 'error' });
    }
  };

  // Close a session
  const handleCloseSession = async (sessionId) => {
    try {
      await axios.put(`/api/qr-attendance/sessions/${sessionId}/close`, {}, { headers });
      setMessage({ text: 'Session closed.', type: 'success' });
      fetchActiveSessions();
      fetchHistory();
    } catch (err) {
      setMessage({ text: 'Failed to close session', type: 'error' });
    }
  };

  // Fetch session report
  const handleViewReport = async (sessionId) => {
    try {
      const res = await axios.get(`/api/qr-attendance/sessions/${sessionId}/report`, { headers });
      setReportData(res.data.data);
      setShowReportModal(sessionId);
    } catch (err) {
      setMessage({ text: 'Failed to load report', type: 'error' });
    }
  };

  // Countdown timer component
  const CountdownTimer = ({ expiresAt }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const tick = () => {
        const diff = new Date(expiresAt) - new Date();
        if (diff <= 0) { setTimeLeft('Expired'); return; }
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs}s`);
      };
      tick();
      const timer = setInterval(tick, 1000);
      return () => clearInterval(timer);
    }, [expiresAt]);

    return (
      <span className={`font-mono font-black ${timeLeft === 'Expired' ? 'text-rose-400' : 'text-emerald-400'}`}>
        {timeLeft}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">QR Attendance</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                <HiSparkles className="animate-pulse" /> Session Manager
              </span>
            </h1>
            <p className="text-slate-400 text-sm">Generate QR codes for students to scan and mark attendance instantly.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-sm font-black tracking-wide shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <HiPlus className="text-lg" /> New QR Session
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

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setViewTab('active')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              viewTab === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <HiQrcode className="inline mr-2" />Active Sessions ({activeSessions.length})
          </button>
          <button
            onClick={() => setViewTab('history')}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              viewTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <HiChartBar className="inline mr-2" />Session History
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : viewTab === 'active' ? (
          /* Active Sessions Grid */
          activeSessions.length === 0 ? (
            <div className="bg-slate-900/20 border border-white/5 rounded-3xl py-20 text-center text-slate-400">
              <HiQrcode className="text-6xl mx-auto mb-4 text-slate-600" />
              <p className="text-lg font-bold">No Active Sessions</p>
              <p className="text-sm text-slate-500 mt-1">Create a new QR session for students to scan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map(session => (
                <div key={session.session_id} className="glass-card p-6 border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg truncate">{session.title}</h3>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase px-2 py-1 rounded-full border border-emerald-500/20">
                      Live
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-black uppercase text-slate-500">Time Left</p>
                      <CountdownTimer expiresAt={session.expires_at} />
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-black uppercase text-slate-500">Scanned</p>
                      <p className="text-xl font-black text-indigo-400">{session.marked_count}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowQrModal(session)}
                      className="flex-1 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <HiEye /> Show QR
                    </button>
                    <button
                      onClick={() => handleViewReport(session.session_id)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <HiChartBar /> Report
                    </button>
                    <button
                      onClick={() => handleCloseSession(session.session_id)}
                      className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all"
                    >
                      <HiStop />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Session History Table */
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Title</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Created By</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Date</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Present</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                    <th className="text-left p-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.map(session => (
                    <tr key={session.session_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-white font-bold text-sm">{session.title}</td>
                      <td className="p-4 text-slate-400 text-sm">{session.created_by_name}</td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(session.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="text-indigo-400 font-bold">{session.marked_count}</span>
                        <span className="text-slate-500">/{session.total_students}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${
                          session.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          session.status === 'expired' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewReport(session.session_id)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1"
                        >
                          <HiEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sessionHistory.length === 0 && (
                <p className="text-center py-12 text-slate-500 italic">No sessions recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ===== Create Session Modal ===== */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 border-indigo-500/30 border-2">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <HiQrcode className="text-indigo-500" /> Create QR Session
              </h2>
              <p className="text-slate-500 text-sm mb-6 uppercase tracking-widest font-black">Students will scan this QR to mark attendance</p>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">Session Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Morning Roll Call"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-2">QR Expiry Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value={5} className="bg-slate-900">5 Minutes</option>
                    <option value={10} className="bg-slate-900">10 Minutes</option>
                    <option value={15} className="bg-slate-900">15 Minutes</option>
                    <option value={30} className="bg-slate-900">30 Minutes</option>
                    <option value={60} className="bg-slate-900">60 Minutes</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
                    Generate QR
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-white/5 text-slate-300 font-bold p-3 rounded-xl">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== QR Display Modal ===== */}
        {showQrModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-lg p-8 border-indigo-500/30 border-2 text-center">
              <button onClick={() => setShowQrModal(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-2xl">
                <HiOutlineX />
              </button>
              <h2 className="text-2xl font-black text-white mb-1">{showQrModal.title}</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-black mb-6">Scan to mark attendance</p>

              <div className="bg-white rounded-3xl p-6 inline-block mb-6 shadow-2xl">
                <QRCodeSVG
                  value={showQrModal.session_token}
                  size={280}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Time Remaining</p>
                  <CountdownTimer expiresAt={showQrModal.expires_at} />
                </div>
                <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Scanned</p>
                  <p className="text-xl font-black text-indigo-400">{showQrModal.marked_count}</p>
                </div>
              </div>

              <button
                onClick={() => { setShowQrModal(null); fetchActiveSessions(); }}
                className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold rounded-2xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ===== Report Modal ===== */}
        {showReportModal && reportData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f0f13] border-2 border-indigo-500/30 w-full max-w-2xl rounded-[2.5rem] p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white">{reportData.session.title}</h2>
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">
                    {new Date(reportData.session.created_at).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => setShowReportModal(null)} className="text-slate-500 hover:text-white text-2xl">
                  <HiOutlineX />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase font-black text-slate-500">Total</p>
                  <p className="text-2xl font-bold text-white mt-1">{reportData.total_students}</p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase font-black text-slate-500">Present</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{reportData.present_count}</p>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase font-black text-slate-500">Absent</p>
                  <p className="text-2xl font-bold text-rose-400 mt-1">{reportData.absent_count}</p>
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 text-center">
                  <p className="text-[10px] uppercase font-black text-slate-500">Rate</p>
                  <p className="text-2xl font-bold text-indigo-400 mt-1">{reportData.percentage}%</p>
                </div>
              </div>

              {/* Present Students */}
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full"></span> Present Students
              </h4>
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                {reportData.present.length > 0 ? reportData.present.map(s => (
                  <div key={s.student_id} className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-bold">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{s.usn || s.student_number} • {s.branch}</p>
                    </div>
                    <p className="text-emerald-400 text-[10px] font-bold">{new Date(s.marked_at).toLocaleTimeString()}</p>
                  </div>
                )) : <p className="text-slate-500 text-xs italic">No students marked present.</p>}
              </div>

              {/* Absent Students */}
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-3.5 bg-rose-500 rounded-full"></span> Absent Students
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reportData.absent.length > 0 ? reportData.absent.map(s => (
                  <div key={s.student_id} className="flex justify-between items-center bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-bold">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{s.usn || s.student_number} • {s.branch}</p>
                    </div>
                    <span className="text-rose-400 text-[9px] font-black uppercase bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">Absent</span>
                  </div>
                )) : <p className="text-slate-500 text-xs italic">All students are present!</p>}
              </div>

              <button onClick={() => setShowReportModal(null)} className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold rounded-2xl transition-all">
                Close Report
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QrAttendanceAdmin;
