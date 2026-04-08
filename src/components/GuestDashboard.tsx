import React, { useState } from 'react';
import { useGuestData } from '../services/guestService';
import { useAuth } from './AuthProvider';
import { formatCurrency } from '../lib/utils';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  Hotel, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Menu, 
  X, 
  LogOut,
  Search,
  MapPin,
  Star,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, Booking } from '../types';

export default function GuestDashboard() {
  const { user } = useAuth();
  const { rooms, myBookings, loading, createBooking } = useGuestData(user?.uid);
  const [activeTab, setActiveTab] = useState<'explore' | 'bookings'>('explore');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });
  const [bookingError, setBookingError] = useState('');

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    if (!user || !bookingRoom) return;

    const start = new Date(bookingDates.start);
    const end = new Date(bookingDates.end);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      setBookingError('End date must be after start date');
      return;
    }

    const totalAmount = days * bookingRoom.basePrice;

    await createBooking({
      roomId: bookingRoom.id,
      guestId: user.uid,
      startDate: bookingDates.start,
      endDate: bookingDates.end,
      totalAmount,
      status: 'Confirmed'
    }, bookingRoom);

    setBookingRoom(null);
    setBookingDates({ start: '', end: '' });
    setActiveTab('bookings');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Hotel className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">ResortLink</span>
          </div>

          <nav className="space-y-2">
            <SidebarItem 
              icon={<Search className="w-5 h-5" />} 
              label="Explore Rooms" 
              active={activeTab === 'explore'} 
              onClick={() => setActiveTab('explore')} 
            />
            <SidebarItem 
              icon={<Calendar className="w-5 h-5" />} 
              label="My Bookings" 
              active={activeTab === 'bookings'} 
              onClick={() => setActiveTab('bookings')} 
            />
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-slate-600 font-bold">{user?.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hotel className="w-6 h-6 text-indigo-600" />
          <span className="font-black text-slate-900">ResortLink</span>
        </div>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 text-slate-600">
          {showMobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-30 bg-white pt-20 p-6"
          >
            <nav className="space-y-4">
              <SidebarItem 
                icon={<Search />} 
                label="Explore Rooms" 
                active={activeTab === 'explore'} 
                onClick={() => { setActiveTab('explore'); setShowMobileMenu(false); }} 
              />
              <SidebarItem 
                icon={<Calendar />} 
                label="My Bookings" 
                active={activeTab === 'bookings'} 
                onClick={() => { setActiveTab('bookings'); setShowMobileMenu(false); }} 
              />
              <div className="pt-4 border-t border-slate-100">
                <button 
                  onClick={() => signOut(auth)}
                  className="w-full flex items-center gap-3 p-4 text-slate-600 font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'explore' && (
          <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
            <img 
              src="https://picsum.photos/seed/resort-hero/1920/1080?blur=2" 
              alt="Hero" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            <div className="relative z-10 text-center px-4 max-w-4xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight font-display"
              >
                Experience Luxury <br /> Beyond Imagination
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-slate-100 mb-8 font-medium"
              >
                Book your exclusive stay at our world-class resort. <br className="hidden md:block" />
                Transparent, secure, and unforgettable.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <button 
                  onClick={() => {
                    const el = document.getElementById('units-grid');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
                >
                  Explore Units
                </button>
                <div className="flex items-center gap-2 text-white/80 font-bold">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>4.9/5 Guest Rating</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        <div className="p-6 md:p-12 max-w-7xl mx-auto w-full">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 font-display">
              {activeTab === 'explore' ? 'Available Units' : 'Your Bookings'}
            </h1>
            <p className="text-slate-500 text-lg">
              {activeTab === 'explore' 
                ? 'Select from our curated collection of premium resort accommodations.' 
                : 'Manage your upcoming and past resort experiences.'}
            </p>
          </header>

          {activeTab === 'explore' ? (
            <div id="units-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <motion.div 
                key={room.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img 
                    src={room.imageUrl || `https://picsum.photos/seed/${room.roomNumber}/800/600`} 
                    alt={room.type}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                    {room.type}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Unit {room.roomNumber}</h3>
                      <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>Premium Wing</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-indigo-600">{formatCurrency(room.basePrice)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">per night</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6 py-4 border-y border-slate-50">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-slate-700">4.9</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <span className="text-sm text-slate-500">Free WiFi</span>
                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                    <span className="text-sm text-slate-500">Pool Access</span>
                  </div>

                  <button 
                    onClick={() => setBookingRoom(room)}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
                <p className="text-slate-500 mb-6">Explore our available rooms and start your journey.</p>
                <button 
                  onClick={() => setActiveTab('explore')}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Browse Rooms
                </button>
              </div>
            ) : (
              myBookings.map((booking) => {
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <div key={booking.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-full md:w-32 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={room?.imageUrl || `https://picsum.photos/seed/${booking.roomId}/300/200`} 
                        alt="Room"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-xs text-slate-400">#{booking.id.slice(-6)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Unit {room?.roomNumber || '---'}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left md:text-right pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                      <p className="text-2xl font-black text-slate-900">{formatCurrency(booking.totalAmount)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingRoom(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Confirm Booking</h2>
                  <button onClick={() => setBookingRoom(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 mb-8 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden">
                    <img src={bookingRoom.imageUrl || `https://picsum.photos/seed/${bookingRoom.roomNumber}/200/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Unit {bookingRoom.roomNumber}</h3>
                    <p className="text-sm text-slate-500">{bookingRoom.type}</p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">{formatCurrency(bookingRoom.basePrice)} / night</p>
                  </div>
                </div>

                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Check In</label>
                      <input 
                        type="date" 
                        required
                        value={bookingDates.start}
                        onChange={(e) => setBookingDates(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Check Out</label>
                      <input 
                        type="date" 
                        required
                        value={bookingDates.end}
                        onChange={(e) => setBookingDates(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  {bookingError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {bookingError}
                    </div>
                  )}

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      Confirm & Pay
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
