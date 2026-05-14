import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineCalendar, HiOutlinePencil } from 'react-icons/hi';

const MessMenu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState(null);
  const [formData, setFormData] = useState({ tiffin: '', lunch: '', snacks: '', dinner: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/mess-menu', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenu(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch menu');
      setLoading(false);
    }
  };

  const handleEdit = (day) => {
    setEditingDay(day);
    setFormData({
      tiffin: day.tiffin,
      lunch: day.lunch,
      snacks: day.snacks,
      dinner: day.dinner
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/mess-menu/${editingDay.day_name}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingDay(null);
      fetchMenu();
    } catch (err) {
      alert('Failed to update menu');
    }
  };

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 text-glow">Mess Weekly Menu</h1>
        <p className="text-slate-400">View and manage daily meal schedules.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading menu...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menu.map(day => (
            <div key={day.id} className="glass-card overflow-hidden group">
              <div className="bg-indigo-600/20 px-6 py-4 flex justify-between items-center border-b border-indigo-500/20">
                <span className="text-xl font-bold text-white flex items-center gap-2">
                  <HiOutlineCalendar className="text-indigo-400" /> {day.day_name}
                </span>
                {user.role === 'admin' && (
                  <button 
                    onClick={() => handleEdit(day)}
                    className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <HiOutlinePencil />
                  </button>
                )}
              </div>
              <div className="p-6 space-y-4">
                <MenuSection title="Tiffin" items={day.tiffin} color="text-amber-400" />
                <MenuSection title="Lunch" items={day.lunch} color="text-emerald-400" />
                <MenuSection title="Snacks" items={day.snacks} color="text-orange-400" />
                <MenuSection title="Dinner" items={day.dinner} color="text-indigo-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingDay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Update Menu: {editingDay.day_name}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputGroup label="Tiffin" value={formData.tiffin} onChange={(val) => setFormData({...formData, tiffin: val})} />
              <InputGroup label="Lunch" value={formData.lunch} onChange={(val) => setFormData({...formData, lunch: val})} />
              <InputGroup label="Snacks" value={formData.snacks} onChange={(val) => setFormData({...formData, snacks: val})} />
              <InputGroup label="Dinner" value={formData.dinner} onChange={(val) => setFormData({...formData, dinner: val})} />
              
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setEditingDay(null)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20">Update Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuSection = ({ title, items, color }) => (
  <div>
    <h4 className={`text-xs uppercase font-black tracking-widest ${color} mb-1`}>{title}</h4>
    <p className="text-slate-300 text-sm leading-relaxed">{items}</p>
  </div>
);

const InputGroup = ({ label, value, onChange }) => (
  <div>
    <label className="block text-slate-400 text-sm font-bold mb-1">{label}</label>
    <input 
      type="text" 
      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g., Poha, Coffee"
    />
  </div>
);

export default MessMenu;
