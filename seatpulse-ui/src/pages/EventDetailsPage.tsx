import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar, Ticket } from 'lucide-react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import type { Event } from '../types';

type SeatStatus = 'BOOKED' | 'LOCKED' | 'AVAILABLE' | 'CANCELLED';

interface SeatDto {
  seatId: number;
  seatNo: number;
  seatCategory: string;
  seatStatus: SeatStatus;
  eventId: number;
}

class RateLimitError extends Error {}

const toApiError = (err: unknown, fallback: string): Error => {
  const axiosError = err as AxiosError<{ error?: string; message?: string }>;
  if (axiosError.response?.status === 429) {
    return new RateLimitError(axiosError.response.data?.error || 'Rate limit exceeded: 5 requests per minute.');
  }
  return new Error(axiosError.response?.data?.message || fallback);
};

const HOLD_DURATION_MS = 5 * 60 * 1000;
const GRADIENTS = [
  'from-[#6735E8] via-indigo-800 to-slate-900',
  'from-rose-500 via-red-700 to-stone-900',
  'from-amber-500 via-orange-700 to-stone-800',
  'from-sky-600 via-blue-800 to-slate-900',
  'from-emerald-600 via-teal-800 to-slate-900',
];
const gradientFor = (id: number) => GRADIENTS[Math.abs(id) % GRADIENTS.length];

const fmt = (iso: string | undefined, opts: Intl.DateTimeFormatOptions) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-GB', opts);
};

interface Tier {
  category: string;
  seats: SeatDto[];
  availableCount: number;
}

