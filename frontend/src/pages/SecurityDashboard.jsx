import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiShieldCheck, HiLightningBolt, HiLocationMarker, HiClock } from 'react-icons/hi';

const SecurityDashboard = () => {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', description: '', type: 'other' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/security/assignment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignment(response.data.data);
    } catch (err) {
      console.error('Failed to fetch assignment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendAlert = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/security/alerts', alertData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAlertModal(false);
      setAlertData({ title: '', description: '', type: 'other' });
      alert('Security alert dispatched to Administrator!');
    } catch (err) {
      alert('Failed to send alert');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading duty roster...</div>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Security Hub</h1>
            <p className="text-slate-400">Campus safety and monitoring portal.</p>
          </div>
          <button 
            onClick={() => setShowAlertModal(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
          >
            <HiLightningBolt /> Trigger Incident Alert
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="glass-card p-8 border-t-4 border-indigo-500">
            <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-6 flex items-center gap-2">
              <HiLocationMarker className="text-indigo-400 text-lg" /> Current Deployment
            </h3>
            {assignment ? (
              <div className="space-y-4">
                <p className="text-4xl font-black text-white">{assignment.location}</p>
                <div className="flex gap-4">
                  <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-indigo-500/20">
                    Shift: {assignment.shift}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-500/20">
                    Status: On Duty
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">No duty assigned for today yet. Please check with warden.</p>
            )}
          </div>

          <div className="glass-card p-8 border-t-4 border-emerald-500">
            <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-6 flex items-center gap-2">
              <HiClock className="text-emerald-400 text-lg" /> Duty Duration
            </h3>
            <p className="text-3xl font-black text-white">08:00 Hours</p>
            <p className="text-slate-500 text-sm mt-2">Standard security shift rotation.</p>
          </div>
        </div>

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 border-rose-500/30 border-2">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 text-rose-500">
                <HiLightningBolt /> Report Incident
              </h2>
              <form onSubmit={handleSendAlert} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Incident Type</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none"
                    value={alertData.type} onChange={(e) => setAlertData({...alertData, type: e.target.value})}
                  >
                    <option value="fighting">Physical Altercation / Fighting</option>
                    <option value="vehicle">Unauthorized Vehicle</option>
                    <option value="other">Other Security Concern</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Short Title</label>
                  <input 
                    type="text" required placeholder="e.g., Mob near Main Gate"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    value={alertData.title} onChange={(e) => setAlertData({...alertData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Incident Details</label>
                  <textarea 
                    required placeholder="Describe what happened..." rows="4"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    value={alertData.description} onChange={(e) => setAlertData({...alertData, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold p-3 rounded-xl transition-all">Broadcast Alert</button>
                  <button type="button" onClick={() => setShowAlertModal(false)} className="flex-1 bg-white/5 text-slate-300 font-bold p-3 rounded-xl">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;
