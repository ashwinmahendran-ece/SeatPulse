import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, Clock, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';

declare global { interface Window { Razorpay: any; } }

interface BookingState {
  eventId: number; seatIds: number[]; seatNumbers: string;
  qty: number; total: number; expiresAt: number;
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking as BookingState | undefined;

  const [timeLeft, setTimeLeft] = useState(booking ? Math.max(0, Math.ceil((booking.expiresAt - Date.now()) / 1000)) : 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Idempotency Fallback States
  const [syncError, setSyncError] = useState<boolean>(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!booking || isSuccess || syncError) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((booking.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        toast.error('Seat reservation expired. Please select your seats again.');
        navigate(`/event/${booking.eventId}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [booking, isSuccess, syncError, navigate]);

  if (!booking) return <Navigate to="/explore" replace />;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) throw new Error('Razorpay SDK failed to load.');

      const orderId = await api.payment.createOrder(booking.seatIds, booking.total);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        amount: booking.total * 100,
        currency: 'INR',
        name: 'SeatPulse District',
        description: `Premium Seats: ${booking.seatNumbers}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await api.seats.bookBulk(booking.seatIds, orderId);
            const existingGroups = JSON.parse(localStorage.getItem('seatpulse_order_groups') || '{}');
            existingGroups[orderId] = booking.seatIds;
            localStorage.setItem('seatpulse_order_groups', JSON.stringify(existingGroups));

            setIsSuccess(true);
            toast.success('Payment successful! Welcome to the District.');
          } catch (err: any) {
            setCompletedOrderId(orderId);
            setSyncError(true);
            setIsProcessing(false);
          }
        },
        prefill: { name: 'SeatPulse VIP', email: 'vip@seatpulse.com' },
        theme: { color: '#631D2E' } // Matches Burgundy
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed or was cancelled.');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize payment gateway.');
      setIsProcessing(false);
    }
  };

  // Desync Error Screen
  if (syncError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-24">
        <div className="w-full max-w-md rounded-[2rem] border border-red-500/20 bg-cream-light p-10 text-center shadow-2xl animate-fade-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-sm">
            <AlertTriangle size={40} className="animate-pulse" />
          </div>
          <h1 className="font-display text-3xl font-bold text-burgundy mb-2">Action Required</h1>
          <p className="text-sage-dark text-sm mb-6">
            Payment captured successfully, but the server timed out assigning tickets. Please do not pay again.
          </p>
          <div className="rounded-xl bg-cream-dark border border-sage-light p-4 mb-8">
            <p className="text-xs font-bold text-sage-dark uppercase tracking-widest mb-1">Reference ID</p>
            <p className="font-mono text-burgundy font-bold break-all">{completedOrderId}</p>
          </div>
          <button onClick={() => navigate('/explore')} className="w-full rounded-xl bg-burgundy px-6 py-4 text-sm font-bold text-cream-light transition hover:bg-burgundy-light">
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-24 selection:bg-sage">
        <div className="w-full max-w-md rounded-[2rem] border border-sage-light bg-cream-light p-10 text-center shadow-2xl animate-slide-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sage text-cream-light shadow-[0_0_30px_rgba(156,163,146,0.5)]">
            <Check size={40} className="animate-in zoom-in duration-500 delay-150" />
          </div>
          <h1 className="font-display text-4xl font-bold text-burgundy">You're in.</h1>
          <p className="mt-3 text-sage-dark font-medium">
            Seats <strong className="text-burgundy">{booking.seatNumbers}</strong> are officially yours.
          </p>
          <div className="mt-8 space-y-3">
            <button onClick={() => navigate('/profile')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy px-6 py-4 text-sm font-bold text-cream-light shadow-lg transition hover:bg-burgundy-light hover:-translate-y-1">
              View My Tickets <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/explore')} className="w-full rounded-xl border border-sage-light bg-cream-dark px-6 py-4 text-sm font-bold text-burgundy transition hover:bg-sage hover:text-cream-light">
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-24 font-sans selection:bg-sage selection:text-cream-light overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-sage-light/30 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-center px-5">
          <button onClick={() => navigate('/explore')} className="flex items-center font-display text-2xl font-black tracking-tight text-burgundy transition-transform hover:scale-[1.02] animate-fade-in">
            Seat<span className="italic text-sage-dark ml-1">Pulse</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 pt-12 lg:px-16 animate-slide-up">
        <h1 className="font-display text-4xl font-black text-burgundy md:text-5xl">Complete your booking</h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handlePayment} className="space-y-6">
            <section className="rounded-[2rem] border border-sage-light/50 bg-cream-light p-6 shadow-md sm:p-8">
              <h2 className="font-display text-2xl font-bold text-burgundy">Attendee Details</h2>
              <p className="mt-1 text-sm text-sage-dark font-medium">Your digital tickets will be linked to your account.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input required className="rounded-xl border border-sage-light bg-cream px-5 py-4 text-sm text-burgundy-dark placeholder-sage outline-none transition focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 font-medium" placeholder="First name" />
                <input required className="rounded-xl border border-sage-light bg-cream px-5 py-4 text-sm text-burgundy-dark placeholder-sage outline-none transition focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 font-medium" placeholder="Last name" />
              </div>
            </section>

            <label className="flex items-start gap-3 rounded-xl p-2 text-sm text-sage-dark cursor-pointer group font-medium">
              <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-sage bg-cream accent-burgundy transition-colors" />
              <span>I agree to the <span className="font-bold text-burgundy group-hover:underline">Terms of Service</span> and acknowledge that tickets are non-refundable within 48 hours of the event.</span>
            </label>

            <button type="submit" disabled={!termsAccepted || isProcessing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy px-6 py-5 text-lg font-bold text-cream-light shadow-[0_10px_20px_rgba(99,29,46,0.2)] transition-all hover:scale-[1.02] hover:bg-burgundy-light active:scale-95 disabled:pointer-events-none disabled:opacity-50">
              {isProcessing ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing Payment...</> : `Pay ₹${booking.total.toLocaleString('en-IN')} securely`}
            </button>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-burgundy/10 p-4 font-bold text-burgundy border border-burgundy/20 shadow-sm animate-pulse">
              <Clock size={20} /> Tickets held for <span className="tabular-nums font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>

            <div className="rounded-[2rem] border border-sage-light/50 bg-cream-light p-8 shadow-xl">
              <h3 className="font-display text-xl font-bold text-burgundy mb-6">Order Summary</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between"><span className="text-sage-dark">Event ID</span> <span className="text-burgundy-dark font-bold">#{booking.eventId}</span></div>

                <div className="flex justify-between items-start">
                  <span className="text-sage-dark">Seats ({booking.qty})</span>
                  <span className="text-burgundy font-bold text-right max-w-[150px] leading-tight">
                    {booking.seatNumbers}
                  </span>
                </div>

                <div className="mt-6 flex justify-between border-t border-sage-light/50 pt-6 text-xl font-black text-burgundy">
                  <span>Total Amount</span>
                  <span>₹{booking.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}