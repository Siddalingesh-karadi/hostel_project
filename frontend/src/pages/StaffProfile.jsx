import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiUser, HiPhone, HiLocationMarker, HiBriefcase, HiLightningBolt, HiCheckCircle, HiIdentification } from 'react-icons/hi';

const StaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', experience: '', blood_group: '', emergency_contact: ''
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/staff/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
      setFormData({
        name: response.data.data.name,
        phone: response.data.data.phone || '',
        address: response.data.data.address || '',
        experience: response.data.data.experience || '',
        blood_group: response.data.data.blood_group || '',
        emergency_contact: response.data.data.emergency_contact || ''
      });
    } catch (err) {
      console.error('Failed to fetch staff profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/staff/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading profile...</div>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-rose-500/20">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">{profile.name}</h1>
              <div className="flex gap-3">
                <span className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full text-xs font-black border border-rose-500/20 uppercase tracking-widest flex items-center gap-2">
                  <HiBriefcase /> {profile.role}
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
                  <HiCheckCircle /> Staff Verified
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </header>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="glass-card p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="Full Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
              <InputGroup label="Contact Phone" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
              <InputGroup label="Blood Group" value={formData.blood_group} onChange={(v) => setFormData({...formData, blood_group: v})} />
              <InputGroup label="Emergency Contact" value={formData.emergency_contact} onChange={(v) => setFormData({...formData, emergency_contact: v})} />
              <InputGroup label="Experience (Years)" value={formData.experience} onChange={(v) => setFormData({...formData, experience: v})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Residential Address</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 outline-none h-32"
                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-600/20 transition-all">
              Save Professional Profile
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <ProfileBlock title="Personal Information" icon={<HiUser />}>
                <div className="grid grid-cols-2 gap-8">
                  <InfoItem label="Full Name" value={profile.name} />
                  <InfoItem label="Email ID" value={profile.email} />
                  <InfoItem label="Phone Number" value={profile.phone || 'Not Provided'} />
                  <InfoItem label="Blood Group" value={profile.blood_group || 'Not Provided'} />
                </div>
              </ProfileBlock>

              <ProfileBlock title="Residential Details" icon={<HiLocationMarker />}>
                <p className="text-slate-300 leading-relaxed">{profile.address || 'No residential address recorded in the staff database.'}</p>
              </ProfileBlock>
            </div>

            <div className="space-y-8">
              <div className="glass-card p-8 border-t-4 border-rose-500 bg-gradient-to-b from-rose-500/5 to-transparent">
                <div className="flex items-center gap-3 mb-6">
                  <HiBriefcase className="text-2xl text-rose-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Employment Info</h3>
                </div>
                <div className="space-y-6">
                  <InfoItem label="Department" value={profile.role.toUpperCase()} />
                  <InfoItem label="Experience" value={profile.experience || 'Not Specified'} />
                  <InfoItem label="Staff ID" value={`SHB-${profile.user_id}`} />
                </div>
              </div>

              <div className="glass-card p-8 border-t-4 border-amber-500 bg-gradient-to-b from-amber-500/5 to-transparent">
                <div className="flex items-center gap-3 mb-6">
                  <HiLightningBolt className="text-2xl text-amber-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Emergency</h3>
                </div>
                <InfoItem label="Emergency Contact" value={profile.emergency_contact || 'None Added'} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileBlock = ({ title, icon, children }) => (
  <div className="glass-card p-8 relative overflow-hidden group">
    <div className="absolute -top-4 -right-4 p-8 text-white/[0.03] text-8xl group-hover:text-rose-500/[0.05] transition-colors">{icon}</div>
    <div className="flex items-center gap-3 mb-8">
      <div className="text-2xl text-rose-400">{icon}</div>
      <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
    <p className="text-white font-bold">{value}</p>
  </div>
);

const InputGroup = ({ label, value, onChange }) => (
  <div>
    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">{label}</label>
    <input 
      type="text" 
      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 outline-none transition-all"
      value={value} onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default StaffProfile;
