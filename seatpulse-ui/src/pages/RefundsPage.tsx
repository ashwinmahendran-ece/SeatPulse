import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function RefundsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07090E] font-sans text-white pb-24">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090E]/90 backdrop-blur-md px-5 lg:px-16 h-16 flex items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-5 pt-12">
        <h1 className="font-display text-3xl font-bold mb-8 text-white">Refund & Cancellation Policy</h1>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed bg-[#11131A] p-8 sm:p-10 rounded-2xl border border-white/10">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Standard Cancellations</h2>
            <p>
              Tickets purchased on SeatPulse are generally non-refundable and non-transferable, unless explicitly permitted by the specific event organizer. If an organizer allows cancellations, you may initiate a cancellation request directly through your "My Bookings" dashboard up to 48 hours before the event start time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Canceled or Rescheduled Events</h2>
            <p>
              If an event is canceled by the organizer, SeatPulse will automatically initiate a full refund to all ticket holders. If an event is postponed or rescheduled, your ticket will typically remain valid for the new date. If you cannot attend the new date, you may request a refund within the window specified by the organizer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Refund Processing Timeline</h2>
            <p>
              Once a refund is approved and initiated by SeatPulse, the funds are routed back through our payment gateway (Razorpay). Please allow 5 to 7 business days for the credited amount to reflect in your original payment source (Bank Account, Credit Card, or UPI).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Failed Transactions</h2>
            <p>
              If your payment method is charged but the booking fails to generate a ticket due to technical issues, the transaction will automatically be reconciled. The deducted amount will be refunded to your original payment method within 3 to 5 business days.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}