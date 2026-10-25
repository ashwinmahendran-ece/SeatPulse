import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Ticket, Calendar, MapPin, CheckCircle2, Clock, User, X } from 'lucide-react';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

const formatTicketDate = (dateVal: string | number[] | undefined) => {
  if (!dateVal) return '';
  let d: Date;
  if (Array.isArray(dateVal)) {
    const [y, m, day, h = 0, min = 0, s = 0] = dateVal;
    d = new Date(y, m - 1, day, h, min, s);
  } else {
    d = new Date(dateVal);
  }
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // NEW: State to control the ID Card Modal
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.user.getMyBookings(),
  });

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-indigo-500/30">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors font-semibold">
            <ArrowLeft className="w-5 h-5" /> Back to Events
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-200">{user?.username || 'User'}</span>
            </div>
            <button onClick={logout} className="rounded-full border border-slate-700 bg-slate-900 px-5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pt-10 lg:px-16">

        {/* PAGE TITLE & TABS */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white mb-2">
              My Tickets
            </h1>
            <p className="text-slate-400">Manage your upcoming events and past memories.</p>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'upcoming' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'past' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-900/20 p-4 text-red-400 font-medium">
            Failed to load your tickets. Please try refreshing the page.
          </div>
        )}

        {/* TICKET LIST */}
        <div className="flex flex-col gap-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-40 w-full rounded-2xl bg-slate-900 border border-slate-800"></div>
            ))
          ) : safeBookings.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6">
                <Ticket className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-300 mb-2">No tickets found</h3>
              <p className="text-slate-400 mb-6">Looks like you haven't booked any {activeTab} events yet.</p>
              <button onClick={() => navigate('/explore')} className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all">
                Browse Events
              </button>
            </div>
          ) : (
            safeBookings.map((booking: any, index: number) => {
              const uniqueKey = booking.bookingId || booking.seatId || booking.eventId || index;

              const eventCity = booking.location || 'Unknown City';
              const eventVenue = booking.venue || 'TBA Venue';
              const eventName = booking.eventName || 'Unnamed Event';
              const eventCategory = booking.eventCategory || 'Event';
              const startTime = booking.eventStartTime;

              const seats = booking.seats || (booking.seatRow ? [booking] : []);
              const isConfirmed = booking.status === 'CONFIRMED' || booking.seatStatus === 'BOOKED' || !booking.status;

              // Generate dynamic QR Code URL based on the unique booking ID
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SEATPULSE-${uniqueKey}-${eventName.replace(/\s+/g, '')}`;

              return (
                <div
                  key={uniqueKey}
                  onClick={() => setSelectedTicket({ ...booking, uniqueKey, qrCodeUrl, eventName, eventCity, eventVenue, eventCategory, startTime, seats, isConfirmed })}
                  className="group flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgba(79,70,229,0.2)] transition-all cursor-pointer"
                >
                  <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between relative">
                    <div className="absolute top-0 right-0 p-6 md:hidden">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        isConfirmed
                          ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                          : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                      }`}>
                        {isConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {isConfirmed ? 'CONFIRMED' : 'PENDING'}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                          {eventCategory}
                        </span>
                        <span className="text-slate-500 text-sm font-medium">ID: #{String(uniqueKey).substring(0,8)}</span>
                      </div>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {eventName}
                      </h3>

                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6">
                        <div className="flex items-start gap-3 text-slate-300">
                          <Calendar className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold">{formatTicketDate(startTime)}</p>
                            <p className="text-xs text-slate-500 mt-1">Doors open 1hr before</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-slate-300">
                          <MapPin className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold">{eventVenue}</p>
                            <p className="text-xs text-slate-500 mt-1">{eventCity}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800/80">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Your Seats</p>
                      <div className="flex flex-wrap gap-2">
                        {seats.length > 0 ? seats.map((seat: any, idx: number) => (
                          <span key={idx} className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-700">
                            {seat.seatRow || 'Row'}{seat.seatNumber || 'Seat'}
                          </span>
                        )) : (
                          <span className="text-sm text-slate-500 italic">General Admission</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Generated QR Code */}
                  <div className="md:w-72 bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 border-dashed relative flex flex-col items-center justify-center p-8 group-hover:bg-slate-900/50 transition-colors">
                    <div className="hidden md:block absolute -top-4 -left-4 w-8 h-8 bg-slate-950 rounded-full border-b border-r border-slate-800 transform rotate-45"></div>
                    <div className="hidden md:block absolute -bottom-4 -left-4 w-8 h-8 bg-slate-950 rounded-full border-t border-r border-slate-800 transform -rotate-45"></div>

                    <div className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-8 ${
                      isConfirmed
                        ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                        : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    }`}>
                      {isConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {isConfirmed ? 'CONFIRMED' : 'PENDING'}
                    </div>

                    {/* DYNAMIC QR CODE IMAGE */}
                    <div className="bg-white p-2 rounded-xl mb-4 shadow-lg transform group-hover:scale-105 transition-transform">
                      <img src={qrCodeUrl} alt="Ticket QR" className="w-24 h-24 object-contain" />
                    </div>
                    <p className="text-xs font-medium text-slate-500 tracking-wider flex items-center gap-1">
                      Click to expand <ArrowLeft className="w-3 h-3 rotate-180" />
                    </p>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </main>

      {/* NEW: VIP ID CARD MODAL */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedTicket(null)}
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden transform scale-100 animate-slide-up"
            onClick={e => e.stopPropagation()} // Prevent clicks inside from closing it
          >

            {/* Lanyard Hole visual (just for aesthetics) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-3 bg-slate-950 rounded-full border border-slate-800 shadow-inner"></div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Section */}
            <div className="bg-indigo-600 px-8 pt-12 pb-8 text-center relative overflow-hidden">
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white mb-4 border border-white/20">
                  VIP ACCESS • {selectedTicket.eventCategory}
                </span>
                <h2 className="font-display text-2xl font-extrabold text-white leading-tight mb-2">
                  {selectedTicket.eventName}
                </h2>
                <p className="text-indigo-200 font-medium text-sm">
                  {selectedTicket.eventVenue} • {selectedTicket.eventCity}
                </p>
              </div>
            </div>

            {/* Body Section */}
            <div className="p-8 text-center bg-slate-900 relative">
              {/* Fake dashed tear line */}
              <div className="absolute top-0 left-4 right-4 border-t-2 border-dashed border-slate-700/50"></div>

              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Date & Time</p>
                <p className="text-lg font-bold text-slate-200">{formatTicketDate(selectedTicket.startTime)}</p>
              </div>

              <div className="mb-8">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Assigned Seats</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedTicket.seats.length > 0 ? selectedTicket.seats.map((seat: any, idx: number) => (
                    <span key={idx} className="bg-slate-800 text-indigo-400 px-4 py-2 rounded-xl text-lg font-extrabold border border-indigo-500/20 shadow-inner">
                      {seat.seatRow || 'R'}-{seat.seatNumber || 'S'}
                    </span>
                  )) : (
                    <span className="text-slate-400 italic">General Admission</span>
                  )}
                </div>
              </div>

              {/* Large QR Code for Scanning */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl mx-auto w-48 shadow-lg">
                <img src={selectedTicket.qrCodeUrl} alt="Scan to Enter" className="w-full h-auto object-contain" />
              </div>

              <p className="mt-4 text-[11px] text-slate-500 font-medium tracking-widest uppercase">
                ID: {selectedTicket.uniqueKey}
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}