import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07090E] font-sans text-white pb-24">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090E]/90 backdrop-blur-md px-5 lg:px-16 h-16 flex items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-5 pt-12">
        <h1 className="font-display text-3xl font-bold mb-8 text-white">Terms of Service</h1>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed bg-[#11131A] p-8 sm:p-10 rounded-2xl border border-white/10">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Introduction</h2>
            <p>
              Welcome to SeatPulse. These Terms of Service govern your use of our website and ticketing platform. By accessing or using SeatPulse, you agree to be bound by these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. Ticket Purchases</h2>
            <p>
              All ticket sales are subject to availability. When you select a seat, it may be temporarily reserved while you complete your transaction. If the transaction is not completed within the allotted time, the reservation will be released. A booking is only confirmed once full payment is received and a confirmation email or ticket ID is issued.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Pricing and Fees</h2>
            <p>
              Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We use third-party payment gateways (e.g., Razorpay) to process transactions securely. You agree to pay all charges incurred by you or any users of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. User Responsibilities</h2>
            <p>
              You agree to provide accurate information during registration and checkout. You are responsible for maintaining the confidentiality of your account credentials. Automated scraping, bot purchasing, or any activity that disrupts platform operations is strictly prohibited and will result in account termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">5. Limitation of Liability</h2>
            <p>
              SeatPulse acts as an intermediary ticketing platform for event organizers. We are not responsible for the organization, quality, or execution of the events. Any disputes regarding the event itself must be directed to the respective event organizer.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}