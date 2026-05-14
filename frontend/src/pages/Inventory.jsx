import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineCube, HiOutlineTrash, HiOutlinePlus, HiOutlinePencilAlt } from 'react-icons/hi';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', quantity: 0, description: '' });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch inventory');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/inventory', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ name: '', quantity: 0, description: '' });
      fetchInventory();
    } catch (err) {
      alert('Failed to update inventory');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item from inventory?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInventory();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  if (user.role !== 'admin') {
    return <div className="p-8 text-white">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 text-glow">Store Room Inventory</h1>
          <p className="text-slate-400">Track equipment like bulbs, fans, taps, and other necessary items.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setFormData({ name: '', quantity: 0, description: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <HiOutlinePlus className="text-xl" /> Add Item
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading inventory...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="glass-card p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <HiOutlineCube className="text-2xl" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setFormData(item); setShowModal(true); }}
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      <HiOutlinePencilAlt />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{item.description || 'No description provided.'}</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Quantity</span>
                <span className={`text-2xl font-black ${item.quantity < 5 ? 'text-rose-500' : 'text-emerald-400'}`}>
                  {item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Inventory Item</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-slate-400 text-sm font-bold mb-2">Item Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., LED Bulb 9W"
                />
              </div>
              <div className="mb-4">
                <label className="block text-slate-400 text-sm font-bold mb-2">Quantity</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-400 text-sm font-bold mb-2">Description</label>
                <textarea 
                  rows="3"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional details..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
