import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCurrencyDollar, HiCheckCircle, HiExclamationCircle, HiCalendar, HiPlus } from 'react-icons/hi';

const FeeList = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user.role === 'warden') {
    return <div className="p-8 text-white">Access Denied. Wardens do not have access to fee management.</div>;
  }

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  
  const [formData, setFormData] = useState({ student_id: '', amount: '', due_date: '' });
  const [payAmount, setPayAmount] = useState('');
  
  const TOTAL_HOSTEL_FEE = 67000;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user.role === 'student' ? '/api/fees/my' : '/api/fees';
      const [feesRes, studentsRes] = await Promise.all([
        axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } }),
        user.role === 'admin' ? axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: { data: [] } })
      ]);
      setFees(feesRes.data.data);
      setStudents(studentsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch fee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/fees', formData, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      fetchData();
    } catch (err) { alert('Failed to create invoice'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const newPaidAmount = parseFloat(selectedFee.paid_amount || 0) + parseFloat(payAmount);
      await axios.put(`/api/fees/${selectedFee.fee_id}`, { paid_amount: newPaidAmount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPayModal(false);
      setPayAmount('');
      fetchData();
    } catch (err) { alert('Payment failed'); }
  };

  const totalPaid = fees.reduce((acc, curr) => acc + parseFloat(curr.paid_amount || 0), 0);
  const totalDues = fees.reduce((acc, curr) => acc + (parseFloat(curr.amount) - parseFloat(curr.paid_amount || 0)), 0);

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-glow">Fee Management</h1>
            <p className="text-slate-400">Total Hostel Fee Structure: ${TOTAL_HOSTEL_FEE.toLocaleString()}</p>
          </div>
          {user.role === 'admin' && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <HiPlus /> New Invoice
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Paid" value={`$${totalPaid.toLocaleString()}`} icon={<HiCheckCircle />} color="text-emerald-400" />
          <StatCard title="Total Dues" value={`$${totalDues.toLocaleString()}`} icon={<HiExclamationCircle />} color="text-rose-400" />
          <StatCard title="Annual Balance" value={`$${(TOTAL_HOSTEL_FEE - totalPaid).toLocaleString()}`} icon={<HiCurrencyDollar />} color="text-indigo-400" />
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Student / Invoice</th>
                <th className="px-6 py-4">Amount / Paid</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {fees.map(fee => {
                const balance = parseFloat(fee.amount) - parseFloat(fee.paid_amount || 0);
                const isOverdue = new Date(fee.due_date) < new Date() && fee.status !== 'paid';
                
                return (
                  <tr key={fee.fee_id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{fee.name || 'Monthly Hostel Fee'}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">INV #{fee.fee_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">${fee.amount}</p>
                      <p className="text-xs text-emerald-500">Paid: ${fee.paid_amount || 0}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-400">${balance.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 text-xs font-bold ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                        <HiCalendar />
                        {new Date(fee.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        fee.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        fee.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' && fee.status !== 'paid' && (
                        <button 
                          onClick={() => { setSelectedFee(fee); setShowPayModal(true); }}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Record Payment Modal */}
        {showPayModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8">
              <h2 className="text-xl font-bold text-white mb-6">Record Payment</h2>
              <div className="p-4 bg-white/5 rounded-xl mb-6">
                <p className="text-xs text-slate-500 uppercase font-black mb-1">Total Outstanding Balance</p>
                <p className="text-2xl font-black text-rose-400">${(selectedFee.amount - selectedFee.paid_amount).toLocaleString()}</p>
              </div>
              <form onSubmit={handlePayment} className="space-y-4">
                <input 
                  type="number" placeholder="Enter Amount Paid" required 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                  value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                />
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 btn-primary">Confirm Payment</button>
                  <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* New Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8">
              <h2 className="text-xl font-bold text-white mb-6">Generate New Invoice</h2>
              <form onSubmit={handleGenerateInvoice} className="space-y-4">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none"
                  value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                >
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name} ({s.student_number})</option>)}
                </select>
                <input type="number" placeholder="Invoice Amount" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 btn-primary">Create Invoice</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card p-6 flex items-center gap-6">
    <div className={`p-4 rounded-2xl bg-white/5 ${color} text-2xl`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </div>
);

export default FeeList;
