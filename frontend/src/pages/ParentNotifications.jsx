import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiBell, HiCheckCircle, HiCurrencyRupee, HiClipboardList, HiExclamation, HiOutlineSpeakerphone } from 'react-icons/hi';

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/parents/notifications', { headers });
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/parents/notifications/${id}/read`, {}, { headers });
      setNotifications(prev => prev.map(n =>
        n.notification_id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'attendance': return <HiCheckCircle className="text-emerald-400" />;
      case 'fee': return <HiCurrencyRupee className="text-amber-400" />;
      case 'leave': return <HiClipboardList className="text-indigo-400" />;
      case 'complaint': return <HiExclamation className="text-rose-400" />;
      case 'notice': return <HiOutlineSpeakerphone className="text-cyan-400" />;
      default: return <HiBell className="text-slate-400" />;
    }
  };

  const typeColor = (type) => {
    switch (type) {
      case 'attendance': return 'border-emerald-500/20';
      case 'fee': return 'border-amber-500/20';
      case 'leave': return 'border-indigo-500/20';
      case 'complaint': return 'border-rose-500/20';
      case 'notice': return 'border-cyan-500/20';
      default: return 'border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Notifications</span>
            </h1>
            <p className="text-slate-400 text-sm">Stay updated on your child's hostel activities.</p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-rose-500/10 text-rose-400 text-xs font-black px-3 py-1.5 rounded-full border border-rose-500/20">
              {unreadCount} Unread
            </span>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.notification_id}
                onClick={() => !n.is_read && markAsRead(n.notification_id)}
                className={`glass-card p-5 border-l-4 cursor-pointer transition-all hover:bg-white/[0.03] ${typeColor(n.type)} ${
                  !n.is_read ? 'bg-white/[0.02]' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/5 rounded-xl text-xl mt-0.5">
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold text-sm">{n.title}</h3>
                      {!n.is_read && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{n.message}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card py-20 text-center">
            <HiBell className="text-6xl text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-lg">No Notifications Yet</p>
            <p className="text-slate-500 text-sm mt-2">You'll receive alerts about attendance, fees, and more here.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ParentNotifications;
