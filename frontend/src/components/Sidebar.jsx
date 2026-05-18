import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HiHome, HiUserGroup, HiOfficeBuilding, HiExclamation, 
  HiCurrencyRupee, HiLogout, HiClipboardList, 
  HiOutlineSpeakerphone, HiOutlineCube, HiOutlineCalendar, HiOutlineUserGroup,
  HiShieldCheck, HiChatAlt2, HiLightningBolt
} from 'react-icons/hi';


const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/api/messages/unread-count', { headers: { Authorization: `Bearer ${token}` } });
        setUnreadCount(res.data.count);
      } catch (err) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <HiHome />, roles: ['admin', 'warden', 'student', 'security'] },

    { name: 'My Profile', path: '/profile', icon: <HiUserGroup />, roles: ['student'] },
    { name: 'Work Profile', path: '/staff-profile', icon: <HiUserGroup />, roles: ['admin', 'warden', 'security'] },
    { name: 'Hostel Network', path: '/network', icon: <HiOutlineUserGroup />, roles: ['student', 'warden'] },
    { name: 'Gate Pass', path: '/security-scan', icon: <HiLightningBolt />, roles: ['security'] },
    { name: 'Notices', path: '/notices', icon: <HiOutlineSpeakerphone />, roles: ['admin', 'warden', 'student'] },
    { name: 'Mess Menu', path: '/mess-menu', icon: <HiOutlineCalendar />, roles: ['admin', 'warden', 'student'] },
    { name: 'Inventory', path: '/inventory', icon: <HiOutlineCube />, roles: ['admin', 'warden'] },
    { name: 'Community', path: '/staff', icon: <HiOutlineUserGroup />, roles: ['admin'] },
    { name: 'Students', path: '/students', icon: <HiUserGroup />, roles: ['admin', 'warden'] },
    { name: 'Attendance', path: '/attendance', icon: <HiClipboardList />, roles: ['admin', 'warden'] },
    { name: 'Rooms', path: '/rooms', icon: <HiOfficeBuilding />, roles: ['admin', 'warden'] },
    { name: 'Complaints', path: '/complaints', icon: <HiExclamation />, roles: ['admin', 'student', 'warden'] },
    { name: 'Fees', path: '/fees', icon: <HiCurrencyRupee />, roles: ['admin', 'student', 'warden'] },
    { name: 'Leave', path: '/leaves', icon: <HiClipboardList />, roles: ['admin', 'student', 'warden'] },

    { name: 'Duty Roster', path: '/security', icon: <HiShieldCheck />, roles: ['security'] },

    { name: 'Messages', path: '/admin-messages', icon: <HiChatAlt2 />, roles: ['admin', 'warden', 'student'] },
  ];


  return (
    <div className="w-64 min-h-screen bg-slate-900 border-r border-white/5 flex flex-col p-6">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          HostelHub
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mt-1">Smart Management</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
            `}
            onClick={() => {
              if (item.name === 'Messages') {
                setUnreadCount(0);
              }
            }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-sm flex-1">{item.name}</span>
            {item.name === 'Messages' && unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/20">
                {unreadCount} New
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user.role}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <HiLogout className="text-xl" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
