import React, { useState } from 'react';
import { useGuestData } from '../services/guestService';
import { useAuth } from './AuthProvider';
import { useMediaQuery } from '../hooks/useMediaQuery';
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
  ArrowRight,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, Booking } from '../types';

export default function GuestDashboard() {
  const { user } = useAuth();
  const { rooms, myBookings, loading, createBooking } = useGuestData(user?.uid);
  const [activeTab, setActiveTab] = useState<'explore' | 'bookings'>('explore');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width: 768px)');
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
      <div className="min-h-screen flex items-center justify-center bg-earth-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-moss-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-950 flex flex-col md:flex-row text-white">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-earth-900 border-r border-earth-800 flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-moss-600 rounded-xl flex items-center justify-center shadow-lg shadow-moss-900/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight font-display">ZenSpace</span>
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

        <div className="mt-auto p-8 border-t border-earth-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-earth-800 rounded-full flex items-center justify-center">
              <span className="text-moss-500 font-bold">{user?.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden bg-earth-900 border-b border-earth-800 p-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-moss-500" />
          <span className="font-black text-white">ZenSpace</span>
        </div>
        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 text-slate-400">
          {showMobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-30 bg-earth-950 pt-20 p-6"
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
              <div className="pt-4 border-t border-earth-800">
                <button 
                  onClick={() => signOut(auth)}
                  className="w-full flex items-center gap-3 p-4 text-slate-400 font-bold"
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
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'explore' && (
          <div className="relative h-[350px] md:h-[500px] flex items-center justify-center overflow-hidden">
            <img 
              src="https://picsum.photos/seed/zenspace-hero/1920/1080?blur=2" 
              alt="Hero" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-earth-950/40 backdrop-blur-[2px]" />
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
                className="text-lg md:text-xl text-slate-300 mb-8 font-medium"
              >
                Book your exclusive stay at our world-class center. <br className="hidden md:block" />
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
                  className="w-full sm:w-auto bg-moss-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-moss-500 transition-all shadow-xl shadow-moss-900/20"
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
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 font-display">
              {activeTab === 'explore' ? 'Available Units' : 'Your Bookings'}
            </h1>
            <p className="text-slate-400 text-lg">
              {activeTab === 'explore' 
                ? 'Select from our curated collection of premium ZenSpace accommodations.' 
                : 'Manage your upcoming and past ZenSpace experiences.'}
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
                className="bg-earth-900 rounded-3xl border border-earth-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-moss-900/20 transition-all group"
              >
                <div className="aspect-[4/3] bg-earth-800 relative overflow-hidden">
                  <img 
                    src={room.imageUrl || `https://picsum.photos/seed/${room.roomNumber}/800/600`} 
                    alt={room.type}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-earth-950/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-moss-500 shadow-sm">
                    {room.type}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Unit {room.roomNumber}</h3>
                      <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>Premium Wing</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-moss-500">{formatCurrency(room.basePrice)}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">per night</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6 py-4 border-y border-earth-800">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-slate-300">4.9</span>
                    </div>
                    <div className="w-1 h-1 bg-earth-800 rounded-full"></div>
                    <span className="text-sm text-slate-400">Free WiFi</span>
                    <div className="w-1 h-1 bg-earth-800 rounded-full"></div>
                    <span className="text-sm text-slate-400">Pool Access</span>
                  </div>

                  <button 
                    onClick={() => setBookingRoom(room)}
                    className="w-full bg-white text-earth-950 font-bold py-4 rounded-2xl hover:bg-moss-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
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
              <div className="bg-earth-900 rounded-3xl p-12 text-center border border-dashed border-earth-800">
                <div className="w-16 h-16 bg-earth-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-earth-700" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
                <p className="text-slate-400 mb-6">Explore our available rooms and start your journey.</p>
                <button 
                  onClick={() => setActiveTab('explore')}
                  className="bg-moss-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-moss-500 transition-colors"
                >
                  Browse Rooms
                </button>
              </div>
            ) : (
              myBookings.map((booking) => {
                const room = rooms.find(r => r.id === booking.roomId);
                return (
                  <div key={booking.id} className="bg-earth-900 rounded-3xl border border-earth-800 p-6 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-full md:w-32 h-24 bg-earth-800 rounded-2xl overflow-hidden flex-shrink-0">
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
                          booking.status === 'Confirmed' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-xs text-slate-500">#{booking.id.slice(-6)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">Unit {room?.roomNumber || '---'}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
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
                    <div className="text-left md:text-right pt-4 md:pt-0 border-t md:border-t-0 border-earth-800">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                      <p className="text-2xl font-black text-white">{formatCurrency(booking.totalAmount)}</p>
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
              className="absolute inset-0 bg-earth-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-earth-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-earth-800"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-white">Confirm Booking</h2>
                  <button onClick={() => setBookingRoom(null)} className="p-2 hover:bg-earth-800 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <div className="bg-earth-800 rounded-3xl p-6 mb-8 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden">
                    <img src={bookingRoom.imageUrl || `https://picsum.photos/seed/${bookingRoom.roomNumber}/200/200`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Unit {bookingRoom.roomNumber}</h3>
                    <p className="text-sm text-slate-400">{bookingRoom.type}</p>
                    <p className="text-sm font-bold text-moss-500 mt-1">{formatCurrency(bookingRoom.basePrice)} / night</p>
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
                        className="w-full bg-earth-800 border-none rounded-2xl p-4 text-white font-medium focus:ring-2 focus:ring-moss-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Check Out</label>
                      <input 
                        type="date" 
                        required
                        value={bookingDates.end}
                        onChange={(e) => setBookingDates(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full bg-earth-800 border-none rounded-2xl p-4 text-white font-medium focus:ring-2 focus:ring-moss-500"
                      />
                    </div>
                  </div>
                  
                  {bookingError && (
                    <div className="p-3 bg-red-900/20 border border-red-900/30 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {bookingError}
                    </div>
                  )}

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-moss-600 text-white font-bold py-4 rounded-2xl hover:bg-moss-500 transition-all shadow-lg shadow-moss-900/20"
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
          ? 'bg-moss-600/10 text-moss-500' 
          : 'text-slate-400 hover:bg-earth-800 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
