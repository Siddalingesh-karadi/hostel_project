import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCurrencyRupee, HiCheckCircle, HiClock } from 'react-icons/hi';

const ParentFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/parents/fees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFees(res.data.data);
      } catch (err) {
        console.error('Failed to fetch fees');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate totals
  const totalFees = fees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + parseFloat(f.paid_amount || 0), 0);
  const totalPending = totalFees - totalPaid;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-black text-white mb-2">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Fee Details</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">Complete fee and payment history for your child.</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 border-t-4 border-amber-500">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Total Fees</p>
            <p className="text-3xl font-black text-white">₹{totalFees.toLocaleString()}</p>
          </div>
          <div className="glass-card p-6 border-t-4 border-emerald-500">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Amount Paid</p>
            <p className="text-3xl font-black text-emerald-400">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div className="glass-card p-6 border-t-4 border-rose-500">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Pending Amount</p>
            <p className="text-3xl font-black text-rose-400">₹{totalPending.toLocaleString()}</p>
          </div>
        </div>

        {/* Fee Records */}
        <div className="glass-card p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <HiCurrencyRupee className="text-amber-500" /> Payment History
          </h3>
          {fees.length > 0 ? (
            <div className="space-y-3">
              {fees.map(fee => (
                <div key={fee.fee_id} className="bg-white/5 border border-white/5 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-bold">{fee.description || 'Hostel Fee'}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        {fee.fee_type || 'General'} • Created: {new Date(fee.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                      fee.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {fee.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500">Total Amount</p>
                      <p className="text-white font-bold">₹{parseFloat(fee.amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500">Paid</p>
                      <p className="text-emerald-400 font-bold">₹{parseFloat(fee.paid_amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-500">Payment Date</p>
                      <p className="text-white font-bold">
                        {fee.payment_date ? new Date(fee.payment_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic py-8 text-center">No fee records found.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ParentFees;
