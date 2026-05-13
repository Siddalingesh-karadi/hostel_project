import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiUser, HiAcademicCap, HiPhone, HiLocationMarker, HiIdentification, HiShieldCheck } from 'react-icons/hi';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/students/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data.data);
      } catch (err) {
        console.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-white">Profile not found. Please contact admin.</div>;

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/20">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-2">{profile.name}</h1>
            <div className="flex gap-3">
              <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/20 uppercase tracking-widest">
                {profile.student_number || 'STU-PENDING'}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 uppercase tracking-widest">
                Active Student
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <ProfileSection title="Personal Information" icon={<HiUser />}>
              <div className="grid grid-cols-2 gap-6">
                <InfoItem label="Full Name" value={profile.name} />
                <InfoItem label="Email Address" value={profile.email} />
                <InfoItem label="Phone Number" value={profile.phone || 'Not Provided'} />
                <InfoItem label="Age" value={profile.age || 'N/A'} />
                <InfoItem label="Aadhar Number" value={profile.aadhar_number || 'N/A'} />
                <InfoItem label="Blood Group" value={profile.blood_group || 'N/A'} />
              </div>
            </ProfileSection>

            <ProfileSection title="Parent / Guardian Details" icon={<HiShieldCheck />}>
              <div className="grid grid-cols-2 gap-6">
                <InfoItem label="Guardian Name" value={profile.parent_name || 'Not Provided'} />
                <InfoItem label="Guardian Contact" value={profile.parent_phone || 'Not Provided'} />
              </div>
            </ProfileSection>

            <ProfileSection title="Address Details" icon={<HiLocationMarker />}>
              <div className="space-y-6">
                <InfoItem label="Current/Local Address" value={profile.address || 'No local address provided'} />
                <InfoItem label="Permanent Home Address" value={profile.permanent_address || 'No permanent address provided'} />
              </div>
            </ProfileSection>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="glass-card p-8 border-t-4 border-indigo-500 bg-gradient-to-b from-indigo-500/5 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <HiAcademicCap className="text-2xl text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Academic Status</h3>
              </div>
              <div className="space-y-4">
                <InfoItem label="Course" value={profile.course} />
                <InfoItem label="Branch" value={profile.branch} />
                <InfoItem label="Current Year" value={`${profile.year} Year`} />
              </div>
            </div>

            <div className="glass-card p-8 border-t-4 border-emerald-500 bg-gradient-to-b from-emerald-500/5 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <HiLocationMarker className="text-2xl text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Room Allocation</h3>
              </div>
              {profile.room_number ? (
                <div>
                  <p className="text-3xl font-black text-white mb-1">Room {profile.room_number}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{profile.block} Block</p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Pending Allocation</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSection = ({ title, icon, children }) => (
  <div className="glass-card p-8 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-8 text-white/5 text-6xl">{icon}</div>
    <div className="flex items-center gap-3 mb-8">
      <div className="text-xl text-indigo-400">{icon}</div>
      <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
    <p className="text-white font-medium break-words">{value}</p>
  </div>
);

export default Profile;
