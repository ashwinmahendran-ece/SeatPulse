import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Ticket } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

// You can easily update this array later or fetch it from your backend via api.events.getAll()
const featuredEvents = [
  {
    id: 1,
    title: 'Global Tech Summit 2026',
    category: 'Technology',
    date: 'Nov 15, 2026',
    venue: 'KTPO Convention Centre, Bangalore',
    image: 'https://i.pinimg.com/736x/00/08/06/0008069a050ade9ecf214d6ddd18021d.jpg',
  },
  {
    id: 2,
    title: 'Arijit Singh Live in Concert',
    category: 'Music',
    date: 'Dec 02, 2026',
    venue: 'Jawaharlal Nehru Stadium',
    image: 'https://images6.alphacoders.com/478/thumb-1920-478918.jpg',
  },
  {
    id: 3,
    title: 'Standup Comedy Festival',
    category: 'Comedy',
    date: 'Dec 18, 2026',
    venue: 'Chowdiah Memorial Hall',
    image: 'https://media.istockphoto.com/id/827698600/photo/dark-empty-stage-with-microphone-3d-render.jpg?s=612x612&w=0&k=20&c=vey5jZz8dYxauIhm3WaNEhHCcpxX4eI9-a0DidbzHMU=',
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="w-full min-h-screen bg-[#07090e] font-sans text-[#f4f2ee] selection:bg-[#E8D5B5]/30 selection:text-white">

      <style>{`
        .hero-aura { background: radial-gradient(ellipse at 77% 43%, rgba(184,143,84,0.13), transparent 48%); }
        .grid-glow {
          background-image: linear-gradient(rgba(232,213,181,0.035) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(232,213,181,0.035) 1px, transparent 1px);
          background-size: 44px 44px;
        }
        .ticket-gradient { background: linear-gradient(135deg, #22242d, #101218 65%); }
        .ticket-dash::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: 103px; border-top: 1px dashed #6b6862;
        }
      `}</style>

      {/* HEADER */}
      <header className="w-full border-b border-white/10 bg-[#07090e]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-wrap justify-between items-center gap-4">
          <a href="#top" className="flex items-center gap-2 font-extrabold tracking-tight no-underline">
            <span className="w-8 h-8 rounded-lg bg-[#e8d5b5] text-[#07090e] grid place-items-center">S</span>
            <span className="font-display text-white text-lg">Seat</span>
            <span className="font-display text-[#e8d5b5] text-lg -ml-2">Pulse</span>
          </a>

          <nav className="flex items-center gap-4 sm:gap-7">
            <a href="#events" className="text-[#b9bbc1] hover:text-white transition-colors text-sm font-semibold">Featured Events</a>
            {user ? (
              <button onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard')} className="rounded-full px-5 py-2.5 border border-[#e8d5b5] text-[#e8d5b5] hover:bg-[#e8d5b5] hover:text-[#07090e] transition-colors text-sm font-bold">
                Dashboard ↗
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="rounded-full px-5 py-2.5 border border-[#e8d5b5] text-[#e8d5b5] hover:bg-[#e8d5b5] hover:text-[#07090e] transition-colors text-sm font-bold">
                Sign In ↗
              </button>
            )}
          </nav>
        </div>
      </header>

      <main id="top">
        {/* SECTION 1: HERO */}
        <section className="grid-glow hero-aura w-full overflow-hidden border-b border-white/10">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 lg:py-28 grid lg:grid-cols-[1.12fr_.88fr] items-center gap-16 animate-fade-in">

            <div className="animate-slide-up">
              <p className="font-mono uppercase tracking-[0.16em] text-[#e8d5b5] mb-6 text-xs font-bold">THE NEW STANDARD IN EVENT TICKETING</p>
              <h1 className="font-display font-extrabold max-w-3xl mb-7 text-4xl sm:text-5xl lg:text-[54px] leading-[1.1] text-[#f4f2ee] tracking-tight">
                The Ultimate Ticketing Experience
              </h1>
              <p className="text-[#aeb2bb] leading-relaxed max-w-xl mb-8 text-lg">
                Premium by design. Fast by default. SeatPulse brings every seat, order, and unforgettable moment into one seamless experience.
              </p>

              <ul className="space-y-3 mb-9">
                <li className="flex gap-3 items-center text-[#f4f2ee] font-medium"><span className="text-[#e8d5b5]">✦</span> Instant, secure digital ticketing.</li>
                <li className="flex gap-3 items-center text-[#f4f2ee] font-medium"><span className="text-[#e8d5b5]">✦</span> Real-time alphanumeric seat reservation.</li>
                <li className="flex gap-3 items-center text-[#f4f2ee] font-medium"><span className="text-[#e8d5b5]">✦</span> Flawless high-concurrency handling.</li>
              </ul>

              <div className="flex flex-wrap items-center gap-5">
                <button onClick={() => navigate('/explore')} className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold bg-[#e8d5b5] text-[#101116] hover:bg-white transition-colors">
                  Explore Events <ArrowRight size={18} />
                </button>
                <p className="text-[#b9bbc1] text-sm font-medium">Join 10,000+ users booking seamlessly.</p>
              </div>
            </div>

            {/* DIGITAL TICKET MOCKUP */}
            <div className="relative max-w-lg w-full mx-auto animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div className="absolute inset-6 bg-[#e8d5b5]/10 blur-3xl rounded-full"></div>
              <div className="ticket-gradient ticket-dash relative rounded-[28px] border border-[#61584d] p-7 sm:p-9 overflow-hidden shadow-[0_35px_90px_rgba(0,0,0,0.6),0_0_80px_rgba(232,213,181,0.1)] md:rotate-3 transition-transform hover:rotate-0 duration-500">

                <div className="flex justify-between items-start">
                  <p className="font-extrabold tracking-tight"><span className="text-white">Seat</span><span className="text-[#e8d5b5]">Pulse</span></p>
                  <span className="font-mono text-[#e8d5b5] text-[10px] uppercase tracking-widest border border-[#e8d5b5]/30 px-2 py-1 rounded">DIGITAL PASS</span>
                </div>

                <div className="mt-16 mb-12">
                  <p className="font-mono text-[#a9a5a0] mb-3 text-[11px] uppercase tracking-widest">YOUR NEXT EXPERIENCE</p>
                  <h2 className="font-display font-extrabold tracking-tight text-[#f4f2ee] text-3xl">Every moment, perfectly placed.</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-14">
                  <div>
                    <p className="font-mono text-[#a9a5a0] mb-2 text-[11px] uppercase tracking-widest">ROW</p>
                    <p className="font-bold text-[#f4f2ee] text-lg">A</p>
                  </div>
                  <div>
                    <p className="font-mono text-[#a9a5a0] mb-2 text-[11px] uppercase tracking-widest">SEAT</p>
                    <p className="font-bold text-[#f4f2ee] text-lg">01</p>
                  </div>
                </div>

                <div className="flex justify-between items-end gap-4 pt-9">
                  <div>
                    <p className="font-mono text-[#a9a5a0] mb-2 text-[10px] uppercase tracking-widest">BUILT FOR THE MOMENT</p>
                    <p className="text-[#e8d5b5] font-bold text-base">Access, elevated.</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=SEATPULSE-PREVIEW&color=000000&bgcolor=ffffff`} alt="QR Code" className="w-20 h-20" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: BEST EVENTS (Replaces Architecture & Seat Map) */}
        <section id="events" className="w-full py-20 lg:py-28 bg-[#07090e]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <p className="font-mono text-[#e8d5b5] text-xs font-bold uppercase tracking-[0.16em] mb-4">01 / FEATURED EXPERIENCES</p>
                <h2 className="font-display font-extrabold text-[#f4f2ee] text-3xl sm:text-4xl">The Best Events</h2>
                <p className="text-[#aeb2bb] mt-4 max-w-xl text-base">Secure your spot at the most anticipated tech summits, concerts, and live shows happening right now.</p>
              </div>
              <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-[#e8d5b5] hover:text-white font-bold transition-colors">
                View all events <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredEvents.map((event) => (
                <div key={event.id} onClick={() => navigate('/explore')} className="group cursor-pointer bg-[#11131a] border border-[#30333b] rounded-3xl overflow-hidden hover:border-[#e8d5b5]/50 transition-all duration-300 hover:-translate-y-1 shadow-xl">
                  <div className="h-56 w-full overflow-hidden relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-[#e8d5b5] text-[#07090e] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                      {event.category}
                    </div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <h3 className="font-display text-xl font-bold text-white mb-4 group-hover:text-[#e8d5b5] transition-colors line-clamp-1">{event.title}</h3>
                    <div className="space-y-2.5 text-sm font-medium text-[#aeb2bb]">
                      <p className="flex items-center gap-3"><Calendar size={16} className="text-[#e8d5b5]" /> {event.date}</p>
                      <p className="flex items-center gap-3"><MapPin size={16} className="text-[#e8d5b5]" /> <span className="line-clamp-1">{event.venue}</span></p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-[#292c35] flex justify-between items-center">
                      <span className="text-white font-bold">Book Now</span>
                      <Ticket size={20} className="text-[#e8d5b5] group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: CTA */}
        <section className="w-full py-24 overflow-hidden border-t border-white/10" style={{ background: 'radial-gradient(circle at center, #1a1714 0%, #07090e 100%)' }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center relative z-10">
            <p className="font-mono text-[#e8d5b5] text-xs font-bold uppercase tracking-[0.16em] mb-5">YOUR NEXT EXPERIENCE STARTS HERE</p>
            <h2 className="font-display font-extrabold text-[#f4f2ee] text-3xl sm:text-4xl mb-5">Ready to experience it live?</h2>
            <p className="text-[#b9bbc1] text-base mb-2">Browse upcoming events and secure your spot.</p>
            <p className="text-[#b9bbc1] text-base mb-10">Manage platform analytics, revenue, and active bookings as an Admin.</p>

            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/explore')} className="rounded-full bg-[#e8d5b5] text-[#101116] px-8 py-4 font-bold hover:bg-white transition-colors">
                Explore Events ↗
              </button>
              <button onClick={() => navigate('/admin')} className="rounded-full border border-[#e8d5b5] text-[#e8d5b5] px-8 py-4 font-bold hover:bg-[#e8d5b5] hover:text-[#101116] transition-colors">
                Admin Portal ↗
              </button>
            </div>
          </div>
        </section>

      </main>



    </div>
  );
}