import React, { useState } from 'react';
import axios from 'axios';
import { HiLightningBolt, HiCheckCircle, HiXCircle, HiSearch, HiIdentification, HiLocationMarker, HiClock } from 'react-icons/hi';

const SecurityScan = () => {
  const [leaveId, setLeaveId] = useState('');
  const [leaveData, setLeaveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setLeaveData(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/gate/verify-leave/${leaveId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Pass ID');
    } finally {
      setLoading(false);
    }
  };

  const logGateActivity = async (type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/gate/log', {
        student_id: leaveData.student_id,
        type: type,
        destination: leaveData.destination
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Student successfully ${type === 'exit' ? 'Checked Out' : 'Checked In'}`);
      setLeaveData(null);
      setLeaveId('');
    } catch (err) {
      alert('Failed to log gate activity');
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <div className="w-20 h-20 bg-rose-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <HiLightningBolt className="text-4xl text-rose-500" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Gate Verification</h1>
          <p className="text-slate-400">Scan QR or enter Leave ID to authorize exit/entry.</p>
        </header>

        <form onSubmit={handleVerify} className="relative mb-12">
          <input 
            type="text" 
            placeholder="Enter Leave ID (e.g. 5)" 
            className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] p-6 text-2xl font-black text-white pl-16 focus:border-rose-500 outline-none transition-all shadow-2xl"
            value={leaveId}
            onChange={(e) => setLeaveId(e.target.value)}
          />
          <HiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 text-3xl" />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-[1.5rem] font-black transition-all">
            Verify Pass
          </button>
        </form>

        {loading && <div className="text-center py-20 text-slate-500 animate-pulse text-xl">Verifying digital pass...</div>}

        {error && (
          <div className="glass-card p-10 text-center border-rose-500/30 border-2 animate-in zoom-in duration-300">
            <HiXCircle className="text-7xl text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Pass Invalid</h2>
            <p className="text-slate-400">{error}</p>
          </div>
        )}

        {leaveData && (
          <div className="glass-card overflow-hidden border-emerald-500/30 border-2 animate-in slide-in-from-bottom-8 duration-500">
            <div className={`p-8 ${leaveData.status === 'approved' ? 'bg-emerald-500/10' : 'bg-rose-500/10'} flex justify-between items-center border-b border-white/5`}>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
                  {leaveData.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{leaveData.name}</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-black">{leaveData.usn}</p>
                </div>
              </div>
              <div className={`px-6 py-2 rounded-full text-xs font-black uppercase border ${leaveData.status === 'approved' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'}`}>
                {leaveData.status === 'approved' ? 'Authorized' : 'Unauthorized'}
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <DetailItem icon={<HiLocationMarker />} label="Destination" value={leaveData.destination} color="text-indigo-400" />
                <DetailItem icon={<HiClock />} label="Duration" value={`${new Date(leaveData.from_date).toLocaleDateString()} - ${new Date(leaveData.to_date).toLocaleDateString()}`} color="text-amber-400" />
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Permission Note</p>
                <p className="text-slate-300 italic">"{leaveData.reason}"</p>
              </div>

              {leaveData.status === 'approved' ? (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button onClick={() => logGateActivity('exit')} className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/20 transition-all">Authorize Exit</button>
                  <button onClick={() => logGateActivity('entry')} className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 transition-all">Authorize Entry</button>
                </div>
              ) : (
                <div className="p-6 bg-rose-600/10 rounded-2xl border border-rose-500/20 text-center">
                  <p className="text-rose-500 font-black uppercase text-sm">Action Blocked: Warden Approval Required</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, color }) => (
  <div className="flex gap-4">
    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{label}</p>
      <p className="text-white font-bold">{value}</p>
    </div>
  </div>
);

export default SecurityScan;
