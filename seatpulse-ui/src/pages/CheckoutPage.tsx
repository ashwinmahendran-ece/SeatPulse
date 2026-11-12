import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, Clock, Loader2, ArrowRight, AlertTriangle, User, Calendar, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

declare global { interface Window { Razorpay: any; } }

interface BookingState {
  eventId: number;
  eventName?: string;
  eventDate?: string;
  venue?: string;
  seatIds: number[];
  seatNumbers: string;
  qty: number;
  total: number;
  expiresAt: number;
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

  const { user } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState(booking ? Math.max(0, Math.ceil((booking.expiresAt - Date.now()) / 1000)) : 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
        navigate(-1);
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
        name: 'SeatPulse',
        description: `Premium Seats: ${booking.seatNumbers}`,
        order_id: orderId,
handler: async function (response: any) {
      try {
        toast.loading('Confirming seats securely...', { id: 'verify' });

        // NEW: Send the exact parameters your updated Spring Boot backend expects
        await api.seats.confirmOrder({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          userId: user?.userId || user?.id // Pass the extracted user ID
        });

        toast.success('Payment successful! Welcome to SeatPulse.', { id: 'verify' });
        setIsSuccess(true);
      } catch (err: any) {
        setCompletedOrderId(orderId);
        setSyncError(true);
        setIsProcessing(false);
        toast.error(err.message || 'Payment verification failed!', { id: 'verify' });
      }
    },
        prefill: { name: 'SeatPulse VIP', email: 'vip@seatpulse.com' },
        theme: { color: '#0D0D0E' }
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

  if (syncError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0E] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] px-5 py-24">
        <div className="w-full max-w-md rounded-[1.5rem] border border-red-500/20 bg-[#131315] p-10 text-center shadow-2xl animate-fade-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 shadow-sm">
            <AlertTriangle size={40} className="animate-pulse" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Action Required</h1>
          <p className="text-slate-400 text-sm mb-6">
            Payment captured successfully, but the server timed out assigning tickets. Please do not pay again.
          </p>
          <div className="rounded-xl bg-[#1A1A1C] border border-white/5 p-4 mb-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Reference ID</p>
            <p className="font-mono text-white font-bold break-all">{completedOrderId}</p>
          </div>
          <button onClick={() => navigate('/explore')} className="w-full rounded-xl bg-[#FCEADA] px-6 py-4 text-sm font-bold text-[#131315] transition hover:bg-[#F0E5D8]">
            Return to Events
          </button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0E] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] px-5 py-24">
        <div className="w-full max-w-md rounded-[1.5rem] border border-green-500/20 bg-[#131315] p-10 text-center shadow-2xl animate-slide-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-400">
            <Check size={40} className="animate-in zoom-in duration-500 delay-150" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">You're in.</h1>
          <p className="mt-3 text-slate-400 font-medium">
            Seats <strong className="text-white">{booking.seatNumbers}</strong> are officially yours.
          </p>
          <div className="mt-8 space-y-3">
            <button onClick={() => navigate('/profile')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FCEADA] px-6 py-4 text-sm font-bold text-[#131315] shadow-lg transition hover:bg-[#F0E5D8] hover:-translate-y-1">
              View My Tickets <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/explore')} className="w-full rounded-xl border border-white/10 bg-[#1A1A1C] px-6 py-4 text-sm font-bold text-white transition hover:bg-white/5">
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0E] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pb-24 font-sans text-slate-200 selection:bg-[#FCEADA] selection:text-[#131315] overflow-x-hidden">

      {/* Matte Header with Profile Icon */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0D0D0E]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <button onClick={() => navigate('/explore')} className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FCEADA] text-[#0D0D0E] font-black text-sm">S</div>
            SeatPulse
          </button>

          <button onClick={() => navigate('/profile')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white">
            <User size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 pt-10 lg:px-8 animate-slide-up">
        {/* Changed to navigate(-1) to fix the routing loop */}
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-medium text-slate-400 transition hover:text-white">
          ← Back
        </button>

        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">Complete your booking</h1>

        {/* Dynamic Hero Event Banner */}
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/5 bg-[#131315] relative">
           <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-purple-600 to-blue-600 blur-3xl"></div>
           <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
               <div>
                   <h2 className="text-2xl font-bold text-white">{booking.eventName || `Event #${booking.eventId}`}</h2>
                   <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-slate-400">
                       <span className="flex items-center gap-1.5"><Calendar size={16}/> {booking.eventDate || 'Date & Time TBA'}</span>
                       <span className="flex items-center gap-1.5"><MapPin size={16}/> {booking.venue || 'Location TBA'}</span>
                   </div>
               </div>
           </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handlePayment} className="space-y-6">
            <section className="rounded-[1.5rem] border border-white/5 bg-[#131315] p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-white">Attendee Details</h2>
              <p className="mt-1 text-sm text-slate-400 font-medium">Tickets will be sent to the email address below.</p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">First Name</label>
                  <input required className="w-full rounded-xl border border-white/5 bg-[#1A1A1C] px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#FCEADA] focus:ring-1 focus:ring-[#FCEADA]" placeholder="Ashwin" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-400">Last Name</label>
                  <input required className="w-full rounded-xl border border-white/5 bg-[#1A1A1C] px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#FCEADA] focus:ring-1 focus:ring-[#FCEADA]" placeholder="Mahendran" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Email Address</label>
                  <input required type="email" className="w-full rounded-xl border border-white/5 bg-[#1A1A1C] px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-[#FCEADA] focus:ring-1 focus:ring-[#FCEADA]" placeholder="ashwinmahendran441@gmail.com" />
                </div>
              </div>
            </section>

            <label className="flex items-start gap-3 rounded-xl p-2 cursor-pointer group font-medium">
              <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-[#1A1A1C] accent-[#FCEADA] transition-colors" />
              <span className="text-sm text-slate-400 leading-relaxed">
                I agree to the <span className="font-bold text-white group-hover:underline">Terms of Service & Cancellation Policy</span>.
                Tickets are non-refundable within 48 hours of the event.
              </span>
            </label>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/10 bg-[#131315] p-4 text-sm font-medium text-red-400">
              <Clock size={18} /> Tickets held for <span className="tabular-nums font-mono font-bold text-red-300">{formatTime(timeLeft)}</span>
            </div>

            <div className="rounded-[1.5rem] border border-white/5 bg-[#131315] p-6 sm:p-8">
              <h3 className="font-display text-xl font-bold text-white mb-6">Order Summary</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center"><span className="text-slate-400">Event</span> <span className="text-white">{booking.eventName || `Event #${booking.eventId}`}</span></div>

                <div className="flex justify-between items-start">
                  <span className="text-slate-400">Seats ({booking.qty})</span>
                  <span className="text-white font-bold text-right max-w-[150px] leading-tight">
                    {booking.seatNumbers}
                  </span>
                </div>

                <div className="mt-6 flex justify-between border-t border-white/5 pt-6 text-xl font-bold text-white">
                  <span>Total Payable</span>
                  <span>₹{booking.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button onClick={handlePayment} disabled={!termsAccepted || isProcessing} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FCEADA] px-6 py-4 text-base font-bold text-[#131315] transition-all hover:bg-[#F0E5D8] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50">
                {isProcessing ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</> : `Proceed to Pay ₹${booking.total.toLocaleString('en-IN')}`}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}