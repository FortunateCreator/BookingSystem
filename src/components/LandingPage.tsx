import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Leaf, Wind, Sparkles, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

export default function LandingPage({ onDashboardClick }: { onDashboardClick: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const benefits = [
    {
      icon: <Leaf className="w-6 h-6 text-moss-500" />,
      title: "Nature Immersion",
      desc: "Connect with the earth in our curated garden sanctuaries."
    },
    {
      icon: <Wind className="w-6 h-6 text-sky-400" />,
      title: "Breathwork Mastery",
      desc: "Guided sessions to unlock your inner vitality and calm."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: "Spiritual Growth",
      desc: "Workshops designed to expand your consciousness."
    }
  ];

  return (
    <div className="min-h-screen bg-earth-950 text-white selection:bg-moss-500/30 overflow-x-hidden font-sans">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-moss-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-earth-800/10 blur-[150px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-moss-900/10 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-moss-600 rounded-xl flex items-center justify-center shadow-lg shadow-moss-900/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter font-display">ZENSPACE</span>
        </div>

        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-3 bg-earth-900/50 hover:bg-earth-800 rounded-2xl transition-all border border-earth-800"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-moss-500/10 border border-moss-500/20 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-moss-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-moss-500">Now Open in Rwanda</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 font-display">
              FIND YOUR <br />
              <span className="text-moss-500">INNER STILLNESS.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-12 leading-relaxed">
              Experience a sanctuary designed for profound transformation. Our meditation center combines ancient wisdom with modern comfort to guide you home to yourself.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <button 
                  onClick={onDashboardClick}
                  className="px-8 py-4 bg-moss-600 hover:bg-moss-500 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-moss-900/20"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="px-8 py-4 bg-moss-600 hover:bg-moss-500 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-moss-900/20"
                >
                  Begin Your Journey
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button className="px-8 py-4 bg-earth-900/50 hover:bg-earth-800 text-white rounded-2xl font-bold transition-all border border-earth-800">
                Explore Programs
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mt-12 lg:mt-0"
          >
            <div className="aspect-video lg:aspect-square rounded-[32px] lg:rounded-[40px] overflow-hidden border border-earth-800 shadow-2xl relative group">
              <img 
                src="https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=1000" 
                alt="Meditation Space" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-earth-950 via-transparent to-transparent opacity-60" />
            </div>
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 p-4 lg:p-6 bg-earth-900/80 backdrop-blur-xl border border-earth-800 rounded-2xl lg:rounded-3xl shadow-2xl">
              <p className="text-2xl lg:text-3xl font-black text-white">500+</p>
              <p className="text-[10px] lg:text-xs font-bold text-moss-500 uppercase tracking-widest">Lives Transformed</p>
            </div>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <div className="mt-40 grid md:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 bg-earth-900/50 border border-earth-800 rounded-[32px] hover:bg-earth-900 transition-all group"
            >
              <div className="w-14 h-14 bg-earth-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {b.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{b.title}</h3>
              <p className="text-slate-400 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-earth-950 p-6 md:p-12 flex flex-col"
          >
            <div className="flex items-center justify-between mb-20">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-moss-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter font-display">ZENSPACE</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-3 bg-earth-900/50 hover:bg-earth-800 rounded-2xl transition-all border border-earth-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              <MenuLink label="Our Story" href="#" />
              <MenuLink label="Programs" href="#" />
              <MenuLink label="Investors" onClick={() => { setIsMenuOpen(false); onDashboardClick(); }} />
              <MenuLink label="Contact" href="#" />
            </div>

            <div className="mt-auto pt-12 border-t border-earth-800 flex flex-col md:flex-row justify-between gap-8">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Location</p>
                <p className="text-lg">Kigali, Rwanda</p>
              </div>
              <div className="flex gap-6">
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                    <button 
                      onClick={() => auth.signOut()}
                      className="p-3 bg-earth-900/50 hover:bg-red-900/20 hover:text-red-400 rounded-2xl transition-all border border-earth-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-6 py-3 bg-moss-600 rounded-xl font-bold hover:bg-moss-500 transition-all"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({ label, href, onClick }: { label: string, href?: string, onClick?: () => void }) {
  return (
    <a 
      href={href} 
      onClick={(e) => { if (onClick) { e.preventDefault(); onClick(); } }}
      className="text-4xl md:text-7xl font-black tracking-tighter hover:text-moss-500 transition-colors font-display"
    >
      {label}
    </a>
  );
}
