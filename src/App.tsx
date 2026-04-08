import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './components/AuthProvider';
import InvestorDashboard from './components/InvestorDashboard';
import AdminDashboard from './components/AdminDashboard';
import GuestDashboard from './components/GuestDashboard';
import { Hotel, LogIn, ShieldCheck, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const { user, loading, isAdmin, isInvestor, isGuest } = useAuth();
  const [authError, setAuthError] = useState('');

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 mb-6">
              <Hotel className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">ResortLink</h1>
            <p className="text-slate-500 mt-2 text-lg">The next generation of resort management & investor transparency.</p>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Welcome Back</h2>
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <img src="https://www.gstatic.com/firebase/anonymous-scan.png" alt="Google" className="w-5 h-5 hidden" />
              <LogIn className="w-5 h-5 text-indigo-600" />
              Sign in with Google
            </button>
            {authError && <p className="text-red-500 text-sm mt-4">{authError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FeatureCard icon={<ShieldCheck className="text-indigo-600" />} title="Secure" desc="RBAC protected data" />
            <FeatureCard icon={<UserIcon className="text-indigo-600" />} title="Transparent" desc="Real-time logs" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isInvestor) {
    return <InvestorDashboard />;
  }

  if (isGuest) {
    return <GuestDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-slate-500 mb-8">
          Your account is currently set as a <strong>{user.role}</strong>. 
          To access the Investor Dashboard, an administrator must assign you the 'investor' role and map units to your profile.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl text-left">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Your UID</p>
            <code className="text-xs text-indigo-600 break-all">{user.uid}</code>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-left">
      <div className="mb-2">{icon}</div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}
