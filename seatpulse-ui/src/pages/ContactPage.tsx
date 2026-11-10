import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#07090E] font-sans text-white pb-24">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090E]/90 backdrop-blur-md px-5 lg:px-16 h-16 flex items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-5 pt-12">
        <h1 className="font-display text-3xl font-bold mb-8 text-white">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#11131A] p-8 rounded-2xl border border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-white">Get in Touch</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our support team is available to assist you with booking inquiries, payment issues, and platform support.
            </p>

            <div className="space-y-4 pt-4 border-t border-white/10 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="text-slate-500 shrink-0" size={18} />
                <span>seatpulsesupport@gmail.com</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-slate-500 shrink-0 mt-1" size={18} />
                <span>BTM Layout<br/>Bengaluru, Karnataka<br/>India - 560076</span>
              </div>
            </div>
          </div>

          <div className="bg-[#11131A] p-8 rounded-2xl border border-white/10 flex flex-col justify-center">
            <h2 className="text-xl font-bold mb-4 text-white">Business Hours</h2>
            <div className="space-y-2 text-sm text-slate-400 mb-8">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="text-slate-300">9:00 AM - 6:00 PM IST</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="text-slate-300">10:00 AM - 4:00 PM IST</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-slate-300">Closed</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Average response time for email inquiries is 24 business hours. For urgent issues regarding an event happening within the next 24 hours, please include "URGENT" in your email subject line.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}