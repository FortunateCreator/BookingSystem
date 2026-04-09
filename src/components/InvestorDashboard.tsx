import React, { useState } from 'react';
import { useInvestorData } from '../services/investorService';
import { formatCurrency } from '../lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Hotel, 
  Calendar, 
  DollarSign, 
  Wrench, 
  History,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Menu,
  X,
  LogIn,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InvestorDashboard() {
  const { rooms, bookings, overrides, transactions, maintenanceLogs, loading, requestBlock } = useInvestorData();
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'bookings' | 'finance' | 'blocks'>('overview');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [blockDates, setBlockDates] = useState({ start: '', end: '', reason: '' });
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-earth-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moss-500"></div>
      </div>
    );
  }

  const totalRevenue = transactions
    .filter(t => t.type === 'Revenue')
    .reduce((acc, t) => acc + t.investorAmount, 0);
  
  const totalDeductions = transactions
    .filter(t => t.type === 'Maintenance_Deduction')
    .reduce((acc, t) => acc + t.investorAmount, 0);

  const netIncome = totalRevenue - totalDeductions;

  const handleRequestBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await requestBlock(selectedRoomId, blockDates.start, blockDates.end, blockDates.reason);
      setShowBlockModal(false);
      setBlockDates({ start: '', end: '', reason: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const chartData = transactions
    .filter(t => t.type === 'Revenue')
    .slice(0, 10)
    .reverse()
    .map(t => ({
      date: new Date(t.date).toLocaleDateString(),
      amount: t.investorAmount
    }));

  return (
    <div className="min-h-screen bg-earth-950 flex flex-col lg:flex-row text-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-earth-900 border-b border-earth-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold text-moss-500 flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          ZenSpace
        </h1>
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-slate-400 hover:bg-earth-800 rounded-lg transition-colors"
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar / Mobile Menu Overlay */}
      <AnimatePresence>
        {(showMobileMenu || isLargeScreen) && (
          <motion.aside 
            initial={!isLargeScreen ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`
              fixed lg:static inset-y-0 left-0 z-50 w-64 bg-earth-900 border-r border-earth-800 flex flex-col
              ${showMobileMenu ? 'block' : 'hidden lg:flex'}
            `}
          >
            <div className="p-6 border-b border-earth-800 hidden lg:block">
              <h1 className="text-xl font-bold text-moss-500 flex items-center gap-2">
                <Leaf className="w-6 h-6" />
                ZenSpace
              </h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <SidebarItem 
                icon={<LayoutDashboard />} 
                label="Overview" 
                active={activeTab === 'overview'} 
                onClick={() => { setActiveTab('overview'); setShowMobileMenu(false); }} 
              />
              <SidebarItem 
                icon={<Hotel />} 
                label="My Units" 
                active={activeTab === 'units'} 
                onClick={() => { setActiveTab('units'); setShowMobileMenu(false); }} 
              />
              <SidebarItem 
                icon={<Calendar />} 
                label="Bookings" 
                active={activeTab === 'bookings'} 
                onClick={() => { setActiveTab('bookings'); setShowMobileMenu(false); }} 
              />
              <SidebarItem 
                icon={<DollarSign />} 
                label="Financials" 
                active={activeTab === 'finance'} 
                onClick={() => { setActiveTab('finance'); setShowMobileMenu(false); }} 
              />
              <SidebarItem 
                icon={<History />} 
                label="Block History" 
                active={activeTab === 'blocks'} 
                onClick={() => { setActiveTab('blocks'); setShowMobileMenu(false); }} 
              />
              <div className="pt-4 mt-4 border-t border-earth-800">
                <SidebarItem 
                  icon={<LogIn className="rotate-180" />} 
                  label="Sign Out" 
                  active={false} 
                  onClick={() => signOut(auth)} 
                />
              </div>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Menu Backdrop */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-earth-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white capitalize font-display">{activeTab}</h2>
            <p className="text-slate-400 text-sm md:text-base">Real-time performance for your ZenSpace portfolio</p>
          </div>
          <button 
            onClick={() => setShowBlockModal(true)}
            className="w-full sm:w-auto bg-moss-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-moss-500 transition-all shadow-lg shadow-moss-900/20"
          >
            <Plus className="w-4 h-4" />
            Request Block
          </button>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Net Income" value={formatCurrency(netIncome)} icon={<DollarSign className="text-moss-500" />} />
                <StatCard label="Total Units" value={rooms.length.toString()} icon={<Hotel className="text-sky-500" />} />
                <StatCard label="Active Bookings" value={bookings.filter(b => b.status === 'Confirmed').length.toString()} icon={<Calendar className="text-amber-500" />} />
              </div>

              {/* Chart */}
              <div className="bg-earth-900 p-6 rounded-xl border border-earth-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-6 text-white">Revenue Trend (Last 10 Transactions)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d1b12" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a0f0a', border: '1px solid #2d1b12', borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-earth-900 p-6 rounded-xl border border-earth-800 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-white">Recent Bookings</h3>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-earth-800 rounded-lg">
                        <div>
                          <p className="font-medium text-white">Room {rooms.find(r => r.id === booking.roomId)?.roomNumber}</p>
                          <p className="text-xs text-slate-400">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                        </div>
                        <span className="text-moss-500 font-semibold">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-earth-900 p-6 rounded-xl border border-earth-800 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-white">Pending Block Requests</h3>
                  <div className="space-y-4">
                    {overrides.filter(o => o.status === 'Pending_Admin').map(override => (
                      <div key={override.id} className="flex items-center justify-between p-3 bg-amber-900/20 rounded-lg border border-amber-900/30">
                        <div>
                          <p className="font-medium text-amber-400">Room {rooms.find(r => r.id === override.roomId)?.roomNumber}</p>
                          <p className="text-xs text-amber-500">{new Date(override.startDate).toLocaleDateString()} - {new Date(override.endDate).toLocaleDateString()}</p>
                        </div>
                        <Clock className="w-5 h-5 text-amber-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'units' && (
            <motion.div key="units" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(room => (
                <div key={room.id} className="bg-earth-900 rounded-xl border border-earth-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-moss-900/20 transition-all group">
                  <div className="h-32 bg-moss-600 flex items-center justify-center">
                    <Hotel className="w-12 h-12 text-white opacity-50" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Room {room.roomNumber}</h3>
                        <p className="text-slate-400">{room.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${room.status === 'Available' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                        {room.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Revenue Split</span>
                        <span className="font-medium text-white">{(room.revenueSplit * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Base Price</span>
                        <span className="font-medium text-moss-500">{formatCurrency(room.basePrice)}/night</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-earth-900 rounded-xl border border-earth-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-earth-800 border-b border-earth-800">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">Unit</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">Dates</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">Total Revenue</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-800">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-earth-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-white">
                          Room {rooms.find(r => r.id === b.roomId)?.roomNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-moss-500">
                          {formatCurrency(b.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            b.status === 'Confirmed' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'finance' && (
            <motion.div key="finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-earth-900 rounded-xl border border-earth-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-earth-800 border-b border-earth-800">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">Date</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">Type</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400">Room</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-800">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-earth-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'Revenue' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          {rooms.find(r => r.id === t.roomId)?.roomNumber}
                        </td>
                        <td className={`px-6 py-4 text-sm text-right font-bold ${t.type === 'Revenue' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.type === 'Revenue' ? '+' : '-'}{formatCurrency(t.investorAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'blocks' && (
            <motion.div key="blocks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {overrides.map(override => (
                  <div key={override.id} className="bg-earth-900 p-6 rounded-xl border border-earth-800 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        override.status === 'Approved' ? 'bg-emerald-900/50 text-emerald-400' :
                        override.status === 'Rejected' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'
                      }`}>
                        {override.status === 'Approved' ? <CheckCircle /> : override.status === 'Rejected' ? <XCircle /> : <Clock />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">Room {rooms.find(r => r.id === override.roomId)?.roomNumber}</h4>
                        <p className="text-sm text-slate-400">{new Date(override.startDate).toLocaleDateString()} - {new Date(override.endDate).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500 mt-1 italic">"{override.reason}"</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        override.status === 'Approved' ? 'bg-emerald-900/50 text-emerald-400' :
                        override.status === 'Rejected' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'
                      }`}>
                        {override.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-earth-950/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-earth-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-earth-800"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Request Block</h3>
              <button onClick={() => setShowBlockModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleRequestBlock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Select Unit</label>
                <select 
                  required
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full bg-earth-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-moss-500 outline-none"
                >
                  <option value="">Choose a room...</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.type})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={blockDates.start}
                    onChange={(e) => setBlockDates({...blockDates, start: e.target.value})}
                    className="w-full bg-earth-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-moss-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={blockDates.end}
                    onChange={(e) => setBlockDates({...blockDates, end: e.target.value})}
                    className="w-full bg-earth-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-moss-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Reason</label>
                <textarea 
                  required
                  value={blockDates.reason}
                  onChange={(e) => setBlockDates({...blockDates, reason: e.target.value})}
                  className="w-full bg-earth-800 border-none rounded-lg p-3 text-white focus:ring-2 focus:ring-moss-500 outline-none h-24"
                  placeholder="e.g., Personal use, maintenance request..."
                />
              </div>

              {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/30">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-moss-600 text-white py-3 rounded-lg font-bold hover:bg-moss-500 transition-all shadow-lg shadow-moss-900/20"
              >
                Submit Request
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active 
          ? 'bg-moss-600/10 text-moss-500 font-semibold shadow-sm' 
          : 'text-slate-400 hover:bg-earth-800 hover:text-white'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-earth-900 p-6 rounded-xl border border-earth-800 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className="p-3 bg-earth-800 rounded-lg">
        {icon}
      </div>
    </div>
  );
}
