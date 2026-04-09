import React, { useState } from 'react';
import { useAdminData } from '../services/adminService';
import { formatCurrency } from '../lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  Users, 
  Hotel, 
  Plus, 
  Check, 
  X, 
  Shield, 
  UserPlus,
  ArrowRight,
  Settings,
  CalendarCheck,
  Calendar,
  Menu,
  LogIn,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Room } from '../types';

export default function AdminDashboard() {
  const { users, rooms, overrides, bookings, loading, createRoom, updateUserRole, handleOverride, inviteUser } = useAdminData();
  const [activeTab, setActiveTab] = useState<'investors' | 'rooms' | 'requests' | 'bookings'>('investors');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    type: 'Studio',
    basePrice: 0,
    investorId: '',
    revenueSplit: 0.7,
    status: 'Available' as const,
    imageUrl: ''
  });

  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'investor' as User['role']
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-earth-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moss-500"></div>
      </div>
    );
  }

  const investors = users.filter(u => u.role === 'investor');
  const pendingRequests = overrides.filter(o => o.status === 'Pending_Admin');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoom(newRoom);
    setShowRoomModal(false);
    setNewRoom({
      roomNumber: '',
      type: 'Studio',
      basePrice: 0,
      investorId: '',
      revenueSplit: 0.7,
      status: 'Available',
      imageUrl: ''
    });
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await inviteUser(inviteData.email, inviteData.name, inviteData.role);
    setShowInviteModal(false);
    setInviteData({ email: '', name: '', role: 'investor' });
  };

  return (
    <div className="min-h-screen bg-earth-950 flex flex-col lg:flex-row font-sans text-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-earth-900 border-b border-earth-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-moss-600 rounded-lg flex items-center justify-center">
            <Leaf className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white font-display">ZenSpace Admin</h1>
        </div>
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 text-slate-400 hover:bg-earth-800 rounded-lg"
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
              fixed lg:static inset-y-0 left-0 z-50 w-72 bg-earth-900 border-r border-earth-800 flex flex-col
              ${showMobileMenu ? 'block' : 'hidden lg:flex'}
            `}
          >
            <div className="p-8 border-b border-earth-800 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-moss-600 rounded-xl flex items-center justify-center shadow-lg shadow-moss-900/20">
                  <Leaf className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white font-display">Admin Console</h1>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">ZenSpace v1.0</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 p-6 space-y-1">
              <NavButton 
                icon={<Users />} 
                label="Investors" 
                active={activeTab === 'investors'} 
                count={investors.length}
                onClick={() => { setActiveTab('investors'); setShowMobileMenu(false); }} 
              />
              <NavButton 
                icon={<Hotel />} 
                label="Units & Inventory" 
                active={activeTab === 'rooms'} 
                count={rooms.length}
                onClick={() => { setActiveTab('rooms'); setShowMobileMenu(false); }} 
              />
              <NavButton 
                icon={<CalendarCheck />} 
                label="Block Requests" 
                active={activeTab === 'requests'} 
                count={pendingRequests.length}
                onClick={() => { setActiveTab('requests'); setShowMobileMenu(false); }} 
              />
              <NavButton 
                icon={<Calendar />} 
                label="All Bookings" 
                active={activeTab === 'bookings'} 
                count={bookings.length}
                onClick={() => { setActiveTab('bookings'); setShowMobileMenu(false); }} 
              />
              <div className="pt-4 mt-4 border-t border-earth-800">
                <NavButton 
                  icon={<LogIn className="rotate-180" />} 
                  label="Sign Out" 
                  active={false} 
                  onClick={() => signOut(auth)} 
                />
              </div>
            </nav>

            <div className="p-6 border-t border-earth-800">
              <div className="bg-earth-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-moss-600/20 flex items-center justify-center text-moss-500 font-bold">
                  AD
                </div>
                <div>
                  <p className="text-sm font-bold text-white">System Admin</p>
                  <p className="text-xs text-slate-500">Superuser</p>
                </div>
              </div>
            </div>
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

      {/* Main */}
      <main className="flex-1 p-4 md:p-12 max-w-7xl mx-auto w-full overflow-x-hidden">
        <header className="mb-8 md:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 capitalize font-display">{activeTab.replace('-', ' ')}</h2>
            <p className="text-slate-400 text-base md:text-lg">Centralized management for ZenSpace assets and stakeholders.</p>
          </div>
          {activeTab === 'investors' && (
            <button 
              onClick={() => setShowInviteModal(true)}
              className="w-full sm:w-auto bg-moss-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-moss-500 transition-all shadow-xl shadow-moss-900/20"
            >
              <UserPlus className="w-5 h-5" />
              Invite Investor
            </button>
          )}
          {activeTab === 'rooms' && (
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => setShowRoomModal(true)}
                className="bg-moss-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-moss-500 transition-all shadow-xl shadow-moss-900/20"
              >
                <Plus className="w-5 h-5" />
                Add New Unit
              </button>
            </div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'investors' ? (
            <motion.div 
              key="investors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-earth-900 rounded-3xl border border-earth-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-earth-800 border-b border-earth-800">
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Investor Name</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Email Address</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Assigned Units</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-800">
                    {users.map(u => (
                      <tr key={u.uid} className="group hover:bg-earth-800/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-earth-800 flex items-center justify-center text-moss-500 font-bold text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-bold text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-slate-400 font-medium">{u.email}</td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-moss-600/20 text-moss-500 rounded-full text-xs font-bold">
                            {rooms.filter(r => r.investorId === u.uid).length} Units
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <select 
                            value={u.role}
                            onChange={(e) => updateUserRole(u.uid, e.target.value as any)}
                            className="text-xs font-bold bg-earth-800 border-none rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-moss-500 text-white"
                          >
                            <option value="guest">Guest</option>
                            <option value="investor">Investor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : activeTab === 'rooms' ? (
            <motion.div 
              key="rooms"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {rooms.map(room => (
                <div key={room.id} className="bg-earth-900 rounded-3xl border border-earth-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-moss-900/20 transition-all relative group">
                  <div className="h-48 bg-earth-800 relative overflow-hidden">
                    {room.imageUrl ? (
                      <img src={room.imageUrl} alt={`Unit ${room.roomNumber}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Hotel className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <div className={`w-3 h-3 rounded-full ${room.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-sm shadow-current/20`} />
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-white font-display">Unit {room.roomNumber}</h3>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">{room.type}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm font-medium">Investor</span>
                        <span className="text-white font-bold text-sm">
                          {users.find(u => u.uid === room.investorId)?.name || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm font-medium">Revenue Split</span>
                        <span className="text-moss-500 font-black text-sm">{(room.revenueSplit * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm font-medium">Base Price</span>
                        <span className="text-white font-bold text-sm">{formatCurrency(room.basePrice)}</span>
                      </div>
                    </div>

                    <button className="w-full py-3 bg-earth-800 text-slate-500 rounded-2xl font-bold text-sm group-hover:bg-moss-600 group-hover:text-white transition-all flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                      Manage Unit
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : activeTab === 'requests' ? (
            <motion.div 
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {pendingRequests.length === 0 ? (
                <div className="bg-earth-900 rounded-3xl border border-earth-800 p-20 text-center">
                  <div className="w-20 h-20 bg-earth-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="text-slate-600 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">All caught up!</h3>
                  <p className="text-slate-500">No pending block requests to review.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="bg-earth-900 p-6 md:p-8 rounded-3xl border border-earth-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0">
                          <CalendarCheck className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-base md:text-lg font-black text-white font-display">Unit {rooms.find(r => r.id === req.roomId)?.roomNumber}</h4>
                            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                            <span className="text-slate-400 font-bold text-sm md:text-base">{users.find(u => u.uid === req.investorId)?.name}</span>
                          </div>
                          <p className="text-slate-500 font-medium text-xs md:text-sm">
                            {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500 mt-2 italic">"{req.reason}"</p>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => handleOverride(req.id, 'Rejected')}
                          className="flex-1 md:flex-none p-3 md:p-4 bg-earth-800 text-slate-500 rounded-2xl hover:bg-red-900/40 hover:text-red-400 transition-all flex justify-center"
                        >
                          <X className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button 
                          onClick={() => handleOverride(req.id, 'Approved')}
                          className="flex-1 md:flex-none p-3 md:p-4 bg-moss-600 text-white rounded-2xl hover:bg-moss-500 transition-all shadow-lg shadow-moss-900/20 flex justify-center"
                        >
                          <Check className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'bookings' ? (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-earth-900 rounded-3xl border border-earth-800 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-earth-800 border-b border-earth-800">
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Guest</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Unit</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Dates</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Total Amount</th>
                      <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-earth-800">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-earth-800/30 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-bold text-white">{users.find(u => u.uid === b.guestId)?.name || 'Unknown Guest'}</p>
                          <p className="text-xs text-slate-500">{users.find(u => u.uid === b.guestId)?.email}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold text-slate-300">Unit {rooms.find(r => r.id === b.roomId)?.roomNumber}</span>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                          {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 font-black text-moss-500">{formatCurrency(b.totalAmount)}</td>
                        <td className="px-8 py-6 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
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
          ) : null}
        </AnimatePresence>
      </main>

      {/* Create Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-earth-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-earth-900 rounded-[32px] p-10 max-w-xl w-full shadow-2xl border border-earth-800"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-white tracking-tight font-display">Register New Unit</h3>
              <button onClick={() => setShowRoomModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField 
                  label="Room Number" 
                  value={newRoom.roomNumber} 
                  onChange={v => setNewRoom({...newRoom, roomNumber: v})} 
                  placeholder="e.g., 402"
                />
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Unit Type</label>
                  <select 
                    value={newRoom.type}
                    onChange={e => setNewRoom({...newRoom, type: e.target.value})}
                    className="w-full bg-earth-800 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-moss-500 text-white"
                  >
                    <option>Studio</option>
                    <option>One Bedroom</option>
                    <option>Two Bedroom</option>
                    <option>Penthouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField 
                  label="Base Price ($)" 
                  type="number"
                  value={newRoom.basePrice.toString()} 
                  onChange={v => setNewRoom({...newRoom, basePrice: parseFloat(v)})} 
                  placeholder="250"
                />
                <InputField 
                  label="Revenue Split (0.0 - 1.0)" 
                  type="number"
                  step="0.1"
                  value={newRoom.revenueSplit.toString()} 
                  onChange={v => setNewRoom({...newRoom, revenueSplit: parseFloat(v)})} 
                  placeholder="0.7"
                />
              </div>

              <InputField 
                label="Unit Image URL" 
                value={newRoom.imageUrl} 
                onChange={v => setNewRoom({...newRoom, imageUrl: v})} 
                placeholder="https://images.unsplash.com/..."
              />

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Assign Investor</label>
                <select 
                  required
                  value={newRoom.investorId}
                  onChange={e => setNewRoom({...newRoom, investorId: e.target.value})}
                  className="w-full bg-earth-800 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-moss-500 text-white"
                >
                  <option value="">Select an investor...</option>
                  {investors.map(i => <option key={i.uid} value={i.uid}>{i.name} ({i.email})</option>)}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-moss-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-moss-500 transition-all shadow-xl shadow-moss-900/20 mt-4"
              >
                Confirm Registration
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-earth-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-earth-900 rounded-[32px] p-10 max-w-xl w-full shadow-2xl border border-earth-800"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-white tracking-tight font-display">Invite New User</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-6">
              <InputField 
                label="Full Name" 
                value={inviteData.name} 
                onChange={v => setInviteData({...inviteData, name: v})} 
                placeholder="John Doe"
              />
              <InputField 
                label="Email Address" 
                type="email"
                value={inviteData.email} 
                onChange={v => setInviteData({...inviteData, email: v})} 
                placeholder="john@example.com"
              />
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Assign Role</label>
                <select 
                  value={inviteData.role}
                  onChange={e => setInviteData({...inviteData, role: e.target.value as any})}
                  className="w-full bg-earth-800 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-moss-500 text-white"
                >
                  <option value="investor">Investor</option>
                  <option value="admin">Admin</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-moss-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-moss-500 transition-all shadow-xl shadow-moss-900/20 mt-4"
              >
                Send Invitation
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function NavButton({ icon, label, active, count, onClick }: { icon: React.ReactNode, label: string, active: boolean, count?: number, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
        active 
          ? 'bg-moss-600 text-white shadow-lg shadow-moss-900/20' 
          : 'text-slate-400 hover:bg-earth-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-earth-800 text-slate-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', step }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string, step?: string }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</label>
      <input 
        type={type}
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-earth-800 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-moss-500 placeholder:text-slate-600 text-white"
      />
    </div>
  );
}
