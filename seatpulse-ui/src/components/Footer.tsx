import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();

  // Hide footer on Explore and Event Details pages
  if (location.pathname === '/explore' || location.pathname.startsWith('/event/')) {
    return null;
  }

  if (location.pathname === '/profile') {
    return (
      <footer className="w-full border-t border-white/10 bg-[#07090E] py-8 text-center mt-auto z-10 relative">
        <div className="mx-auto max-w-[1440px] px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-500 text-sm font-medium mb-4 md:mb-0">
            © {new Date().getFullYear()} SeatPulse. Secure Ticketing.
          </p>
          <p className="text-slate-500 text-sm font-medium">
            Need help with your tickets? <a href="mailto:support@seatpulse.com" className="text-[#E8D5B5] hover:text-white transition-colors font-bold">Contact VIP Support</a>
          </p>
        </div>
      </footer>
    );
  }

  // Standard Landing Page Footer
  return (
    <footer className="w-full bg-[#07090E] text-white mt-auto border-t border-white/10">
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-12">

          <div className="md:col-span-2">
            <Link to="/" className="font-display text-3xl font-black tracking-tight text-white mb-4 inline-block">
              Seat<span className="text-[#E8D5B5] ml-1.5">Pulse</span>
            </Link>
            <p className="text-slate-400 max-w-sm mt-4 leading-relaxed font-medium">
              Curated events and seamless reservations. Secure your seats instantly at the city's finest venues.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-500 text-sm mb-6">Legal</h4>
            <ul className="space-y-4 font-medium text-slate-300">
              <li><Link to="#" className="hover:text-[#E8D5B5] transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-[#E8D5B5] transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-[#E8D5B5] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-500 text-sm mb-6">System</h4>
            <ul className="space-y-4 font-medium text-slate-300">
              <li><Link to="/login" className="hover:text-[#E8D5B5] transition-colors">Admin Login</Link></li>
              <li><Link to="#" className="hover:text-[#E8D5B5] transition-colors">Venue Partners</Link></li>
              <li><Link to="#" className="hover:text-[#E8D5B5] transition-colors">Support Center</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-sm font-medium text-slate-500">
          <p>© {new Date().getFullYear()} SeatPulse. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}