import React, { useState } from 'react';
import { useInvestorData } from '../services/investorService';
import { formatCurrency } from '../lib/utils';
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
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InvestorDashboard() {
  const { rooms, bookings, overrides, transactions, maintenanceLogs, loading, requestBlock } = useInvestorData();
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'bookings' | 'finance' | 'blocks'>('overview');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [blockDates, setBlockDates] = useState({ start: '', end: '', reason: '' });
  const [error, setError] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <Hotel className="w-6 h-6" />
          ResortLink
        </h1>
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {showMobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar / Mobile Menu Overlay */}
      <AnimatePresence>
        {(showMobileMenu || window.innerWidth >= 1024) && (
          <motion.aside 
            initial={window.innerWidth < 1024 ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={`
              fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col
              ${showMobileMenu ? 'block' : 'hidden lg:flex'}
            `}
          >
            <div className="p-6 border-b border-slate-100 hidden lg:block">
              <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                <Hotel className="w-6 h-6" />
                ResortLink
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
              <div className="pt-4 mt-4 border-t border-slate-100">
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
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab}</h2>
            <p className="text-slate-500 text-sm md:text-base">Real-time performance for your resort portfolio</p>
          </div>
          <button 
            onClick={() => setShowBlockModal(true)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
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
                <StatCard label="Net Income" value={formatCurrency(netIncome)} icon={<DollarSign className="text-green-600" />} />
                <StatCard label="Total Units" value={rooms.length.toString()} icon={<Hotel className="text-blue-600" />} />
                <StatCard label="Active Bookings" value={bookings.filter(b => b.status === 'Confirmed').length.toString()} icon={<Calendar className="text-purple-600" />} />
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Revenue Trend (Last 10 Transactions)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-800">Room {rooms.find(r => r.id === booking.roomId)?.roomNumber}</p>
                          <p className="text-xs text-slate-500">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                        </div>
                        <span className="text-indigo-600 font-semibold">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Pending Block Requests</h3>
                  <div className="space-y-4">
                    {overrides.filter(o => o.status === 'Pending_Admin').map(override => (
                      <div key={override.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div>
                          <p className="font-medium text-amber-800">Room {rooms.find(r => r.id === override.roomId)?.roomNumber}</p>
                          <p className="text-xs text-amber-600">{new Date(override.startDate).toLocaleDateString()} - {new Date(override.endDate).toLocaleDateString()}</p>
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
                <div key={room.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="h-32 bg-indigo-500 flex items-center justify-center">
                    <Hotel className="w-12 h-12 text-white opacity-50" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Room {room.roomNumber}</h3>
                        <p className="text-slate-500">{room.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {room.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Revenue Split</span>
                        <span className="font-medium">{(room.revenueSplit * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Base Price</span>
                        <span className="font-medium">{formatCurrency(room.basePrice)}/night</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Unit</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Dates</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Total Revenue</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          Room {rooms.find(r => r.id === b.roomId)?.roomNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-indigo-600">
                          {formatCurrency(b.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                            b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600">Room</th>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'Revenue' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                          {rooms.find(r => r.id === t.roomId)?.roomNumber}
                        </td>
                        <td className={`px-6 py-4 text-sm text-right font-bold ${t.type === 'Revenue' ? 'text-green-600' : 'text-red-600'}`}>
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
                  <div key={override.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        override.status === 'Approved' ? 'bg-green-100 text-green-600' :
                        override.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {override.status === 'Approved' ? <CheckCircle /> : override.status === 'Rejected' ? <XCircle /> : <Clock />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">Room {rooms.find(r => r.id === override.roomId)?.roomNumber}</h4>
                        <p className="text-sm text-slate-500">{new Date(override.startDate).toLocaleDateString()} - {new Date(override.endDate).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400 mt-1 italic">"{override.reason}"</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        override.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        override.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Request Block</h3>
              <button onClick={() => setShowBlockModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleRequestBlock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Unit</label>
                <select 
                  required
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Choose a room...</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.type})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    required
                    value={blockDates.start}
                    onChange={(e) => setBlockDates({...blockDates, start: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    required
                    value={blockDates.end}
                    onChange={(e) => setBlockDates({...blockDates, end: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea 
                  required
                  value={blockDates.reason}
                  onChange={(e) => setBlockDates({...blockDates, reason: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  placeholder="e.g., Personal use, maintenance request..."
                />
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
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
          ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      {label}
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg">
        {icon}
      </div>
    </div>
  );
}
