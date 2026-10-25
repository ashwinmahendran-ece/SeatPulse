import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Calendar, MapPin, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import type { Event, Seat } from '../types';

const ROWS = 10;
const COLS = 15;
const getRowLetter = (index: number) => String.fromCharCode(65 + index);
const getSeatNumber = (row: number, col: number) => row * COLS + col + 1;

const getSeatColor = (category: string, isSelected: boolean, isAvailable: boolean) => {
  if (!isAvailable) return 'bg-slate-200 cursor-not-allowed opacity-50';
  if (isSelected) return 'bg-[#242224] shadow-lg scale-110 ring-4 ring-[#242224]/20 z-10';

  switch(category) {
    case 'VIP': return 'bg-amber-400 hover:scale-110 hover:shadow-md';
    case 'PREMIUM': return 'bg-[#6735E8] hover:scale-110 hover:shadow-md';
    case 'STANDARD': return 'bg-sky-500 hover:scale-110 hover:shadow-md';
    default: return 'bg-gray-300 hover:scale-110 hover:shadow-md';
  }
};

export default function EventDetailsPage() {
  const { eventId: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const eventId = paramId ? parseInt(paramId, 10) : NaN;
  const event = location.state?.event as Event | undefined;

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  const { data: seats = [], isLoading, refetch } = useQuery({
    queryKey: ['seats', eventId],
    queryFn: () => api.seats.getForEvent(eventId),
    enabled: !Number.isNaN(eventId),
    refetchInterval: 3000,
  });

  const handleLockAndCheckout = async () => {
    if (!selectedSeat) return;
    setIsLocking(true);

    try {
      const lockedSeat = await api.seats.lock(selectedSeat.seatId);

      // Calculate Grid Label (e.g., A5)
      const rowIndex = Math.floor((lockedSeat.seatNo - 1) / COLS);
      const colIndex = (lockedSeat.seatNo - 1) % COLS;
      const visualLabel = `${getRowLetter(rowIndex)}${colIndex + 1}`;

      toast.success(`Seat ${visualLabel} secured for 5 minutes!`);

      navigate('/checkout', {
        state: {
          booking: {
            eventId,
            seatId: lockedSeat.seatId,
            seatNumber: visualLabel, // Show A5 instead of 5
            seatCategory: lockedSeat.seatCategory,
            qty: 1,
            total: lockedSeat.price || 0,
            expiresAt: Date.now() + (5 * 60 * 1000),
          }
        }
      });
    } catch (err: any) {
      toast.error(err.message || 'Seat is no longer available.');
      setSelectedSeat(null);
      refetch();
    } finally {
      setIsLocking(false);
    }
  };

  if (Number.isNaN(eventId)) return <div className="p-10 text-center">Invalid Event</div>;

  return (
    <div className="min-h-screen bg-[#F8F6F2] pb-24">
      <header className="border-b border-[#DCD8D2] bg-white px-5 lg:px-16">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center">
          <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-sm font-semibold text-[#726E75] hover:text-[#242224]">
            <ArrowLeft size={16} /> Back to Events
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1440px] px-5 pt-8 lg:px-16">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#242224] md:text-5xl">
          {event?.eventName || `Event #${eventId}`}
        </h1>

        <div className="mt-4 flex flex-wrap gap-6 text-sm font-medium text-[#726E75]">
          <span className="flex items-center gap-2"><Calendar size={18} className="text-[#6735E8]" /> {event?.eventStartTime ? new Date(event.eventStartTime).toLocaleString() : 'Date TBA'}</span>
          <span className="flex items-center gap-2"><MapPin size={18} className="text-[#6735E8]" /> Main Stadium</span>
          <span className="flex items-center gap-2 rounded-full bg-[#6735E8]/10 px-3 py-1 text-xs font-bold uppercase text-[#6735E8]">{event?.eventCategory || 'Live Event'}</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Seat Canvas */}
          <section className="rounded-3xl border border-[#DCD8D2] bg-white p-6 shadow-sm sm:p-10 overflow-x-auto">
            <div className="mb-6 flex items-center justify-between border-b border-[#DCD8D2] pb-4 min-w-[600px]">
              <h2 className="font-display text-2xl font-bold text-[#242224]">Interactive Venue Map</h2>
              {isLoading && <span className="flex items-center gap-2 text-xs font-medium text-[#6735E8]"><Loader2 className="animate-spin h-4 w-4" /> Syncing...</span>}
            </div>

            <div className="mx-auto mb-12 w-3/4 max-w-md rounded-b-3xl bg-[#242224] py-4 text-center shadow-lg min-w-[300px]">
              <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-white">Stage</span>
            </div>

            <div className="mx-auto flex w-max flex-col gap-2">
              {Array.from({ length: ROWS }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-4">
                  <div className="w-6 text-right text-xs font-bold text-[#726E75]">{getRowLetter(rowIndex)}</div>

                  <div className="flex gap-2">
                    {Array.from({ length: COLS }).map((_, colIndex) => {
                      const targetSeatNo = getSeatNumber(rowIndex, colIndex);
                      const seat = seats.find(s => s.seatNo === targetSeatNo);

                      // If admin didn't paint this seat, render empty space
                      if (!seat) return <div key={colIndex} className="h-8 w-8" />;

                      const isAvailable = seat.seatStatus === 'AVAILABLE';
                      const isSelected = selectedSeat?.seatId === seat.seatId;

                      return (
                        <button
                          key={colIndex}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSeat(seat)}
                          className={`h-8 w-8 rounded-t-lg rounded-b-sm transition-all focus:outline-none ${getSeatColor(seat.seatCategory, isSelected, isAvailable)}`}
                          title={`Seat ${getRowLetter(rowIndex)}${colIndex + 1} - ₹${seat.price}`}
                        />
                      );
                    })}
                  </div>

                  <div className="w-6 text-left text-xs font-bold text-[#726E75]">{getRowLetter(rowIndex)}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 rounded-xl bg-[#F8F6F2] p-4 text-xs font-semibold text-[#726E75] min-w-[600px]">
              <span className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-amber-400"></div> VIP</span>
              <span className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-[#6735E8]"></div> Premium</span>
              <span className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-sky-500"></div> Standard</span>
              <span className="flex items-center gap-2"><div className="h-4 w-4 rounded bg-slate-200"></div> Unavailable</span>
            </div>
          </section>

          {/* Right Sidebar - Pricing & Checkout */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#DCD8D2] bg-[#FFFEFB] p-6 shadow-sm sticky top-6">
              <h3 className="font-display text-lg font-bold text-[#242224]">Checkout Summary</h3>

              {!selectedSeat ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DCD8D2] p-8 text-center bg-[#F8F6F2]">
                  <p className="text-sm font-medium text-[#726E75]">Click a colored seat on the map to begin your booking.</p>
                </div>
              ) : (
                <div className="mt-6 animate-in slide-in-from-bottom-4">
                  <div className="space-y-2 rounded-xl bg-[#F8F6F2] p-5 text-sm font-medium text-[#242224]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#726E75]">Seat:</span>
                      <span className="text-lg font-bold text-[#6735E8]">
                        {getRowLetter(Math.floor((selectedSeat.seatNo - 1) / COLS))}{((selectedSeat.seatNo - 1) % COLS) + 1}
                      </span>
                    </div>
                    <div className="flex justify-between"><span className="text-[#726E75]">Category:</span> <span>{selectedSeat.seatCategory}</span></div>
                    <div className="mt-4 flex justify-between border-t border-[#DCD8D2] pt-4 text-base font-bold">
                      <span className="text-[#726E75]">Total:</span>
                      <span>₹{selectedSeat.price}</span>
                    </div>
                  </div>

                  <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <ShieldCheck size={16} /> Seat will be held for 5 minutes
                  </p>

                  <button
                    onClick={handleLockAndCheckout}
                    disabled={isLocking}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6735E8] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#6735E8]/20 transition-all hover:scale-[1.02] hover:bg-[#5528c9] disabled:opacity-70"
                  >
                    {isLocking ? <><Loader2 className="animate-spin h-5 w-5" /> Locking...</> : <>Proceed to Secure Payment <ArrowRight size={16} /></>}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}