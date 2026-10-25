import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Zap, Ticket, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 flex flex-col relative overflow-x-hidden font-sans">

      {/* Premium Deep Ambient Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex-grow flex flex-col justify-center z-10">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-16 text-center flex flex-col items-center">

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 mb-8 shadow-sm">
            <Star className="w-4 h-4 text-indigo-400" fill="currentColor" />
            <span className="text-sm font-semibold tracking-wide uppercase text-slate-300">The new standard for live events</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 max-w-5xl mx-auto">
            Your ticket to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">extraordinary.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Stop fighting for tickets. SeatPulse gives you interactive venue maps, instant checkouts, and zero hidden fees.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/explore')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all duration-300 group"
            >
              Explore Events
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-lg font-semibold rounded-full transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div className="max-w-[1440px] mx-auto px-5 lg:px-16 py-24 relative z-10 w-full">
         <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group shadow-lg shadow-black/50">
              <div className="w-14 h-14 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Map className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-100 tracking-tight">Spatial Seat Maps</h3>
              <p className="text-slate-400 leading-relaxed">
                Pick your exact seat with our interactive 2D venue builder. Know exactly where you'll sit before you pay.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group shadow-lg shadow-black/50">
              <div className="w-14 h-14 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-100 tracking-tight">Instant Lock</h3>
              <p className="text-slate-400 leading-relaxed">
                No more "Someone beat you to it." The moment you click a seat, it's locked exclusively for you while you check out.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:-translate-y-1 hover:border-indigo-500/50 transition-all duration-300 group shadow-lg shadow-black/50">
              <div className="w-14 h-14 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Ticket className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-100 tracking-tight">Zero-Friction Checkout</h3>
              <p className="text-slate-400 leading-relaxed">
                Powered by Razorpay for seamless, secure transactions. Your digital ticket is delivered instantly to your dashboard.
              </p>
            </div>

         </div>
      </div>
    </div>
  );
}