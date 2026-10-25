import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Ticket, IndianRupee, Plus,
  MapPin, Calendar, ArrowRight, Activity, Eye, X, RefreshCw
} from 'lucide-react';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

// Helper to format dates cleanly
const formatAdminDate = (dateVal: string | number[] | undefined) => {
  if (!dateVal) return 'TBA';
  let d: Date;
  if (Array.isArray(dateVal)) {
    const [y, m, day, h = 0, min = 0, s = 0] = dateVal;
    d = new Date(y, m - 1, day, h, min, s);
  } else {
    d = new Date(dateVal);
  }
  if (Number.isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [previewEventId, setPreviewEventId] = useState<number | null>(null);

  // Fetch Admin Stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.admin.getStats(),
  });

  // Fetch All Events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.events.getAll(),
  });

  // NEW: Robust fetch with failsafe for Axios data wrappers
  const { data: rawSeats = [], isLoading: isSeatsLoading, refetch: refetchSeats } = useQuery({
    queryKey: ['event-seats', previewEventId],
    queryFn: async () => {
      const response = await api.seats.getForEvent(previewEventId!);
      console.log("Dashboard fetched raw seats:", response); // Look for this in F12 Console!
      return response;
    },
    enabled: !!previewEventId
  });

  // Failsafe extraction: checks if the array is hiding inside response.data
  const previewSeats = Array.isArray(rawSeats) ? rawSeats : (rawSeats?.data || []);
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-indigo-500/30">

      {/* EXECUTIVE HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="font-display text-2xl font-bold tracking-tight text-white">
              seatpulse<span className="text-indigo-500">*</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
              <Activity className="w-3.5 h-3.5" /> Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-400 hidden sm:block">
              Welcome, {user?.username || 'Admin'}
            </span>
            <button onClick={logout} className="rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-5 pt-10 lg:px-16">

        {/* STATS OVERVIEW */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-400" /> Platform Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {[
              { label: 'Total Events', value: stats?.totalEvents || 0, icon: Ticket, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { label: 'Active Bookings', value: stats?.activeBookings || 0, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { label: 'Registered Users', value: stats?.registeredUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-lg group hover:border-slate-700 transition-colors">
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">{stat.label}</p>
                  <p className="font-display text-4xl font-extrabold text-white">
                    {isLoadingStats ? '-' : stat.value}
                  </p>
                </div>
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:scale-125 transition-transform duration-500`}></div>
                <stat.icon className={`absolute top-6 right-6 w-6 h-6 ${stat.color} opacity-50`} />
              </div>
            ))}
          </div>
        </div>

        {/* EVENTS MANAGEMENT TABLE */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-400" /> Event Management
            </h2>
            <button
              onClick={() => navigate('/admin/events/new')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
            >
              <Plus className="w-4 h-4" /> Create New Event
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="hidden lg:grid grid-cols-12 gap-4 p-6 border-b border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <div className="col-span-1">ID</div>
              <div className="col-span-4">Event Details</div>
              <div className="col-span-3">Location & Venue</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-800/50">
              {isLoadingEvents ? (
                <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading events data...</div>
              ) : safeEvents.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Ticket className="w-12 h-12 text-slate-700 mb-4" />
                  <p className="text-lg font-bold text-slate-300">No events found</p>
                  <p className="text-slate-500">Create your first event to get started.</p>
                </div>
              ) : (
                safeEvents.map((event: any) => (
                  <div key={event.eventId} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 items-center hover:bg-slate-800/30 transition-colors">

                    <div className="lg:hidden text-xs font-bold text-indigo-400 mb-2">ID: #{event.eventId}</div>

                    <div className="hidden lg:block col-span-1 text-sm font-bold text-slate-400">
                      #{event.eventId}
                    </div>

                    <div className="col-span-1 lg:col-span-4">
                      <p className="text-lg font-bold text-white mb-1">{event.eventName}</p>
                      <span className="inline-block px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-indigo-500/20">
                        {event.eventCategory || 'Event'}
                      </span>
                    </div>

                    <div className="col-span-1 lg:col-span-3 flex items-start gap-2 mt-4 lg:mt-0">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{event.venue || 'TBA Venue'}</p>
                        <p className="text-xs text-slate-500">{event.location || 'Unknown City'}</p>
                      </div>
                    </div>

                    <div className="col-span-1 lg:col-span-2 mt-4 lg:mt-0">
                      <p className="text-sm font-medium text-slate-300">{formatAdminDate(event.eventStartTime)}</p>
                    </div>

                    <div className="col-span-1 lg:col-span-2 flex justify-start lg:justify-end mt-4 lg:mt-0 gap-2">
                      <button
                        onClick={() => setPreviewEventId(event.eventId)}
                        className="flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                        title="Preview Seat Map"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/admin/events/${event.eventId}/seating`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 transition-colors border border-slate-700"
                      >
                        Manage Seating <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: PREVIEW */}
      {previewEventId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" /> Seat Map Preview
              </h3>
              <div className="flex items-center gap-3">
                {/* NEW: FORCE REFRESH BUTTON */}
                <button
                  onClick={() => refetchSeats()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button
                  onClick={() => setPreviewEventId(null)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-8 flex flex-col items-center custom-scrollbar relative">
              {isSeatsLoading ? (
                <div className="flex items-center justify-center h-64 text-indigo-400 font-semibold animate-pulse">
                  Loading mapped seats...
                </div>
              ) : previewSeats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <LayoutDashboard className="w-12 h-12 mb-4 opacity-20" />
                  <p>No seats mapped for this event yet.</p>
                  <p className="text-xs mt-2 text-slate-600">Open the console (F12) to see raw data.</p>
                </div>
              ) : (
                <>
                  <div className="w-3/4 h-8 bg-slate-800 rounded-t-3xl border-t border-x border-slate-700 mb-16 flex items-center justify-center shadow-[0_-10px_30px_rgba(255,255,255,0.05)]">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Stage</span>
                  </div>

                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(10, minmax(0, 1fr))` }}
                  >
                    {previewSeats.map((seat: any, index: number) => {
                      const seatCategory = seat.seatCategory || seat.category || 'BLOCKED';
                      const isBlocked = seatCategory === 'BLOCKED';
                      const isVIP = seatCategory === 'VIP';
                      const isBalcony = seatCategory === 'BALCONY';

                      if (isBlocked) {
                        return <div key={index} className="w-10 h-10 border border-dashed border-slate-800/30 rounded-md pointer-events-none" />;
                      }

                      return (
                        <div
                          key={index}
                          className={`w-10 h-10 flex items-center justify-center text-[10px] font-bold border-b-4 rounded-t-xl rounded-b-md
                            ${isVIP ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : isBalcony ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'}`}
                           title={`${seatCategory} - ₹${seat.price || 0}`}
                        >
                          {seat.seatNo}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-16 flex flex-wrap items-center justify-center gap-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40"></div><span className="text-xs font-semibold text-slate-400">VIP</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-indigo-500/20 border border-indigo-500/40"></div><span className="text-xs font-semibold text-slate-400">Regular</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40"></div><span className="text-xs font-semibold text-slate-400">Balcony</span></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}