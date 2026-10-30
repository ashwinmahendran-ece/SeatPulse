import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Loader2, MapPin, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import type { Event, Seat } from '../types';

const CATEGORY_IMAGES: Record<string, string> = {
  Music: 'https://images6.alphacoders.com/478/thumb-1920-478918.jpg',
  Comedy: 'https://media.istockphoto.com/id/827698600/photo/dark-empty-stage-with-microphone-3d-render.jpg?s=612x612&w=0&k=20&c=vey5jZz8dYxauIhm3WaNEhHCcpxX4eI9-a0DidbzHMU=',
  Theater: 'https://img.magnific.com/free-photo/rows-red-seats-theater_53876-64710.jpg?semt=ais_hybrid&w=740&q=80',
  Sports: 'https://i.pinimg.com/736x/86/5c/64/865c64b0b63a33036c40f40b4f9a5a93.jpg',
  Tech: 'https://i.pinimg.com/736x/00/08/06/0008069a050ade9ecf214d6ddd18021d.jpg',
  Default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
};
const getEventImage = (category?: string) => (category && CATEGORY_IMAGES[category]) || CATEGORY_IMAGES.Default;

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

// MINIMAL EMPTY BOXES & FILLED SELECTION
const getUserSeatColor = (isSelected: boolean, isAvailable: boolean) => {
  if (!isAvailable) return 'bg-slate-800/60 border border-slate-700/50 text-slate-500 cursor-not-allowed';
  if (isSelected) return 'bg-[#E8D5B5] border-[#E8D5B5] text-[#07090E] font-black scale-110 z-20 shadow-[0_0_10px_rgba(232,213,181,0.4)] ring-1 ring-white/20';
  return 'bg-transparent border border-slate-500 text-slate-300 hover:border-[#E8D5B5] hover:text-[#E8D5B5] transition-colors';
};

