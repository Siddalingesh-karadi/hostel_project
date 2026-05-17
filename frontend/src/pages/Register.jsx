import React from 'react';
import { Link } from 'react-router-dom';
import { HiShieldExclamation } from 'react-icons/hi';

const Register = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 shadow-2xl border border-rose-500/20 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-rose-500 animate-pulse">
            <HiShieldExclamation className="h-12 w-12" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
          Registration Restricted
        </h2>
        
        <p className="text-slate-300 text-sm leading-relaxed mb-8">
          Self-registration is currently disabled. Student accounts can only be created directly by a <span className="text-indigo-400 font-semibold">Hostel Warden</span> or <span className="text-indigo-400 font-semibold">Administrator</span>.
        </p>


        <Link
          to="/login"
          className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default Register;
