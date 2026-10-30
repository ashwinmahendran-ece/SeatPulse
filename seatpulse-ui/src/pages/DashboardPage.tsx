import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Ticket, IndianRupee, Plus,
  MapPin, Calendar, ArrowRight, Activity, Eye, X, RefreshCw, BarChart3, Loader2
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

// Helper to convert row index to alphabet (0 = A, 1 = B)
const getRowLabel = (index: number) => {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [previewEventId, setPreviewEventId] = useState<number | null>(null);

  const COLS = 15; // Match the builder's default column count

  // Fetch Admin Stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.admin.getStats(),
  });

  // Fetch Events
  const { data: eventData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.events.getAll('', 0, 100),
  });

  const safeEvents = eventData?.content || [];

  const { data: rawSeats = [], isLoading: isSeatsLoading, refetch: refetchSeats } = useQuery({
    queryKey: ['event-seats', previewEventId],
    queryFn: async () => {
      const response = await api.seats.getForEvent(previewEventId!);
      return response;
    },
    enabled: !!previewEventId
  });

  const previewSeats = Array.isArray(rawSeats) ? rawSeats : (rawSeats?.data || []);

  // Group rows for BookMyShow style preview
  const groupedRows: { category: string, price: number, rows: any[] }[] = [];
  if (previewSeats.length > 0) {
    let currentGroup: any = null;
    const numRows = Math.ceil(previewSeats.length / COLS) || 10;

    Array.from({ length: numRows }).forEach((_, r) => {
      const rowSeats = previewSeats.slice(r * COLS, (r + 1) * COLS);
      const firstValidSeat = rowSeats.find((s: any) => (s.seatCategory || s.category) !== 'BLOCKED');

      const rowCat = firstValidSeat?.seatCategory || firstValidSeat?.category || (currentGroup ? currentGroup.category : 'REGULAR');
      const rowPrice = firstValidSeat?.price || (currentGroup ? currentGroup.price : 0);

      const rowDataObj = {
        rowIndex: r,
        rowLabel: getRowLabel(r),
        seats: rowSeats,
      };

      if (!currentGroup || currentGroup.category !== rowCat) {
        currentGroup = { category: rowCat, price: rowPrice, rows: [] };
        groupedRows.push(currentGroup);
      }
      currentGroup.rows.push(rowDataObj);
    });
  }

  // Minimal empty box styling
  const getPreviewSeatColor = (category: string, status: string) => {
    if (status === 'BOOKED') return 'bg-transparent border border-slate-700 text-slate-600 opacity-50';
    return 'bg-transparent border border-slate-400 text-slate-300';
  };

  // FIX: Properly handle logout AND redirection
  const handleLogout = () => {
    logout();
    localStorage.removeItem('seatpulse_jwt'); // Extra safety measure
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1A1C1E] text-slate-100 font-sans pb-24 selection:bg-indigo-500/30">

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1F2124]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center font-display text-xl font-black tracking-[-0.03em] whitespace-nowrap transition-transform hover:scale-[1.02]">
              <span className="text-white">Seat</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-[#05d5ff] ml-1">Pulse</span>
              <span className="text-indigo-500 animate-pulse ml-0.5">*</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
              <Activity className="w-3.5 h-3.5" /> Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-400 hidden sm:block">
              Welcome, <span className="text-white">{user?.username || 'Admin'}</span>
            </span>
            {/* FIX: Call handleLogout instead of raw logout */}
            <button onClick={handleLogout} className="rounded-lg border border-white/10 bg-[#1A1C1E] px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white hover:text-[#1A1C1E] transition-all">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-5 pt-10 lg:px-16 animate-in fade-in slide-in-from-bottom-8 duration-500">

        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" /> Platform Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {[
              { label: 'Total Events', value: stats?.totalEvents || 0, icon: Ticket, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { label: 'Active Bookings', value: stats?.activeBookings || 0, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { label: 'Registered Users', value: stats?.registeredUsers || 0, icon: Users, color: 'text-[#05d5ff]', bg: 'bg-[#05d5ff]/10' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#1F2124] border border-white/10 p-6 rounded-[2rem] relative overflow-hidden shadow-xl group hover:border-white/20 transition-colors backdrop-blur-sm">
                <div className="relative z-10">
                  <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">{stat.label}</p>
                  <p className="font-display text-4xl font-extrabold text-white">
                    {isLoadingStats ? <Loader2 className="w-8 h-8 animate-spin text-indigo-400" /> : stat.value}
                  </p>
                </div>
                <div className={`absolute -bottom-4 -right-4 w-28 h-28 rounded-full ${stat.bg} blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
                <stat.icon className={`absolute top-6 right-6 w-6 h-6 ${stat.color} opacity-40`} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-400" /> Event Management
            </h2>
            <button
              onClick={() => navigate('/admin/events/new')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create New Event
            </button>
          </div>

          <div className="bg-[#1F2124] border border-white/10 rounded-[2rem] overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="hidden lg:grid grid-cols-12 gap-4 p-6 border-b border-white/10 bg-[#1A1C1E]/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-1">ID</div>
              <div className="col-span-4">Event Details</div>
              <div className="col-span-3">Location & Venue</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-white/5">
              {isLoadingEvents ? (
                <div className="p-16 flex flex-col items-center justify-center text-indigo-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <span className="text-sm font-bold text-slate-400">Syncing events from server...</span>
                </div>
              ) : safeEvents.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 mb-6 border border-white/10">
                    <Ticket className="w-10 h-10 text-slate-500" />
                  </div>
                  <p className="font-display text-2xl font-bold text-white mb-2">No events found</p>
                  <p className="text-sm font-medium text-slate-400">Create your first event to get started.</p>
                </div>
              ) : (
                safeEvents.map((event: any) => (
                  <div key={event.eventId} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 items-center hover:bg-white/5 transition-colors group">

                    <div className="lg:hidden text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-widest">ID: #{event.eventId}</div>

                    <div className="hidden lg:block col-span-1 text-xs font-bold text-slate-500">
                      #{event.eventId}
                    </div>

                    <div className="col-span-1 lg:col-span-4">
                      <p className="text-lg font-bold text-white mb-1.5 group-hover:text-indigo-400 transition-colors">{event.eventName}</p>
                      <span className="inline-block px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded border border-indigo-500/20">
                        {event.eventCategory || 'Event'}
                      </span>
                    </div>

                    <div className="col-span-1 lg:col-span-3 flex items-start gap-2 mt-4 lg:mt-0">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{event.venue || 'TBA Venue'}</p>
                        <p className="text-xs font-medium text-slate-500">{event.location || 'Unknown City'}</p>
                      </div>
                    </div>

                    <div className="col-span-1 lg:col-span-2 mt-4 lg:mt-0 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500 lg:hidden" />
                      <p className="text-sm font-medium text-slate-300">{formatAdminDate(event.eventStartTime)}</p>
                    </div>

                    <div className="col-span-1 lg:col-span-2 flex justify-start lg:justify-end mt-6 lg:mt-0 gap-3">
                      <button
                        onClick={() => setPreviewEventId(event.eventId)}
                        className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#1A1C1E] hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
                        title="Preview Seat Map"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/admin/events/${event.eventId}/seating`)}
                        className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1A1C1E] hover:bg-indigo-600 hover:border-indigo-500 text-xs font-bold text-slate-300 hover:text-white transition-colors border border-white/10"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1F2124] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#1A1C1E] z-10">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" /> Seat Map Preview
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => refetchSeats()}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync
                </button>
                <div className="w-px h-4 bg-white/10"></div>
                <button
                  onClick={() => setPreviewEventId(null)}
                  className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative bg-[#1A1C1E]/50">
              {isSeatsLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-indigo-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <span className="text-sm font-bold">Rendering map...</span>
                </div>
              ) : previewSeats.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">
                    <LayoutDashboard className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-bold text-white">No seats mapped</p>
                  <p className="text-sm mt-1">Open the Seating Builder to design the layout.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">

                  {/* Left Side: Scrollable Grid Area (BookMyShow Layout) */}
                  <div className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col items-center custom-scrollbar">

                    <div className="w-3/4 max-w-sm h-8 bg-[#1F2124] rounded-t-3xl border-t border-x border-white/10 mb-12 flex items-center justify-center shadow-[0_-10px_30px_rgba(255,255,255,0.02)] shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stage</span>
                    </div>

                    <div className="flex flex-col w-full max-w-4xl px-2 pb-16">
                      {groupedRows.map((group, gIdx) => (
                        <div key={gIdx} className="w-full mb-8 relative">

                          {/* Natural Scrolling Category Divider */}
                          <div className="w-full py-3 mb-4 flex justify-center items-center">
                            <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">
                              {group.category} : ₹{group.price}
                            </h3>
                          </div>

                          {/* Rows */}
                          <div className="flex flex-col gap-1.5 sm:gap-2">
                            {group.rows.map((row) => (
                              <div key={row.rowIndex} className="flex items-center gap-3 sm:gap-4 w-full justify-center my-0.5">

                                <div className="w-4 sm:w-6 text-right text-[10px] font-black text-slate-500 uppercase">{row.rowLabel}</div>

                                <div className="flex gap-1 sm:gap-1.5">
                                  {row.seats.map((seat: any, c: number) => {
                                    const status = String(seat.seatStatus || seat.status || 'AVAILABLE').toUpperCase();
                                    const category = String(seat.seatCategory || seat.category).toUpperCase();
                                    const isBlocked = category === 'BLOCKED';

                                    return (
                                      <div
                                        key={c}
                                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-[4px] flex items-center justify-center text-[7px] sm:text-[9px] font-bold
                                          ${isBlocked ? 'border border-dashed border-slate-700/50 bg-transparent cursor-default pointer-events-none' : getPreviewSeatColor(category, status)}
                                        `}
                                      >
                                        {!isBlocked && String(seat.seatNo || '').replace(/[^0-9A-Za-z]/g, '')}
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="w-4 sm:w-6 text-left text-[10px] font-black text-slate-500 uppercase hidden md:block">{row.rowLabel}</div>

                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Right Side: Minimal Legend */}
                  <div className="w-full lg:w-56 bg-[#1F2124] p-6 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col flex-shrink-0 z-10">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Seat Legend</h4>
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-[4px] bg-transparent border border-slate-400"></div>
                        <span className="text-xs font-bold text-slate-300 tracking-wider">Available</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-[4px] bg-transparent border border-slate-700 opacity-50"></div>
                        <span className="text-xs font-bold text-slate-500 tracking-wider">Booked</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-[4px] border border-dashed border-slate-700 opacity-50"></div>
                        <span className="text-xs font-bold text-slate-500 tracking-wider">Walkway / Empty</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}