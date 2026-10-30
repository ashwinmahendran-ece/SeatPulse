import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Ticket, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

const CATEGORIES = ['All', 'Music', 'Comedy', 'Theater', 'Sports', 'Tech'];

const TAMIL_NADU_CITIES = [
  'Chennai', 'Coimbatore', 'Cuddalore', 'Dindigul', 'Erode',
  'Hosur', 'Kanchipuram', 'Kanyakumari', 'Karaikudi', 'Karur',
  'Kumbakonam', 'Madurai', 'Nagapattinam', 'Nagercoil', 'Neyveli',
  'Ooty', 'Pollachi', 'Pudukkottai', 'Rajapalayam',
  'Ranipet', 'Salem', 'Sivakasi', 'Thanjavur', 'Thoothukudi',
  'Tiruchirappalli (Trichy)', 'Tirunelveli', 'Tiruppur', 'Tiruvannamalai',
  'Vellore'
];

const CATEGORY_IMAGES: Record<string, string> = {
  Music: 'https://images6.alphacoders.com/478/thumb-1920-478918.jpg',
  Comedy: 'https://media.istockphoto.com/id/827698600/photo/dark-empty-stage-with-microphone-3d-render.jpg?s=612x612&w=0&k=20&c=vey5jZz8dYxauIhm3WaNEhHCcpxX4eI9-a0DidbzHMU=',
  Theater: 'https://img.magnific.com/free-photo/rows-red-seats-theater_53876-64710.jpg?semt=ais_hybrid&w=740&q=80',
  Sports: 'https://i.pinimg.com/736x/86/5c/64/865c64b0b63a33036c40f40b4f9a5a93.jpg',
  Tech: 'https://i.pinimg.com/736x/00/08/06/0008069a050ade9ecf214d6ddd18021d.jpg',
  Default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
};

const getEventImage = (category?: string) => {
  return (category && CATEGORY_IMAGES[category]) || CATEGORY_IMAGES.Default;
};

const parseDate = (dateVal: string | number[] | undefined) => {
  if (!dateVal) return new Date();
  if (Array.isArray(dateVal)) {
    const [y, m, day, h = 0, min = 0, s = 0] = dateVal;
    return new Date(y, m - 1, day, h, min, s);
  }
  return new Date(dateVal);
};

const getMonth = (d: Date) => d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
const getDay = (d: Date) => d.toLocaleString('en-US', { day: '2-digit' });
const getDetails = (d: Date) => d.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });

