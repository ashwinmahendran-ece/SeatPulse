import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#07090e] border-t border-white/5 pt-16 pb-8 font-sans text-[#f4f2ee]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight no-underline mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#e8d5b5] text-[#07090e] grid place-items-center text-lg">S</span>
              <span className="font-display text-white text-xl">Seat</span>
              <span className="font-display text-[#e8d5b5] text-xl -ml-2">Pulse</span>
            </Link>
            <p className="text-[#aeb2bb] text-sm leading-relaxed">
              The premier platform for high-concurrency event ticketing. Secure your spot or host your next unforgettable experience.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end p-6 rounded-2xl bg-[#11131a] border border-[#292c35] md:text-right">
            <h3 className="text-[#f4f2ee] font-bold text-lg mb-2">Already an Organizer?</h3>
            <p className="text-[#aeb2bb] text-sm mb-4">Log in to manage your venues and ticket sales.</p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#07090e] bg-[#e8d5b5] hover:bg-white px-5 py-2.5 rounded-full transition-colors"
            >
              Admin Portal <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 border-t border-white/5 pt-12">
          <div>
            <h4 className="font-mono text-[#e8d5b5] text-xs font-bold uppercase tracking-widest mb-4">Discover</h4>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">Upcoming Events</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[#e8d5b5] text-xs font-bold uppercase tracking-widest mb-4">Account</h4>
            <ul className="space-y-3">
              <li><Link to="/profile" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">My Tickets</Link></li>
              <li><Link to="/login" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[#e8d5b5] text-xs font-bold uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">Contact Support</Link></li>
              <li><Link to="/host" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">Create Your Event</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[#e8d5b5] text-xs font-bold uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refunds" className="text-[#aeb2bb] hover:text-[#e8d5b5] text-sm transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5">
          <p className="text-[#aeb2bb] text-xs">
            © {currentYear} SeatPulse. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0 text-[#aeb2bb] text-xs font-mono uppercase tracking-wider">
            <span>Built for high concurrency</span>
          </div>
        </div>

      </div>
    </footer>
  );
}