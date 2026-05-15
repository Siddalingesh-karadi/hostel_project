import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  HiUserGroup, HiOfficeBuilding, HiExclamation, HiCurrencyDollar, 
  HiOutlineSpeakerphone, HiOutlineCube, HiOutlineCalendar, HiOutlineUserGroup,
  HiLightningBolt, HiOutlineX
} from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0, occupancy: '0/0', pendingComplaints: 0, unpaidFees: 0
  });
  const [broadcasts, setBroadcasts] = useState([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [profile, setProfile] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [showRoommatesModal, setShowRoommatesModal] = useState(false);
  const [feeStatus, setFeeStatus] = useState({ status: 'Pending', color: 'text-amber-400' });
  const [leaveStatus, setLeaveStatus] = useState('At Hostel');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [myFeeDetails, setMyFeeDetails] = useState(null);
  const [myLeaveDetails, setMyLeaveDetails] = useState(null);



  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const fetchBroadcasts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/broadcasts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBroadcasts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch broadcasts');
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    if (user.role === 'admin' || user.role === 'warden') {
      const fetchStats = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('/api/analytics/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStats(response.data.data);
        } catch (err) {
          console.error('Failed to fetch stats');
        }
      };
      fetchStats();
    } else if (user.role === 'student') {
      const fetchStudentData = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };
          
          // Fetch Profile (for Room info)
          const profRes = await axios.get('/api/students/me', { headers });
          setProfile(profRes.data.data);

          // Fetch Roommates
          const roomRes = await axios.get('/api/rooms/my-roommates', { headers });
          setRoommates(roomRes.data.data);

          // Fetch Fee Status
          const feeRes = await axios.get('/api/fees/my', { headers });
          const fees = feeRes.data.data;
          if (fees.length > 0) {
            const latestFee = fees[0];
            setMyFeeDetails(latestFee);
            if (latestFee.status === 'paid') {
              setFeeStatus({ status: 'Paid', color: 'text-emerald-400' });
            } else {
              setFeeStatus({ status: 'Pending', color: 'text-amber-400' });
            }
          }

          // Fetch Leave Status
          const leaveRes = await axios.get('/api/leaves/my', { headers });
          const activeLeave = leaveRes.data.data.find(l => l.status === 'approved');
          setMyLeaveDetails(activeLeave || leaveRes.data.data[0]);
          if (activeLeave) setLeaveStatus('On Leave');

        } catch (err) {
          console.error('Failed to fetch student data');
        }
      };
      fetchStudentData();
    }
  }, [user.role]);


  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/broadcasts', { message: broadcastMsg, type: 'emergency' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowBroadcastModal(false);
      setBroadcastMsg('');
      fetchBroadcasts();
    } catch (err) {
      alert('Failed to send broadcast');
    }
  };

  const deactivateBroadcast = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/broadcasts/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBroadcasts();
    } catch (err) {
      alert('Failed to dismiss alert');
    }
  };

  // Admin/Warden Dashboard View
  if (user.role === 'admin' || user.role === 'warden') {
    return (
      <div className="p-8 bg-slate-950 min-h-screen">
        {/* Emergency Banner */}
        {broadcasts.length > 0 && broadcasts.map(b => (
          <div key={b.id} className="mb-6 bg-rose-600/20 border border-rose-500/50 p-4 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-4 text-rose-500">
              <HiLightningBolt className="text-2xl" />
              <p className="font-bold tracking-wide">EMERGENCY: {b.message}</p>
            </div>
            <button onClick={() => deactivateBroadcast(b.id)} className="text-rose-500 hover:text-white p-2">
              <HiOutlineX />
            </button>
          </div>
        ))}

        <h1 className="text-3xl font-bold text-white mb-2 text-glow">Hostel Overview</h1>
        <p className="text-slate-400 mb-10">Welcome back, {user.name}. Here is what's happening today.</p>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role === 'admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          <StatCard title="Total Students" value={stats.totalStudents} icon={<HiUserGroup />} color="bg-indigo-500" onClick={() => navigate('/students')} />
          <StatCard title="Total Rooms" value={stats.totalRooms || 0} icon={<HiOfficeBuilding />} color="bg-cyan-500" onClick={() => navigate('/rooms')} />

          <StatCard title="Occupancy" value={stats.occupancy} icon={<HiOfficeBuilding />} color="bg-emerald-500" onClick={() => navigate('/rooms')} />
          <StatCard title="Pending" value={stats.pendingComplaints} icon={<HiExclamation />} color="bg-rose-500" onClick={() => navigate('/complaints')} />
          {user.role === 'admin' && (
            <StatCard title="Unpaid Fees" value={`$${stats.unpaidFees}`} icon={<HiCurrencyDollar />} color="bg-amber-500" onClick={() => navigate('/fees')} />
          )}
        </div>

        {/* Security Deployment Map (Text Based) */}
        {user.role === 'admin' && (
          <div className="mt-10 glass-card p-8">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <HiShieldCheck className="text-emerald-500" /> Active Security Deployment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.securityLocations?.length > 0 ? stats.securityLocations.map((loc, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-1">{loc.location}</p>
                  <p className="text-white font-bold text-sm">{loc.name}</p>
                </div>
              )) : (
                <p className="text-slate-500 italic col-span-full">No security personnel assigned for today.</p>
              )}
            </div>
          </div>
        )}


        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard title="Hostel Notices" subtitle="Announcements" icon={<HiOutlineSpeakerphone />} onClick={() => navigate('/notices')} color="border-indigo-500" />
          <FeatureCard title="Mess Menu" subtitle="Weekly Schedule" icon={<HiOutlineCalendar />} onClick={() => navigate('/mess-menu')} color="border-amber-500" />
          <FeatureCard title="Trigger Alert" subtitle="Emergency Broadcast" icon={<HiLightningBolt />} onClick={() => setShowBroadcastModal(true)} color="border-rose-600 bg-rose-600/5" />
          
          {user.role === 'admin' && (
            <>
              <FeatureCard title="Inventory" subtitle="Store Room" icon={<HiOutlineCube />} onClick={() => navigate('/inventory')} color="border-emerald-500" />
              <FeatureCard title="Community" subtitle="Staff & Students" icon={<HiOutlineUserGroup />} onClick={() => navigate('/staff')} color="border-rose-500" />
            </>
          )}
        </div>

        {/* Broadcast Modal */}
        {showBroadcastModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 border-rose-500/30 border-2">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <HiLightningBolt className="text-rose-500" /> Trigger Emergency
              </h2>
              <p className="text-slate-500 text-sm mb-6 uppercase tracking-widest font-black">Immediate Broadcast to all students</p>
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <textarea 
                  required placeholder="Type your emergency message here..." rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-rose-500 outline-none transition-all"
                  value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)}
                />
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold p-3 rounded-xl shadow-lg shadow-rose-600/20 transition-all">Send Alert</button>
                  <button type="button" onClick={() => setShowBroadcastModal(false)} className="flex-1 bg-white/5 text-slate-300 font-bold p-3 rounded-xl">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Student Dashboard View
  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      {/* Emergency Banner for Students */}
      {broadcasts.length > 0 && (
        <div className="mb-10 p-6 bg-rose-600 rounded-2xl flex items-center gap-6 shadow-2xl shadow-rose-600/40 animate-bounce">
          <div className="p-4 bg-white/20 rounded-xl text-white text-3xl">
            <HiLightningBolt />
          </div>
          <div>
            <h2 className="text-white font-black uppercase tracking-widest text-sm mb-1">Emergency Alert</h2>
            <p className="text-2xl font-bold text-white">{broadcasts[0].message}</p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-white mb-2">Welcome Home, {user.name}</h1>
      <p className="text-slate-400 mb-10">Your hostel portal and personal details.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div 
          onClick={() => setShowRoommatesModal(true)}
          className="glass-card p-8 border-t-4 border-indigo-500 cursor-pointer hover:bg-white/5 transition-all"
        >
          <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-4">Your Room</h3>
          <p className="text-3xl font-bold text-white">
            {profile?.room_number ? `${profile.block} - ${profile.room_number}` : 'Not Allocated'}
          </p>
          <p className="text-slate-500 text-sm mt-2">
            {roommates.length > 0 ? `Shared with ${roommates.length} others` : 'Single Occupancy / Not assigned'}
          </p>
        </div>
        <div 
          onClick={() => setShowFeeModal(true)}
          className="glass-card p-8 border-t-4 border-emerald-500 cursor-pointer hover:bg-white/5 transition-all"
        >
          <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-4">Fee Status</h3>
          <p className={`text-3xl font-bold ${feeStatus.color}`}>{feeStatus.status}</p>
          <p className="text-slate-500 text-sm mt-2">
            {feeStatus.status === 'Paid' ? 'No outstanding dues' : 'View balance details'}
          </p>
        </div>
        <div 
          onClick={() => setShowLeaveModal(true)}
          className="glass-card p-8 border-t-4 border-amber-500 cursor-pointer hover:bg-white/5 transition-all"
        >
          <h3 className="text-slate-400 uppercase text-xs font-black tracking-widest mb-4">Leave Status</h3>
          <p className="text-3xl font-bold text-white">{leaveStatus}</p>
          <p className="text-slate-500 text-sm mt-2">Check absence details</p>
        </div>

      </div>

      {/* Roommates Modal */}
      {showRoommatesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-8 border-indigo-500/30 border-2">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <HiOutlineUserGroup className="text-indigo-500" /> Roommates Details
            </h2>
            <div className="space-y-4">
              {roommates.length > 0 ? roommates.map((mate, idx) => (
                <div key={mate.student_id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white font-bold">{mate.name}</p>
                  <p className="text-slate-400 text-sm">{mate.branch} - {mate.course}</p>
                  <p className="text-slate-500 text-xs mt-1">📞 {mate.phone}</p>
                </div>
              )) : (
                <p className="text-slate-400 italic">No roommates found for this room.</p>
              )}
            </div>
            <button 
              onClick={() => setShowRoommatesModal(false)}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Fee Details Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8 border-emerald-500/30 border-2">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <HiCurrencyDollar className="text-emerald-500" /> Fee Details
            </h2>
            {myFeeDetails ? (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-slate-500 uppercase font-black mb-1">Status</p>
                  <p className={`text-xl font-bold ${myFeeDetails.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {myFeeDetails.status.toUpperCase()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-slate-500 uppercase font-black mb-1">Paid On</p>
                    <p className="text-white font-bold">{myFeeDetails.payment_date ? new Date(myFeeDetails.payment_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-slate-500 uppercase font-black mb-1">Balance</p>
                    <p className="text-rose-400 font-bold">${(myFeeDetails.amount - (myFeeDetails.paid_amount || 0)).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No fee records found.</p>
            )}
            <button onClick={() => setShowFeeModal(false)} className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-xl transition-all">Close</button>
          </div>
        </div>
      )}

      {/* Leave Details Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8 border-amber-500/30 border-2">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <HiOutlineCalendar className="text-amber-500" /> Absence Details
            </h2>
            {myLeaveDetails ? (
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                  <p className="text-xs text-slate-500 uppercase font-black mb-1">Total Days Absent</p>
                  <p className="text-4xl font-black text-white">
                    {Math.ceil((new Date(myLeaveDetails.to_date) - new Date(myLeaveDetails.from_date)) / (1000 * 60 * 60 * 24)) + 1} Days
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-slate-500 uppercase font-black mb-1">Leave Period</p>
                  <p className="text-white font-bold">
                    {new Date(myLeaveDetails.from_date).toLocaleDateString()} - {new Date(myLeaveDetails.to_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-[10px] text-emerald-400 font-black uppercase">Current Status: {myLeaveDetails.status}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No leave records found.</p>
            )}
            <button onClick={() => setShowLeaveModal(false)} className="mt-8 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold p-3 rounded-xl transition-all">Close</button>
          </div>
        </div>
      )}


      <h3 className="text-white font-bold mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          title="Notices" subtitle="View Announcements" icon={<HiOutlineSpeakerphone />} 
          onClick={() => navigate('/notices')} color="border-indigo-500"
        />
        <FeatureCard 
          title="Mess Menu" subtitle="Today's Meals" icon={<HiOutlineCalendar />} 
          onClick={() => navigate('/mess-menu')} color="border-amber-500"
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ title, subtitle, icon, onClick, color }) => (
  <div 
    onClick={onClick}
    className={`glass-card p-6 cursor-pointer hover:border-slate-700 transition-all border-l-4 ${color}`}
  >
    <div className="text-2xl text-white mb-2">{icon}</div>
    <h4 className="text-lg font-bold text-white">{title}</h4>
    <p className="text-slate-500 text-sm">{subtitle}</p>
  </div>
);

const StatCard = ({ title, value, icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className="glass-card p-6 flex items-center gap-6 cursor-pointer hover:scale-[1.03] active:scale-95 transition-all duration-300 group"
  >
    <div className={`p-4 rounded-2xl ${color} text-white text-2xl shadow-lg group-hover:shadow-indigo-500/20`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export default Dashboard;
