import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './components/AuthProvider';
import InvestorDashboard from './components/InvestorDashboard';
import AdminDashboard from './components/AdminDashboard';
import GuestDashboard from './components/GuestDashboard';
import LandingPage from './components/LandingPage';
import { useSecretAdmin } from './lib/useSecretAdmin';
import { ShieldCheck, X } from 'lucide-react';

type View = 'landing' | 'dashboard' | 'admin';

export default function App() {
  const { user, loading, isAdmin, isInvestor, isGuest } = useAuth();
  const [view, setView] = useState<View>('landing');

  // Secret Admin Trigger: 3 clicks in 3 seconds
  useSecretAdmin(() => {
    setView('admin');
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0502]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If in secret admin mode, show admin dashboard
  if (view === 'admin') {
    return (
      <div className="relative">
        <button 
          onClick={() => setView('landing')}
          className="fixed top-4 right-4 z-[100] bg-red-600 text-white p-2 rounded-full shadow-xl hover:bg-red-700 transition-all"
          title="Exit Admin Mode"
        >
          <X className="w-6 h-6" />
        </button>
        <AdminDashboard />
      </div>
    );
  }

  // If in dashboard mode, show role-based view
  if (view === 'dashboard' && user) {
    if (isAdmin) return <AdminDashboard />;
    if (isInvestor) return <InvestorDashboard />;
    if (isGuest) return <GuestDashboard />;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500 mb-8">
            Your account is currently set as a <strong>{user.role}</strong>. 
            To access the Investor Dashboard, an administrator must assign you the 'investor' role.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => setView('landing')}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Back to Home
            </button>
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

  // Default to Landing Page
  return <LandingPage onDashboardClick={() => setView('dashboard')} />;
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
