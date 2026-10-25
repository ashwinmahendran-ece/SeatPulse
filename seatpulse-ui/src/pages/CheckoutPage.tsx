import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, Clock, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import type { Booking } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Helper to dynamically load the Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
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
  const booking = location.state?.booking as Booking | undefined;

  const [timeLeft, setTimeLeft] = useState(
    booking ? Math.max(0, Math.ceil((booking.expiresAt - Date.now()) / 1000)) : 0
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Timer countdown logic
  useEffect(() => {
    if (!booking || isSuccess) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((booking.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        toast.error('Seat reservation expired. Please select a seat again.');
        navigate(`/event/${booking.eventId}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking, isSuccess, navigate]);

  if (!booking) {
    return <Navigate to="/explore" replace />;
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Load Razorpay
      const res = await loadRazorpayScript();
      if (!res) throw new Error('Razorpay SDK failed to load. Check your connection.');

      // 2. Create Order in Spring Boot
      const orderId = await api.payment.createOrder(booking.seatId, booking.total);

      // 3. Configure Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_key', // Replace with your key
        amount: booking.total * 100, // Amount in paise
        currency: 'INR',
        name: 'SeatPulse',
        description: `Ticket for Seat ${booking.seatNumber} (${booking.seatCategory})`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // 4. Confirm Booking in Spring Boot
            await api.seats.book(booking.seatId);
            setIsSuccess(true);
            toast.success('Payment successful! Your ticket is confirmed.');
          } catch (err: any) {
            toast.error('Payment succeeded, but booking failed. Contact support.');
          }
        },
        prefill: {
          name: 'SeatPulse User',
          email: 'user@seatpulse.com',
        },
        theme: {
          color: '#6735E8'
        }
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

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F6F2] px-5 py-24">
        <div className="w-full max-w-md rounded-3xl border border-[#DCD8D2] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check size={32} />
          </div>
          <h1 className="font-display text-4xl font-bold text-[#242224]">You're in.</h1>
          <p className="mt-3 text-[#726E75]">
            Seat <strong className="text-[#242224]">{booking.seatNumber}</strong> is officially yours. A confirmation has been added to your account.
          </p>
          <div className="mt-8 space-y-3">
            <button onClick={() => navigate('/profile')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6735E8] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#5528c9]">
              View My Tickets <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/explore')} className="w-full rounded-xl border border-[#DCD8D2] bg-white px-6 py-4 text-sm font-bold text-[#242224] transition hover:bg-[#F8F6F2]">
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] pb-24">
      <header className="border-b border-[#DCD8D2] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <button onClick={() => navigate('/explore')} className="font-display text-2xl font-bold tracking-tight text-[#242224]">
            seatpulse<span className="text-[#6735E8]">*</span>
          </button>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <Lock size={14} /> 256-bit Secure Checkout
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 pt-10 lg:px-16">
        <h1 className="font-display text-4xl font-bold text-[#242224] md:text-5xl">Complete your booking</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handlePayment} className="space-y-6">
            <section className="rounded-3xl border border-[#DCD8D2] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl font-bold text-[#242224]">Attendee Details</h2>
              <p className="mt-1 text-sm text-[#726E75]">Your digital ticket will be linked to your account.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <input required className="rounded-xl border border-[#DCD8D2] bg-[#F8F6F2] px-4 py-3 text-sm outline-none transition focus:border-[#6735E8] focus:bg-white" placeholder="First name" />
                <input required className="rounded-xl border border-[#DCD8D2] bg-[#F8F6F2] px-4 py-3 text-sm outline-none transition focus:border-[#6735E8] focus:bg-white" placeholder="Last name" />
              </div>
            </section>

            <label className="flex items-start gap-3 rounded-xl p-2 text-sm text-[#726E75]">
              <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#DCD8D2] accent-[#6735E8]" />
              <span>I agree to the <span className="font-semibold text-[#6735E8] hover:underline cursor-pointer">Terms of Service</span> and acknowledge that tickets are non-refundable within 48 hours of the event.</span>
            </label>

            <button
              type="submit"
              disabled={!termsAccepted || isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6735E8] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#6735E8]/20 transition-all hover:scale-[1.02] hover:bg-[#5528c9] disabled:pointer-events-none disabled:opacity-70"
            >
              {isProcessing ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing Payment...</> : `Pay ₹${booking.total.toLocaleString('en-IN')} securely`}
            </button>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-amber-50 p-4 font-semibold text-amber-700 border border-amber-200 shadow-sm">
              <Clock size={20} /> Tickets held for <span className="tabular-nums font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>

            <div className="rounded-3xl border border-[#DCD8D2] bg-white p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold text-[#242224] mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between"><span className="text-[#726E75]">Event ID</span> <span className="text-[#242224]">#{booking.eventId}</span></div>
                <div className="flex justify-between"><span className="text-[#726E75]">Seat Number</span> <span className="text-[#6735E8] font-bold">{booking.seatNumber}</span></div>
                <div className="flex justify-between"><span className="text-[#726E75]">Category</span> <span className="text-[#242224]">{booking.seatCategory}</span></div>
                <div className="mt-4 flex justify-between border-t border-[#DCD8D2] pt-4 text-lg font-bold text-[#242224]">
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