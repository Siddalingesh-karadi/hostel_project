import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCurrencyDollar, HiCheckCircle, HiExclamationCircle, HiCalendar } from 'react-icons/hi';

const FeeList = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '', amount: '', due_date: ''
  });
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user.role === 'student' ? '/api/fees/my' : '/api/fees';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFees(response.data.data);
    } catch (err) {
      console.error('Failed to fetch fee records');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  useEffect(() => {
    fetchFees();
    if (user.role === 'admin') fetchStudents();
  }, [user.role]);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/fees', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ student_id: '', amount: '', due_date: '' });
      fetchFees();
    } catch (err) {
      alert('Failed to generate invoice');
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/fees/${id}`, { status: 'paid' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFees();
    } catch (err) {
      alert('Failed to update payment');
    }
  };

  const totalDues = fees
    .filter(f => f.status !== 'paid')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {user.role === 'student' ? 'My Fee Records' : 'Hostel Fee Management'}
            </h1>
            <p className="text-slate-400">View and manage all financial records</p>
          </div>
          {user.role === 'admin' && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Generate New Invoice
            </button>
          )}
        </div>

        {/* Generate Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Generate Invoice</h2>
              <form onSubmit={handleGenerateInvoice} className="space-y-4">
                <select 
                  required 
                  className="w-full bg-slate-800 border-none rounded-lg p-3 text-white"
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                >
                  <option value="">Select Student...</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>{s.name} ({s.phone})</option>
                  ))}
                </select>
                <input type="number" placeholder="Amount ($)" required className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                <input type="date" required className="w-full bg-slate-800 border-none rounded-lg p-3 text-white" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                
                <div className="flex gap-4 mt-6">
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all">Create Invoice</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6 border-l-4 border-indigo-500">
            <div className="flex items-center gap-4 text-slate-400 mb-2">
              <HiCurrencyDollar className="text-2xl" />
              <span className="text-sm font-semibold uppercase tracking-wider">Total {user.role === 'student' ? 'Pending' : 'Receivable'}</span>
            </div>
            <h2 className="text-3xl font-bold text-white">${totalDues.toLocaleString()}</h2>
          </div>
          
          <div className="glass-card p-6 border-l-4 border-emerald-500">
            <div className="flex items-center gap-4 text-slate-400 mb-2">
              <HiCheckCircle className="text-2xl" />
              <span className="text-sm font-semibold uppercase tracking-wider">Status Overview</span>
            </div>
            <h2 className="text-3xl font-bold text-white">
              {fees.filter(f => f.status === 'paid').length} Paid
            </h2>
          </div>

          <div className="glass-card p-6 border-l-4 border-amber-500">
            <div className="flex items-center gap-4 text-slate-400 mb-2">
              <HiExclamationCircle className="text-2xl" />
              <span className="text-sm font-semibold uppercase tracking-wider">Unpaid Records</span>
            </div>
            <h2 className="text-3xl font-bold text-white">
              {fees.filter(f => f.status === 'unpaid').length} Outstanding
            </h2>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-300 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center">Loading records...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center">No fee records found</td></tr>
              ) : fees.map((fee) => (
                <tr key={fee.fee_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    {user.role === 'admin' ? (
                      <div>
                        <p className="text-white font-medium">{fee.name}</p>
                        <p className="text-xs text-slate-500">{fee.phone}</p>
                      </div>
                    ) : (
                      <p className="text-white font-medium">Hostel Monthly Fee</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">${fee.amount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <HiCalendar className="text-slate-500" />
                      {new Date(fee.due_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        fee.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {fee.status}
                      </span>
                      {user.role === 'admin' && fee.status !== 'paid' && (
                        <button 
                          onClick={() => handleMarkAsPaid(fee.fee_id)}
                          className="text-xs font-bold text-emerald-500 hover:underline"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {fee.payment_date ? new Date(fee.payment_date).toLocaleDateString() : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeList;
