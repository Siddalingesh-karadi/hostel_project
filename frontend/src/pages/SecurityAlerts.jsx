import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiLightningBolt, HiLocationMarker, HiUser, HiClock } from 'react-icons/hi';

const SecurityAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/security/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading security reports...</div>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Campus Incident Reports</h1>
            <p className="text-slate-400">Real-time alerts dispatched by campus security personnel.</p>
          </div>
          <div className="flex items-center gap-4 bg-rose-600/10 border border-rose-500/20 px-4 py-2 rounded-xl">
             <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
             <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Monitoring Active</span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {alerts.length > 0 ? alerts.map(alert => (
            <div key={alert.alert_id} className={`glass-card p-8 border-l-4 ${alert.type === 'fighting' ? 'border-rose-600 bg-rose-600/5' : 'border-amber-500 bg-amber-500/5'} hover:scale-[1.01] transition-all`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${alert.type === 'fighting' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40' : 'bg-amber-500 text-white shadow-lg shadow-amber-500/40'}`}>
                    <HiLightningBolt />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{alert.title}</h3>
                    <div className="flex gap-4 mt-1">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <HiUser className="text-indigo-400" /> {alert.security_name}
                      </p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <HiClock className="text-indigo-400" /> {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                  alert.type === 'fighting' ? 'bg-rose-500 text-white border-rose-400' : 'bg-amber-500 text-white border-amber-400'
                }`}>
                  {alert.type}
                </span>
              </div>
              
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-slate-300 leading-relaxed font-medium">
                {alert.description}
              </div>

              <div className="mt-8 flex gap-4">
                <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase px-6 py-3 rounded-xl transition-all">Acknowledge</button>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all">Dispatch Support</button>
              </div>
            </div>
          )) : (
            <div className="glass-card p-20 text-center text-slate-500 italic">
              All clear. No recent security incidents reported.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityAlerts;
