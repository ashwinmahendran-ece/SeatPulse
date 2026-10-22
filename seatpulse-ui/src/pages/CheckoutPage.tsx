import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, Clock, Lock, Loader2 } from 'lucide-react';
import { api } from '../api/seatPulseApi';
import type { Booking } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const STEPS = ['Tickets', 'Checkout', "You're in"];
const mmss = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const b = location.state?.booking as Booking | undefined;

  const [left, setLeft] = useState(b ? Math.max(0, Math.ceil((b.expiresAt - Date.now()) / 1000)) : 0);
  const [done, setDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = done ? 3 : 2;

  useEffect(() => {
    if (!b || done) return;
    const t = setInterval(() => {
      const l = Math.max(0, Math.ceil((b.expiresAt - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) {
        clearInterval(t);
        navigate(`/event/${b.eventId}`, { state: { notice: "Your seat reservation expired." } });
      }
    }, 500);
    return () => clearInterval(t);
  }, [b, done, navigate]);

  if (!b) {
    return <Navigate to="/explore" replace />;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const orderId = await api.payment.createOrder(b.seatId, 25.00);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: 2500,
        currency: 'INR',
        name: 'SeatPulse',
        description: `Ticket for Seat ${b.seatNumber}`,
        order_id: orderId,

        handler: async function (response: any) {
          try {
            await api.seats.book(b.seatId);
            setDone(true);
          } catch (err: any) {
            setError('Payment succeeded, but booking failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        theme: {
          color: '#6735E8'
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        setError('Payment failed or was cancelled. Try again.');
        setIsProcessing(false);
      });

      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment gateway.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="wrap flex h-16 items-center justify-between">
          <button onClick={() => navigate('/explore')} className="font-display text-2xl font-bold">offbeat<span className="text-brand">*</span></button>
          <ol className="flex items-center gap-4 text-sm">
            {STEPS.map((l, i) => (
              <li key={l} className={`flex items-center gap-2 ${i + 1 <= step ? 'font-semibold text-ink' : 'text-muted'}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${i + 1 < step ? 'bg-brand text-white' : i + 1 === step ? 'bg-brandLight text-brandDeep' : 'bg-badge'}`}>{i + 1 < step ? <Check size={12} /> : i + 1}</span>
                <span className="hidden sm:inline">{l}</span>
              </li>
            ))}
          </ol>
          <span className="flex items-center gap-1 text-xs text-muted"><Lock size={12} /> Secure</span>
        </div>
      </header>

      <div className="wrap py-10">
        {done ? (
          <div className="card mx-auto max-w-xl p-10 text-center">
            <h1 className="text-4xl font-bold">You're in.</h1>
            <p className="mt-2 text-muted">Seat {b.seatNumber} is yours. A confirmation has been sent to your registered account email.</p>
            <button className="btn mt-6" onClick={() => navigate('/explore')}>Back to Events</button>
          </div>
        ) : (
          <>
            <h1 className="text-5xl font-bold">Make it a plan.</h1>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">

              <form className="space-y-6" onSubmit={handleCheckout}>
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">{error}</div>}

                <section className="card space-y-4 p-6">
                  <h2 className="text-xl font-bold">Your details</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input required className="input" placeholder="First name" />
                    <input required className="input" placeholder="Last name" />
                  </div>
                  <p className="text-sm text-muted mt-2">Your ticket confirmation will be automatically sent to the email address registered to your SeatPulse account.</p>
                </section>

                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" required checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 accent-brand" />
                  I agree to the terms and the refund policy.
                </label>

                <button className="btn w-full py-4 text-base flex justify-center items-center gap-2" disabled={!terms || isProcessing}>
                  {isProcessing ? <><Loader2 className="animate-spin w-5 h-5"/> Opening Secure Payment...</> : `Pay ₹25.00 & book tickets`}
                </button>
              </form>

              <aside className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
                <div className="flex items-center gap-2 rounded-2xl bg-brandLight p-4 font-semibold text-brandDeep">
                  <Clock size={18} /> Your tickets are held for <span className="tabular-nums">{mmss(left)}</span>
                </div>
                <div className="card space-y-2 p-5 text-sm">
                  <div className="flex justify-between border-t border-line pt-3 mt-3"><span>Seat {b.seatNumber}</span></div>
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹25.00</span></div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}