export default function EventDetailsPage() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const eventId = paramId ? parseInt(paramId, 10) : NaN;
  const event = location.state?.event as Event | undefined;

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLocking, setIsLocking] = useState(false);

  const COLS = 15; // Match Admin Builder Default

  const { data: rawSeats = [], isLoading, refetch } = useQuery({
    queryKey: ['seats', eventId],
    queryFn: () => api.seats.getForEvent(eventId),
    enabled: !Number.isNaN(eventId),
    refetchInterval: (query) => (query.state.error ? false : 3000),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  const seats = Array.isArray(rawSeats) ? rawSeats : (rawSeats?.data || []);

  const handleToggleSeat = (seat: Seat) => {
    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some((s) => s.seatId === seat.seatId);
      if (isAlreadySelected) return prev.filter((s) => s.seatId !== seat.seatId);
      if (prev.length >= 10) {
        toast.error('You can only select up to 10 seats at a time.', {
          style: { background: '#11131A', color: '#E8D5B5', border: '1px solid rgba(232,213,181,0.2)' }
        });
        return prev;
      }
      return [...prev, seat];
    });
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  const seatNumbersList = selectedSeats.map((s) => s.seatNo).join(', ');

  const selectedCategories = Array.from(
    new Set(selectedSeats.map(s => (s.seatCategory || s.category || 'REGULAR').toUpperCase()))
  ).join(', ');

  const handleLockAndCheckout = async () => {
    if (selectedSeats.length === 0) return;
    setIsLocking(true);
    try {
      await Promise.all(selectedSeats.map(seat => api.seats.lock(seat.seatId)));
      toast.success(`${selectedSeats.length} seats secured!`, { style: { background: '#E8D5B5', color: '#07090E', fontWeight: 'bold' } });
      navigate('/checkout', {
        state: {
          booking: { eventId, seatIds: selectedSeats.map(s => s.seatId), seatNumbers: seatNumbersList, qty: selectedSeats.length, total: totalAmount, expiresAt: Date.now() + (5 * 60 * 1000) }
        }
      });
    } catch (err: any) {
      toast.error(err.message || 'Some seats are no longer available.', { style: { background: '#EF4444', color: '#FFFFFF' } });
      setSelectedSeats([]);
      refetch();
    } finally {
      setIsLocking(false);
    }
  };

  if (Number.isNaN(eventId)) return <div className="p-10 text-center font-bold text-red-400 bg-[#07090E] min-h-screen pt-32">Invalid Event ID.</div>;
  const eventDate = event?.eventStartTime ? new Date(event.eventStartTime) : null;

  // BOOKMYSHOW STYLE EXACT GRID GROUPING LOGIC
  const groupedRows: { category: string, price: number, rows: any[] }[] = [];
  let currentGroup: any = null;
  const numRows = Math.ceil(seats.length / COLS) || 10;

  Array.from({ length: numRows }).forEach((_, r) => {
    const rowSeats = seats.slice(r * COLS, (r + 1) * COLS);
    const firstValidSeat = rowSeats.find(s => (s.seatCategory || s.category) !== 'BLOCKED');

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

  return (
    <div className="flex flex-col min-h-screen bg-[#07090E] font-sans text-white overflow-x-hidden selection:bg-[#E8D5B5]/30 selection:text-white pb-32">

      <div className="fixed top-0 left-0 right-0 z-50 p-4 lg:p-8 flex justify-between items-center pointer-events-none">
        <button onClick={() => navigate(-1)} className="pointer-events-auto flex items-center justify-center h-11 w-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 transition-colors shadow-lg">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* FIXED HERO SECTION: Full Cover Image */}
      <div className="relative w-full h-[45vh] lg:h-[50vh] min-h-[350px] bg-[#07090E]">
        <img src={getEventImage(event?.eventCategory)} alt="Event Hero" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full px-5 lg:px-16 pb-8 z-30">
          <div className="max-w-[1440px] mx-auto">
            {event?.eventCategory && (
              <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold text-[#07090E] bg-[#E8D5B5] rounded-sm uppercase tracking-widest">{event.eventCategory}</span>
            )}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-4 drop-shadow-md">
              {event?.eventName || `Event #${eventId}`}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-300">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#E8D5B5]" /><span>{eventDate ? eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Date TBA'}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#E8D5B5]" /><span>{eventDate ? eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Time TBA'}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#E8D5B5]" /><span>{event?.venue || 'Main Stadium'}, {event?.location || 'City'}</span></div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 relative flex flex-col mx-auto w-full max-w-[1440px] px-2 sm:px-16 mt-8">
        <div className="flex items-center justify-between mb-8 px-3 sm:px-0">
          <h2 className="font-display text-2xl font-bold text-white">Select Tickets</h2>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max 10 per order</span>
        </div>

        {/* MINIMAL LEGEND */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 w-full text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest pb-6 border-b border-white/10 px-3 sm:px-0">
          <span className="flex items-center gap-2"><div className="h-4 w-4 rounded-[4px] bg-transparent border border-slate-500"></div> Available</span>
          <span className="flex items-center gap-2"><div className="h-4 w-4 rounded-[4px] bg-[#E8D5B5]"></div> Selected</span>
          <span className="flex items-center gap-2"><div className="h-4 w-4 rounded-[4px] bg-slate-800/60 border border-slate-700/50"></div> Unavailable</span>
        </div>

        <div className="flex-1 w-full pb-20 relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-[#E8D5B5]" />
            </div>
          ) : (
            <div className="mx-auto flex flex-col items-center min-w-fit w-full">

              <div className="relative w-[240px] sm:w-[320px] mb-10 flex flex-col items-center">
                <svg viewBox="0 0 400 30" className="w-full opacity-40">
                  <path d="M 0 30 Q 200 0 400 30" fill="none" stroke="#E8D5B5" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="mt-2 text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase">Stage</div>
              </div>

              {/* DENSE BOOKMYSHOW STYLE GRID RENDER */}
              <div className="flex flex-col w-full max-w-4xl px-1 sm:px-4">
                {groupedRows.map((group, gIdx) => (
                  <div key={gIdx} className="w-full mb-6 relative">

                    {/* Natural Scrolling Category Divider */}
                    <div className="w-full py-2 mb-3 flex justify-center items-center">
                      <h3 className="font-display text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">
                        {group.category} : ₹{group.price}
                      </h3>
                    </div>

                    {/* SEAT ROWS - Condensed */}
                    <div className="flex flex-col gap-1 sm:gap-1.5">
                      {group.rows.map((row) => (
                        <div key={row.rowIndex} className="flex items-center gap-2 sm:gap-4 w-full justify-center">

                          <div className="w-4 sm:w-5 text-right text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">{row.rowLabel}</div>

                          <div className="flex gap-1 sm:gap-1.5">
                            {row.seats.map((seat: any, c: number) => {
                              const index = row.rowIndex * COLS + c;
                              const status = String(seat.seatStatus || seat.status || 'AVAILABLE').toUpperCase();
                              const category = String(seat.seatCategory || seat.category).toUpperCase();

                              const isAvailable = status === 'AVAILABLE' && category !== 'BLOCKED';
                              const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
                              const isWalkway = category === 'BLOCKED';

                              // Smaller empty div for walkways
                              if (isWalkway) {
                                return <div key={`walkway-${index}`} className="w-6 h-6 sm:w-7 sm:h-7" />;
                              }

                              return (
                                <button
                                  key={seat.seatId || index}
                                  disabled={!isAvailable}
                                  onClick={() => handleToggleSeat(seat)}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[4px] flex items-center justify-center text-[7px] sm:text-[8px] transition-all duration-200 focus:outline-none
                                    ${getUserSeatColor(isSelected, isAvailable)}
                                  `}
                                >
                                  {String(seat.seatNo || '').replace(/[^0-9A-Za-z]/g, '')}
                                </button>
                              );
                            })}
                          </div>

                          <div className="w-4 sm:w-5 text-left text-[9px] sm:text-[10px] font-black text-slate-500 uppercase hidden md:block">{row.rowLabel}</div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </main>

      {/* FLOATING CHECKOUT PILL */}
      <div className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500 ease-out ${selectedSeats.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="w-full max-w-md bg-[#1A1D24]/95 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.8)]">

          <div className="flex flex-col justify-center py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              {selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'}
              {selectedCategories && (
                <span className="text-[#E8D5B5] ml-1 opacity-90 truncate max-w-[140px] inline-block align-bottom">
                  ({selectedCategories})
                </span>
              )}
            </span>
            <span className="font-display text-xl font-black text-white leading-none">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleLockAndCheckout}
            disabled={isLocking}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#E8D5B5] px-8 text-sm font-bold text-[#07090E] transition-all hover:bg-[#D6C09D] hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLocking ? <><Loader2 className="animate-spin h-4 w-4" /> Securing</> : <>Get Tickets <ArrowRight size={16} /></>}
          </button>

        </div>
      </div>
    </div>
  );
}