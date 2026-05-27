import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCurrencyRupee, HiCheckCircle, HiExclamationCircle, HiCalendar, HiPlus, HiSearch } from 'react-icons/hi';

const FeeList = () => {
  const user = JSON.parse(localStorage.getItem('user'));



  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  
  const [deadline, setDeadline] = useState('Not Announced Yet');
  const [newDeadline, setNewDeadline] = useState('');
  
  const [formData, setFormData] = useState({ student_id: '', amount: '', due_date: '' });
  const [payAmount, setPayAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('fees');
  
  const TOTAL_HOSTEL_FEE = 67000;

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Not Announced Yet') return 'Not Announced Yet';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; 
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysLeft = (dateString) => {
    if (!dateString || dateString === 'Not Announced Yet') return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const diff = d - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `(${days} Days Left)`;
    if (days === 0) return `(Due Today)`;
    return `(Overdue by ${Math.abs(days)} Days)`;
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = user.role === 'student' ? '/api/fees/my' : '/api/fees';
      const requestsEndpoint = user.role === 'student' ? '/api/fees/payment-requests/my' : '/api/fees/payment-requests/all';
      
      const [feesRes, studentsRes, deadlineRes, requestsRes] = await Promise.all([
        axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } }),
        user.role !== 'student' ? axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: { data: [] } }),
        axios.get('/api/fees/deadline', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(requestsEndpoint, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFees(feesRes.data.data);
      setStudents(studentsRes.data.data);
      setDeadline(deadlineRes.data.deadline);
      setPaymentRequests(requestsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch fee data', err);
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
      setFormData({ student_id: '', amount: '', due_date: '' });
      fetchData();
    } catch (err) { alert('Failed to create invoice: ' + (err.response?.data?.message || err.message)); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (user.role === 'student') {
        if (!transactionId.trim()) {
          alert('Transaction reference ID is required');
          return;
        }
        await axios.post(`/api/fees/${selectedFee.fee_id}/pay`, {
          amount: parseFloat(payAmount),
          transaction_id: transactionId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Payment request submitted successfully for Warden approval!');
      } else {
        const newPaidAmount = parseFloat(selectedFee.paid_amount || 0) + parseFloat(payAmount);
        await axios.put(`/api/fees/${selectedFee.fee_id}`, { paid_amount: newPaidAmount }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Payment recorded successfully!');
      }
      setShowPayModal(false);
      setPayAmount('');
      setTransactionId('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment action failed');
    }
  };

  const handleApproveRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this payment request? This will update the student\'s paid fee balance.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/fees/payment-requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Payment request approved successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const remarks = window.prompt('Enter reason for rejection:');
    if (remarks === null) return; // User cancelled
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/fees/payment-requests/${requestId}/reject`, { remarks }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Payment request rejected.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const totalPaid = fees.reduce((acc, curr) => acc + parseFloat(curr.paid_amount || 0), 0);
  const totalDues = fees.reduce((acc, curr) => acc + (parseFloat(curr.amount) - parseFloat(curr.paid_amount || 0)), 0);
  
  const fullPaidCount = fees.filter(f => f.status === 'paid').length;
  const partialPaidCount = fees.filter(f => f.status === 'partial').length;
  const unpaidCount = fees.filter(f => f.status === 'unpaid').length;

  const filteredFees = fees.filter(fee => 
    fee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.fee_id?.toString().includes(searchTerm) ||
    fee.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-glow">Fee Management</h1>
            <p className="text-slate-400">Total Hostel Fee Structure: ₹{TOTAL_HOSTEL_FEE.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-card px-6 py-3 border-l-4 border-rose-500 flex items-center gap-4">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Official Deadline</p>
                <p className="text-sm font-bold text-rose-400">
                  {formatDate(deadline)} <span className="text-xs text-white/50 ml-1">{getDaysLeft(deadline)}</span>
                </p>
              </div>
              {user.role === 'admin' && (
                <button onClick={() => { setNewDeadline(deadline); setShowDeadlineModal(true); }} className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg transition-all ml-2">
                  <HiPlus />
                </button>
              )}
            </div>
            {user.role === 'warden' && (
              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 h-full py-4">
                <HiPlus /> New Invoice
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {user.role !== 'student' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard title="Fully Paid Students" value={fullPaidCount} icon={<HiCheckCircle />} color="text-emerald-400" />
            <StatCard title="Partially Paid" value={partialPaidCount} icon={<HiExclamationCircle />} color="text-amber-400" />
            <StatCard title="Unpaid Invoices" value={unpaidCount} icon={<HiCurrencyRupee />} color="text-rose-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard title="Total Paid" value={`₹${totalPaid.toLocaleString()}`} icon={<HiCheckCircle />} color="text-emerald-400" />
            <StatCard title="Total Dues" value={`₹${totalDues.toLocaleString()}`} icon={<HiExclamationCircle />} color="text-rose-400" />
            <StatCard title="Annual Balance" value={`₹${(TOTAL_HOSTEL_FEE - totalPaid).toLocaleString()}`} icon={<HiCurrencyRupee />} color="text-indigo-400" />
          </div>
        )}

        {user.role !== 'student' && (
          <div className="flex gap-4 mb-6 border-b border-white/5 pb-2">
            <button 
              onClick={() => setActiveTab('fees')}
              className={`px-4 py-2 font-bold text-sm transition-all rounded-lg ${activeTab === 'fees' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Hostel Fees
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 font-bold text-sm transition-all rounded-lg flex items-center gap-2 ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Payment Requests
              {paymentRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/20">
                  {paymentRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        )}

        {user.role !== 'student' && activeTab === 'fees' && (
          <div className="flex justify-between items-center mb-6">
            <div className="relative max-w-sm w-full">
              <input 
                type="text" 
                placeholder="Search by student name or status..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white outline-none focus:border-indigo-500 transition-all shadow-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
            </div>
          </div>
        )}

        {/* Warden/Admin Payment Requests Tab */}
        {user.role !== 'student' && activeTab === 'requests' ? (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-400 text-xs uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Fee Details</th>
                  <th className="px-6 py-4">Requested Amount</th>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paymentRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">No payment requests found.</td>
                  </tr>
                ) : (
                  paymentRequests.map(req => (
                    <tr key={req.request_id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{req.student_name}</p>
                        <p className="text-xs text-slate-400">{req.student_number}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-400">Total: ₹{parseFloat(req.fee_total).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Paid: ₹{parseFloat(req.fee_paid).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        ₹{parseFloat(req.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-300">
                        {req.transaction_id}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {req.status}
                        </span>
                        {req.remarks && <p className="text-[10px] text-slate-500 mt-1 italic">Note: {req.remarks}</p>}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproveRequest(req.request_id)}
                              className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-emerald-500/30"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectRequest(req.request_id)}
                              className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-rose-500/30"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Fees List Tab (Warden/Admin/Student) */
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-400 text-xs uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Paid</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Last Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFees.map(fee => {
                  const amount = parseFloat(fee.amount);
                  const paidAmt = parseFloat(fee.paid_amount || 0);
                  const balance = TOTAL_HOSTEL_FEE - paidAmt;
                  const isOverdue = new Date(fee.due_date) < new Date() && paidAmt < TOTAL_HOSTEL_FEE;
                  
                  return (
                    <tr key={fee.fee_id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{fee.name || 'Monthly Hostel Fee'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-emerald-400">₹{paidAmt.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-rose-400">₹{balance.toLocaleString()}</td>
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
                        {paidAmt < TOTAL_HOSTEL_FEE && (user.role === 'warden' || user.role === 'student') ? (
                          <button 
                            onClick={() => { setSelectedFee(fee); setShowPayModal(true); }}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all"
                          >
                            {user.role === 'student' ? 'Pay Online' : 'Record Payment'}
                          </button>
                        ) : (
                          user.role === 'student' && paidAmt >= TOTAL_HOSTEL_FEE && (
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">Fully Paid</span>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Student Online Payments History */}
        {user.role === 'student' && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 text-glow">Your Online Payments (Awaiting Warden Approval)</h2>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-slate-400 text-xs uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date Submitted</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Remarks / Warden Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paymentRequests.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No payment requests submitted yet.</td>
                    </tr>
                  ) : (
                    paymentRequests.map(req => (
                      <tr key={req.request_id} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-bold text-emerald-400">
                          ₹{parseFloat(req.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-300">
                          {req.transaction_id}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 italic">
                          {req.remarks || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {showPayModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8">
              <h2 className="text-xl font-bold text-white mb-6">
                {user.role === 'student' ? 'Secure Online Payment' : 'Record Payment'}
              </h2>
              
              <div className="p-5 bg-white/5 rounded-2xl mb-6 border border-white/10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Fee</p>
                    <p className="text-lg font-bold text-white">₹{parseFloat(selectedFee.amount).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mb-1">Already Paid</p>
                    <p className="text-lg font-bold text-emerald-400">₹{parseFloat(selectedFee.paid_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Total Hostel Balance</p>
                  <p className="text-3xl font-black text-rose-400">₹{(TOTAL_HOSTEL_FEE - (selectedFee.paid_amount || 0)).toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Payment Amount</label>
                  <div className="relative">
                    <HiCurrencyRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input 
                      type="number" placeholder="Enter Amount..." required 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white text-lg font-bold outline-none focus:border-indigo-500 transition-all"
                      value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                      max={TOTAL_HOSTEL_FEE - (selectedFee.paid_amount || 0)}
                    />
                  </div>
                </div>

                {user.role === 'student' && (
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Transaction ID / Reference (UPI/NEFT/Bank)</label>
                    <input 
                      type="text" placeholder="Enter Transaction Reference ID..." required 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-indigo-500 transition-all font-bold"
                      value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>
                )}

                {payAmount && (
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">New Balance Will Be</span>
                    <span className="text-xl font-black text-indigo-300">
                      ₹{Math.max(0, (TOTAL_HOSTEL_FEE - (selectedFee.paid_amount || 0) - payAmount)).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 btn-primary py-4 text-sm">
                    {user.role === 'student' ? 'Pay Securely' : 'Confirm Payment'}
                  </button>
                  <button type="button" onClick={() => { setShowPayModal(false); setPayAmount(''); }} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-all">Cancel</button>
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
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none"
                  value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                >
                  <option value="" className="bg-slate-900 text-white">Select Student...</option>
                  {students.map(s => <option key={s.student_id} value={s.student_id} className="bg-slate-900 text-white">{s.name}</option>)}
                </select>
                <div className="relative">
                  <HiCurrencyRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                  <input 
                    type="number" placeholder="Invoice Amount" required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-white font-bold outline-none focus:border-indigo-500 transition-all" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  />
                </div>
                <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white [color-scheme:dark]" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 btn-primary">Create Invoice</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deadline Modal */}
        {showDeadlineModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8">
              <h2 className="text-xl font-bold text-white mb-6">Announce Last Date to Pay</h2>
              <input 
                type="date" required 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-rose-500 transition-all mb-6 [color-scheme:dark]"
                value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)}
              />
              <div className="flex gap-4">
                <button onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    await axios.put('/api/fees/deadline', { deadline: newDeadline }, { headers: { Authorization: `Bearer ${token}` } });
                    setDeadline(newDeadline);
                    setShowDeadlineModal(false);
                  } catch (err) { alert('Failed to update'); }
                }} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-rose-500/20 text-sm">
                  Announce Date
                </button>
                <button onClick={() => setShowDeadlineModal(false)} className="flex-1 bg-white/5 text-slate-300 rounded-xl font-bold hover:bg-white/10 transition-all">Cancel</button>
              </div>
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
