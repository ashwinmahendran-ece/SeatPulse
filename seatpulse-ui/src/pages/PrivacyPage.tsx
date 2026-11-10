import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07090E] font-sans text-white pb-24">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090E]/90 backdrop-blur-md px-5 lg:px-16 h-16 flex items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-5 pt-12">
        <h1 className="font-display text-3xl font-bold mb-8 text-white">Privacy Policy</h1>

        <div className="space-y-8 text-slate-300 text-sm leading-relaxed bg-[#11131A] p-8 sm:p-10 rounded-2xl border border-white/10">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. Information Collection</h2>
            <p>
              We collect personal information that you voluntarily provide to us when registering, expressing an interest in obtaining information about us or our products, or otherwise contacting us. This includes your name, email address, phone number, and account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. How We Use Your Information</h2>
            <p>
              We use personal information collected via our platform for a variety of business purposes, including:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Facilitating account creation and login processes.</li>
                <li>Processing ticket bookings and delivering digital tickets.</li>
                <li>Sending administrative information, such as order confirmations and event updates.</li>
                <li>Providing customer support and responding to inquiries.</li>
              </ul>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. Payment Processing</h2>
            <p>
              We use Razorpay for processing payments. We do not store your credit card details or UPI PINs on our servers. Your financial data is securely processed directly by our payment gateway partner, adhering to PCI-DSS compliance standards.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please remember that we cannot guarantee that the internet itself is 100% secure.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}