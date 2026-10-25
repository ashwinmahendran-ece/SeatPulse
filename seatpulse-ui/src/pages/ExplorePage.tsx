import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Ticket, ChevronDown, Check } from 'lucide-react';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';
import type { Event } from '../types';

const CATEGORIES = ['All', 'Music', 'Comedy', 'Theater', 'Sports', 'Tech'];

const TAMIL_NADU_CITIES = [
  'Chennai', 'Coimbatore', 'Cuddalore', 'Dindigul', 'Erode',
  'Hosur', 'Kanchipuram', 'Kanyakumari', 'Karaikudi', 'Karur',
  'Kumbakonam', 'Madurai', 'Nagapattinam', 'Nagercoil', 'Neyveli',
  'Ooty (Udhagamandalam)', 'Pollachi', 'Pudukkottai', 'Rajapalayam',
  'Ranipet', 'Salem', 'Sivakasi', 'Thanjavur', 'Thoothukudi',
  'Tiruchirappalli (Trichy)', 'Tirunelveli', 'Tiruppur', 'Tiruvannamalai',
  'Vellore'
];

const CATEGORY_IMAGES: Record<string, string> = {
  Music: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
  Comedy: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=800',
  Theater: 'https://images.unsplash.com/photo-1507676184212-d0330a15233c?auto=format&fit=crop&q=80&w=800',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
  Tech: 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800',
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

export default function ExplorePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocation, setActiveLocation] = useState('Everywhere');
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  const { data: rawEvents, isLoading, error } = useQuery({
    queryKey: ['events', activeCategory],
    queryFn: () => api.events.getAll(activeCategory === 'All' ? '' : activeCategory),
  });

  const safeEvents = Array.isArray(rawEvents) ? rawEvents : [];

  // Use the static array for the dropdown options
  const dropdownLocations = ['Everywhere', ...TAMIL_NADU_CITIES];

  const filteredEvents = safeEvents.filter((e: any) => {
    const matchesSearch = e.eventName.toLowerCase().includes(searchQuery.toLowerCase());
    const eventCity = e.location || '';
    const matchesLocation = activeLocation === 'Everywhere' || eventCity === activeLocation;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 selection:bg-indigo-500/30 font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <button onClick={() => navigate('/')} className="font-display text-2xl font-bold tracking-tight text-white">
            seatpulse<span className="text-indigo-500">*</span>
          </button>

          <div className="flex items-center gap-6">

            {/* CUSTOM LOCATION DROPDOWN */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/50 px-5 py-2 transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900"
              >
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">
                  {activeLocation}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isLocationMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLocationMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLocationMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full z-50 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/95 shadow-2xl backdrop-blur-xl animate-fade-in-down">
                    <div className="max-h-80 overflow-y-auto p-2 hide-scrollbar">
                      <div className="mb-2 px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Select City
                      </div>
                      {dropdownLocations.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setActiveLocation(loc);
                            setIsLocationMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                            activeLocation === loc
                              ? 'bg-indigo-600/10 text-indigo-400'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {loc}
                          {activeLocation === loc && <Check className="h-4 w-4 text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === 'ADMIN' && (
                  <button onClick={() => navigate('/admin')} className="rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition border border-indigo-500/20">
                    Admin
                  </button>
                )}
                <button onClick={() => navigate('/profile')} className="text-sm font-semibold text-slate-300 hover:text-indigo-400 transition">
                  My Tickets
                </button>
                <button onClick={logout} className="rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
                  Log Out
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-colors">
                Log In
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div className="mx-auto w-full max-w-[1440px] overflow-x-auto px-5 pb-4 hide-scrollbar lg:px-16 relative z-10 mt-4 sm:mt-0">
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeCategory === c
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pt-10 lg:px-16">

        {/* HERO SEARCH AREA */}
        <div className="mb-12 max-w-3xl">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-white mb-6">
            Find your event.
          </h1>
          <div className="relative flex items-center w-full max-w-2xl group">
            <Search className="absolute left-5 h-6 w-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search for events, artists, or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-800 bg-slate-900 py-4 pl-14 pr-4 text-lg font-medium text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-lg"
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-red-400 font-medium">
            Failed to load events. Please try refreshing the page.
          </div>
        )}

        {/* EVENT GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3 rounded-2xl">
                <div className="h-56 w-full rounded-2xl bg-slate-900"></div>
                <div className="flex gap-4 px-2 mt-2">
                  <div className="w-10 h-12 bg-slate-900 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-slate-900 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-900 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
              <Ticket className="w-16 h-16 mb-4 text-slate-700" />
              <h3 className="text-xl font-bold text-slate-300">No events found</h3>
              <p className="mt-2 text-slate-400">
                {activeLocation !== 'Everywhere'
                  ? `No events are happening in ${activeLocation} at the time.`
                  : 'Try adjusting your search or category filter.'}
              </p>
            </div>
          ) : (
            filteredEvents.map((event: any) => {
              const d = parseDate(event.eventStartTime);
              const eventCity = event.location || 'Unknown City';
              const eventVenue = event.venue || 'TBA Venue';

              return (
                <button
                  key={event.eventId}
                  onClick={() => navigate(`/event/${event.eventId}`, { state: { event } })}
                  className="group flex flex-col text-left transition-all duration-300 hover:-translate-y-1 focus:outline-none"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-lg group-hover:border-indigo-500/50 group-hover:shadow-[0_8px_30px_rgba(79,70,229,0.15)] transition-all">
                    <img
                      src={getEventImage(event.eventCategory)}
                      alt={event.eventName}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    {event.eventCategory && (
                      <div className="absolute top-3 left-3 rounded-md bg-slate-950/80 backdrop-blur-md border border-slate-800 px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-300 shadow-sm">
                        {event.eventCategory}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-4 px-1">
                    <div className="flex flex-col items-center justify-start min-w-[3rem] pt-1">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{getMonth(d)}</span>
                      <span className="text-2xl font-extrabold text-slate-100 leading-none mt-0.5">{getDay(d)}</span>
                    </div>

                    <div className="flex flex-col">
                      <h3 className="font-display text-xl font-bold text-slate-100 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {event.eventName}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-400">
                        {getDetails(d)}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-600" />
                        <span className="truncate">{eventVenue}, {eventCity}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}