// Helper to decode role securely on page refresh
const getRoleFromToken = () => {
  try {
    const token = localStorage.getItem('seatpulse_jwt');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || payload.roles || payload.authorities || null;
  } catch (e) { return null; }
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthStore();

  const [activeLocation, setActiveLocation] = useState(() => localStorage.getItem('seatpulse_location') || 'Everywhere');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isAnimatingText, setIsAnimatingText] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => setVisibleCount(12), [searchQuery, activeCategory, activeLocation]);

  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['events', activeCategory],
    queryFn: () => api.events.getAll(activeCategory, 0, 100),
  });

  const rawEvents = eventData?.content || [];
  const dropdownLocations = ['Everywhere', ...TAMIL_NADU_CITIES];

  const filteredEvents = rawEvents.filter((e: any) => {
    const matchesSearch = (e.eventName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = activeLocation === 'Everywhere' || (e.location || '') === activeLocation;
    return matchesSearch && matchesLocation;
  });

  const displayedEvents = filteredEvents.slice(0, visibleCount);

  const handleLocationSelect = (loc: string) => {
    if (loc === activeLocation) {
      setIsLocationMenuOpen(false);
      return;
    }
    setIsAnimatingText(true);
    setTimeout(() => {
      setActiveLocation(loc);
      localStorage.setItem('seatpulse_location', loc);
      setIsAnimatingText(false);
    }, 150);
    setTimeout(() => setIsLocationMenuOpen(false), 400);
  };

  const handleLogout = () => {
    localStorage.removeItem('seatpulse_location');
    logout();
    navigate('/login');
  };

  // ROBUST ADMIN CHECK
  const tokenRole = getRoleFromToken();
  const isAdmin = String(user?.role).includes('ADMIN') ||
                  String(user?.roles).includes('ADMIN') ||
                  String(tokenRole).includes('ADMIN');

  return (
    <div className="min-h-screen bg-[#07090E] pb-24 font-sans text-white overflow-x-hidden selection:bg-[#E8D5B5]/30 selection:text-white">
      <style>{`
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(20px) scale(0.99); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-stagger-card { animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        @keyframes slideInLeftCenter { 0% { opacity: 0; transform: translateX(-60px) scale(0.98); } 100% { opacity: 1; transform: translateX(0) scale(1); } }
        .animate-page-slide { animation: slideInLeftCenter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes sweepToCenter { 0% { left: -20%; transform: translate(0, -50%) scale(0.9); opacity: 0; } 100% { left: 50%; transform: translate(-50%, -50%) scale(1); opacity: 1; } }
        .animate-logo-sweep { position: absolute; top: 50%; animation: sweepToCenter 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090E]/90 backdrop-blur-md shadow-none">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-end px-5 lg:px-16 relative">

          <button onClick={() => navigate('/')} className="animate-logo-sweep flex items-center font-display text-2xl md:text-[28px] font-black tracking-[-0.03em] whitespace-nowrap z-10 transition-transform hover:scale-[1.02]">
            <span className="text-white">Seat</span>
            <span className="text-[#E8D5B5] ml-1.5">Pulse</span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4 relative z-20">
            <div className="relative hidden sm:block">
              <button onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#11131A] px-4 py-2 transition-all duration-300 hover:border-[#E8D5B5] hover:bg-[#161922]">
                <MapPin className="h-4 w-4 text-[#E8D5B5]" />
                <div className="relative overflow-hidden h-5 w-[90px] flex items-center">
                  <span className={`absolute text-sm font-bold text-white transition-all duration-200 ease-in-out w-full text-left ${isAnimatingText ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                    {activeLocation}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isLocationMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-[1.2rem] border border-white/10 bg-[#11131A] transition-all duration-200 ${isLocationMenuOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
                  <div className="mb-1 px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Select City</div>
                  {dropdownLocations.map((loc) => {
                    const isSelected = activeLocation === loc;
                    return (
                      <button key={loc} onClick={() => handleLocationSelect(loc)} className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 ${isSelected ? 'bg-[#E8D5B5] text-[#07090E]' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                        <span>{loc}</span>
                        {isSelected && <Check className="h-4 w-4 text-[#07090E]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button onClick={() => navigate('/admin')} className="flex items-center justify-center rounded-lg bg-[#E8D5B5]/10 px-3 py-2 text-xs font-bold text-[#E8D5B5] hover:bg-[#E8D5B5]/20 transition-all border border-[#E8D5B5]/20">Admin</button>
                )}
                <button onClick={() => navigate('/profile')} className="flex items-center justify-center rounded-lg px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">My Tickets</button>
                <button onClick={handleLogout} className="flex items-center justify-center rounded-lg border border-white/20 bg-transparent px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all">Log Out</button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="rounded-lg bg-[#E8D5B5] text-[#07090E] px-5 py-2 text-xs font-bold hover:bg-[#D6C09D] transition-all hover:-translate-y-0.5">Log In</button>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1440px] overflow-x-auto px-5 pb-3 custom-scrollbar lg:px-16 relative z-10 mt-2 sm:mt-0">
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all duration-300 active:scale-95 ${activeCategory === c ? 'bg-[#E8D5B5] text-[#07090E]' : 'bg-[#11131A] text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pt-8 lg:px-16 animate-page-slide">

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-full">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Find your <span className="font-serif italic font-light tracking-wide text-[#E8D5B5]">event.</span>
          </h1>

          <div className="relative flex items-center w-full md:max-w-md group">
            <Search className="absolute left-4 h-4 w-4 text-slate-500 group-focus-within:text-[#E8D5B5] transition-colors" />
            <input type="text" placeholder="Search events, artists..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-[1.5rem] border border-white/10 bg-[#11131A] py-3 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-[#E8D5B5]" />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 font-bold">
            Failed to load events. Please try refreshing the page.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            [...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3 rounded-2xl bg-[#11131A] p-3 border border-white/5">
                <div className="h-48 w-full rounded-xl bg-white/5"></div>
                <div className="flex gap-3 px-2 mt-2">
                  <div className="w-10 h-12 bg-white/5 rounded-lg"></div>
                  <div className="flex-1 space-y-2 mt-1">
                    <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                    <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : displayedEvents.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center animate-stagger-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#11131A] border border-white/10 mb-4">
                <Ticket className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">No events found</h3>
              <p className="mt-2 text-sm font-medium text-slate-400 max-w-sm">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            displayedEvents.map((event: any, i: number) => {
              const d = parseDate(event.eventStartTime);
              return (
                <button
                  key={event.eventId} onClick={() => navigate(`/event/${event.eventId}`, { state: { event } })}
                  className="animate-stagger-card group flex flex-col text-left transition-all duration-300 hover:-translate-y-2 focus:outline-none rounded-2xl border border-white/10 bg-[#11131A] p-3 hover:border-[#E8D5B5]"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#1A1D24]">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300 z-10"></div>
                    <img src={getEventImage(event.eventCategory)} alt={event.eventName} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {event.eventCategory && (
                      <div className="absolute top-3 left-3 z-20 rounded-full bg-[#07090E] border border-white/20 px-3 py-1 text-[10px] font-bold text-[#E8D5B5] uppercase tracking-wider">
                        {event.eventCategory}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex gap-4 px-2 pb-2">
                    <div className="flex flex-col items-center justify-start min-w-[3rem] pt-0.5">
                      <span className="text-[10px] font-bold text-[#E8D5B5] uppercase tracking-widest">{getMonth(d)}</span>
                      <span className="font-display text-2xl font-black text-white leading-none mt-1">{getDay(d)}</span>
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="font-display text-lg font-bold text-white line-clamp-1 group-hover:text-[#E8D5B5] transition-colors leading-tight mb-1.5">{event.eventName}</h3>
                      <p className="text-xs font-medium text-slate-400 mb-2">{getDetails(d)}</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-[#E8D5B5]" />
                        <span className="truncate">{event.venue || 'TBA Venue'}, {event.location || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto px-2 pb-1 flex justify-end">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all duration-300 group-hover:bg-[#E8D5B5] group-hover:border-[#E8D5B5] group-hover:text-[#07090E]">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {!isLoading && visibleCount < filteredEvents.length && (
          <div className="mt-12 flex justify-center">
            <button onClick={() => setVisibleCount(prev => prev + 12)} className="rounded-[1rem] border border-white/10 bg-[#11131A] px-8 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-[#E8D5B5] active:scale-95">
              Load More Events
            </button>
          </div>
        )}
      </main>
    </div>
  );
}