export default function EventDetailsPage() {
  const { eventId: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const eventId = paramId ? parseInt(paramId, 10) : null;
  const event = location.state?.event as Event | undefined;
  const notice = location.state?.notice as string | undefined;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const { data: seats = [], isLoading, error: fetchError, refetch } = useQuery({
    queryKey: ['seats', eventId],
    queryFn: async () => (await api.seats.getForEvent(eventId as number)) as unknown as SeatDto[],
    enabled: eventId !== null && !isNaN(eventId),
    refetchInterval: 3000,
  });

  const showError = (err: unknown) => {
    setIsRateLimited(err instanceof RateLimitError);
    const msg = err instanceof Error ? err.message : 'Something went wrong.';
    setLockError(msg);
    toast.error(msg);
  };

  useEffect(() => {
    if (notice) {
      toast.error(notice);
    }
  }, [notice]);

  const tiers: Tier[] = useMemo(() => {
    const map = new Map<string, SeatDto[]>();
    seats.forEach((s) => map.set(s.seatCategory, [...(map.get(s.seatCategory) ?? []), s]));
    return Array.from(map.entries()).map(([category, list]) => ({
      category,
      seats: [...list].sort((a, b) => a.seatNo - b.seatNo),
      availableCount: list.filter((s) => s.seatStatus === 'AVAILABLE').length,
    }));
  }, [seats]);

  const selectedTier = tiers.find((t) => t.category === selectedCategory) ?? null;
  const selectedSeat = seats.find((s) => s.seatId === selectedSeatId) ?? null;

  const displayError = lockError || (fetchError ? 'Failed to fetch seats.' : null);

  const handleContinue = async () => {
    if (!selectedSeat || eventId === null) return;
    setIsLocking(true);
    setLockError(null);
    setIsRateLimited(false);

    try {
      const locked = await api.seats.lock(selectedSeat.seatId) as unknown as SeatDto;

      toast.success(`Seat ${locked.seatNo} locked!`);

      navigate('/checkout', {
        state: {
          booking: {
            eventId,
            seatId: locked.seatId,
            seatNumber: String(locked.seatNo),
            qty: 1,
            total: 25.00,
            expiresAt: Date.now() + HOLD_DURATION_MS,
          }
        }
      });
    } catch (err) {
      showError(err);
      setSelectedSeatId(null);
      await refetch();
    } finally {
      setIsLocking(false);
    }
  };

  const title = event?.eventName ?? (eventId !== null ? `Event #${eventId}` : 'Event');

  if (eventId === null || isNaN(eventId)) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] px-5 py-24 text-center lg:px-16">
        <h1 className="font-display text-3xl font-bold text-[#242224]">No event selected</h1>
        <p className="mt-2 text-sm text-[#726E75]">Pick an event from Explore to see its seats.</p>
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="mt-6 rounded-xl bg-[#242224] px-6 py-3 text-sm font-semibold text-white hover:bg-[#111011]"
        >
          Back to explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] pb-24">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-8 lg:px-16">
        <nav className="flex items-center gap-2 text-xs text-[#726E75]" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate('/explore')} className="hover:text-[#242224]">
            Explore
          </button>
          {event?.eventCategory && (
            <>
              <span>›</span>
              <span>{event.eventCategory}</span>
            </>
          )}
          <span>›</span>
          <span className="font-medium text-[#242224]">{title}</span>
        </nav>

        {event?.eventCategory && (
          <span className="mt-6 inline-block rounded-md bg-[#6735E8]/10 px-2.5 py-1 text-[11px] font-semibold text-[#6735E8]">
            {event.eventCategory}
          </span>
        )}
        <h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-tight text-[#242224] md:text-7xl">
          {title}
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            <div className={`relative h-[280px] overflow-hidden rounded-2xl bg-gradient-to-br sm:h-[380px] ${gradientFor(eventId)}`}>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  {event?.eventCategory}
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-white">{title}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 border-b border-[#DCD8D2] pb-8 sm:grid-cols-2">
              {event && (
                <div className="flex gap-3">
                  <Calendar className="h-5 w-5 shrink-0 text-[#6735E8]" />
                  <div>
                    <p className="text-sm font-semibold text-[#242224]">
                      {fmt(event.eventStartTime, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="mt-0.5 text-xs text-[#726E75]">
                      {fmt(event.eventStartTime, { hour: '2-digit', minute: '2-digit', hour12: false })}–
                      {fmt(event.eventEndTime, { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Ticket className="h-5 w-5 shrink-0 text-[#6735E8]" />
                <div>
                  <p className="text-sm font-semibold text-[#242224]">Seating</p>
                  <p className="mt-0.5 text-xs text-[#726E75]">
                    {isLoading ? 'Loading…' : `${seats.length} seats across ${tiers.length} categories`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-[#DCD8D2] bg-[#FFFEFB] p-6 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-[#242224]">Be there.</h2>

            {displayError && (
              <div role="alert" className={`mt-5 rounded-lg border px-4 py-3 text-sm ${isRateLimited ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-red-300 bg-red-50 text-red-700'}`}>
                <p className="font-semibold">{isRateLimited ? 'Slow down a moment' : 'Something went wrong'}</p>
                <p className="mt-0.5">{displayError}</p>
                {!isLoading && seats.length === 0 && (
                  <button type="button" onClick={() => refetch()} className="mt-2 font-medium underline">Try again</button>
                )}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[0, 1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-[#DCD8D2]" />)}
                </div>
              ) : tiers.length === 0 ? (
                !displayError && <div className="rounded-xl border border-dashed border-[#DCD8D2] px-4 py-10 text-center text-sm text-[#726E75]">No seats released yet.</div>
              ) : (
                tiers.map((tier) => {
                  const soldOut = tier.availableCount === 0;
                  const active = tier.category === selectedCategory;
                  return (
                    <button
                      key={tier.category}
                      type="button"
                      disabled={soldOut}
                      onClick={() => { setSelectedCategory(tier.category); setSelectedSeatId(null); }}
                      className={`w-full rounded-xl border p-4 text-left transition ${active ? 'border-2 border-[#6735E8] bg-[#6735E8]/10' : 'border-[#DCD8D2] bg-white hover:border-[#6735E8]'} ${soldOut ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#242224]">{tier.category}</span>
                        {soldOut ? (
                          <span className="text-[11px] font-bold uppercase tracking-wide text-[#726E75]">Sold out</span>
                        ) : (
                          <span className="text-xs font-medium text-[#6735E8]">{tier.availableCount} of {tier.seats.length} left</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selectedTier && (
              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#242224]">Choose a seat</p>
                <div className="mt-2 grid grid-cols-6 gap-2">
                  {selectedTier.seats.map((seat) => {
                    const free = seat.seatStatus === 'AVAILABLE';
                    const chosen = seat.seatId === selectedSeatId;
                    return (
                      <button
                        key={seat.seatId}
                        type="button"
                        disabled={!free}
                        onClick={() => setSelectedSeatId(seat.seatId)}
                        className={`rounded-lg border py-2 text-xs font-semibold transition ${chosen ? 'border-[#6735E8] bg-[#6735E8] text-white' : free ? 'border-[#DCD8D2] bg-white text-[#242224] hover:border-[#6735E8]' : 'cursor-not-allowed border-transparent bg-[#EFECE6] text-[#B5B1B8] line-through'}`}
                      >
                        {seat.seatNo}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedSeat || isLocking || isLoading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6735E8] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5528c9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLocking ? 'Locking your seat…' : <>Continue to checkout <ArrowRight className="h-4 w-4" /></>}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}