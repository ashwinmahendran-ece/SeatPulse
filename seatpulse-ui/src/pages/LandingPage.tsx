import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Calendar, MapPin, Ticket, Flame } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../api/seatPulseApi';
import Footer from '../components/Footer';

const getEventImage = (category?: string) => {
  const CATEGORY_IMAGES: Record<string, string> = {
    Music: 'https://images6.alphacoders.com/478/thumb-1920-478918.jpg',
    Comedy: 'https://media.istockphoto.com/id/827698600/photo/dark-empty-stage-with-microphone-3d-render.jpg?s=612x612&w=0&k=20&c=vey5jZz8dYxauIhm3WaNEhHCcpxX4eI9-a0DidbzHMU=',
    Theater: 'https://img.magnific.com/free-photo/rows-red-seats-theater_53876-64710.jpg?semt=ais_hybrid&w=740&q=80',
    Sports: 'https://i.pinimg.com/736x/86/5c/64/865c64b0b63a33036c40f40b4f9a5a93.jpg',
    Tech: 'https://i.pinimg.com/736x/00/08/06/0008069a050ade9ecf214d6ddd18021d.jpg',
    Default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
  };
  return (category && CATEGORY_IMAGES[category]) || CATEGORY_IMAGES.Default;
};

const formatEventDate = (dateVal: string | number[] | undefined) => {
  if (!dateVal) return 'Date TBA';
  let d: Date;
  if (Array.isArray(dateVal)) {
    const [y, m, day, h = 0, min = 0, s = 0] = dateVal;
    d = new Date(y, m - 1, day, h, min, s);
  } else { d = new Date(dateVal); }
  if (Number.isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isHovered, setIsHovered] = useState(false);
  const isAutoScrolling = useRef(false);

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => api.events.getAll('', 0, 50),
  });

  const now = new Date().getTime();
  const rawEvents = eventData?.content || [];

  const upcomingEvents = rawEvents
    .filter((e: any) => {
      let eventTime = 0;
      if (Array.isArray(e.eventStartTime)) {
        const [y, m, day, h = 0, min = 0, s = 0] = e.eventStartTime;
        eventTime = new Date(y, m - 1, day, h, min, s).getTime();
      } else {
        eventTime = new Date(e.eventStartTime).getTime();
      }
      return eventTime > now;
    })
    .sort((a: any, b: any) => {
      const timeA = Array.isArray(a.eventStartTime) ? new Date(a.eventStartTime[0], a.eventStartTime[1]-1, a.eventStartTime[2]).getTime() : new Date(a.eventStartTime).getTime();
      const timeB = Array.isArray(b.eventStartTime) ? new Date(b.eventStartTime[0], b.eventStartTime[1]-1, b.eventStartTime[2]).getTime() : new Date(b.eventStartTime).getTime();
      return timeA - timeB;
    })
    .slice(0, 7);

  const smoothScrollToElement = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const target = document.getElementById(elementId);
    if (!target) return;

    isAutoScrolling.current = true;
    setIsHovered(false);

    const headerOffset = 60;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    const startPosition = window.pageYOffset;
    const distance = offsetPosition - startPosition;
    const duration = 1500;
    let start: number | null = null;

    const easeInOutCubic = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t * t + b;
      t -= 2;
      return (c / 2) * (t * t * t + 2) + b;
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);

      window.scrollTo(0, run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        setTimeout(() => {
          isAutoScrolling.current = false;
        }, 100);
      }
    };

    requestAnimationFrame(animation);
  };

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

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); }
        }
        .animate-infinite-scroll {
          animation: scroll 90s linear infinite;
        }
        .is-paused {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* HEADER */}
      <header className="w-full border-b border-white/10 bg-[#07090e]/90 backdrop-blur-md sticky top-0 z-50 shadow-none">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-wrap justify-between items-center gap-4">
          <a href="#top" onClick={(e) => smoothScrollToElement(e, 'top')} className="flex items-center gap-2 font-extrabold tracking-tight no-underline cursor-pointer">
            <span className="w-8 h-8 rounded-lg bg-[#e8d5b5] text-[#07090e] grid place-items-center">S</span>
            <span className="font-display text-white text-lg">Seat</span>
            <span className="font-display text-[#e8d5b5] text-lg -ml-2">Pulse</span>
          </a>

          <nav className="flex items-center gap-4 sm:gap-7">
            <a href="#events" onClick={(e) => smoothScrollToElement(e, 'events')} className="text-[#b9bbc1] hover:text-white transition-colors text-sm font-semibold cursor-pointer">
              Featured Events
            </a>
            {user ? (
              <button onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/profile')} className="rounded-full px-5 py-2.5 border border-[#e8d5b5] text-[#e8d5b5] hover:bg-[#e8d5b5] hover:text-[#07090e] transition-colors text-sm font-bold">
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
        <section className="grid-glow hero-aura w-full overflow-hidden border-b border-white/10 relative">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 lg:py-28 grid lg:grid-cols-[1.12fr_.88fr] items-center gap-16 animate-fade-in">
            <div className="animate-slide-up">
              <p className="font-mono uppercase tracking-[0.16em] text-[#e8d5b5] mb-6 text-xs font-bold">THE NEW STANDARD IN EVENT TICKETING</p>
              <h1 className="font-display font-extrabold max-w-3xl mb-7 text-4xl sm:text-5xl lg:text-[54px] leading-[1.1] text-[#f4f2ee] tracking-tight">
                The Ultimate Ticketing Experience
              </h1>
              <p className="text-[#aeb2bb] leading-relaxed max-w-xl mb-10 text-lg">
                Premium by design. Fast by default. SeatPulse brings every seat, order, and unforgettable moment into one seamless experience.
              </p>

              {/* RESTORED PREMIUM BUTTON UI FOR FIRST PAGE */}
              <button onClick={(e) => smoothScrollToElement(e, 'events')} className="group inline-flex items-center gap-3 rounded-full px-8 py-4 font-bold bg-[#e8d5b5] text-[#101116] hover:bg-white transition-all shadow-[0_0_40px_rgba(232,213,181,0.15)] focus:outline-none">
                View Featured Events
                <ArrowRight size={18} className="rotate-90 transition-transform duration-300 group-hover:translate-y-1" />
              </button>
            </div>

            {/* DIGITAL TICKET MOCKUP */}
            <div className="relative max-w-lg w-full mx-auto animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div className="absolute inset-6 bg-[#e8d5b5]/10 blur-3xl rounded-full"></div>
              <div className="ticket-gradient ticket-dash relative rounded-[28px] border border-[#4e473d] p-7 sm:p-9 overflow-hidden shadow-[0_35px_90px_rgba(0,0,0,0.6),0_0_80px_rgba(232,213,181,0.1)] md:rotate-3 transition-transform hover:rotate-0 duration-500">
                <div className="flex justify-between items-start">
                  <p className="font-extrabold tracking-tight"><span className="text-white">Seat</span><span className="text-[#e8d5b5]">Pulse</span></p>
                  <span className="font-mono text-[#e8d5b5] text-[10px] uppercase tracking-widest border border-[#e8d5b5]/30 px-2 py-1 rounded bg-[#07090e]/50 backdrop-blur-md">DIGITAL PASS</span>
                </div>
                <div className="mt-16 mb-12">
                  <p className="font-mono text-[#a9a5a0] mb-3 text-[11px] uppercase tracking-widest">YOUR NEXT EXPERIENCE</p>
                  <h2 className="font-display font-extrabold tracking-tight text-[#f4f2ee] text-3xl">Every moment, perfectly placed.</h2>
                </div>
                <div className="flex justify-between items-end gap-4 pt-9 border-t border-dashed border-[#6b6862] mt-8">
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

        {/* SECTION 2: LIVE FEATURED EVENTS */}
        <section id="events" className="w-full pt-20 lg:pt-28 pb-4 bg-[#07090e] overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[#e8d5b5] text-xs font-bold uppercase tracking-[0.16em] mb-4">01 / FEATURED EXPERIENCES</p>
              <h2 className="font-display font-extrabold text-[#f4f2ee] text-3xl sm:text-4xl">Trending Events</h2>
              <p className="text-[#aeb2bb] mt-4 max-w-xl text-base">Secure your spot at the fastest-selling tech summits, concerts, and live shows happening right now.</p>
            </div>
            <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-[#e8d5b5] hover:text-white font-bold transition-colors">
              View all events <ArrowRight size={18} />
            </button>
          </div>

          <div className="relative w-full max-w-[1920px] mx-auto">
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-r from-[#07090e] via-[#07090e]/90 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-40 bg-gradient-to-l from-[#07090e] via-[#07090e]/90 to-transparent z-10 pointer-events-none"></div>

            {isLoading ? (
              <div className="flex gap-6 px-8 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse w-[280px] md:w-[340px] shrink-0 h-[380px] rounded-[28px] bg-[#11131a] border border-[#292c35]"></div>
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
               <div className="py-16 text-center border border-[#30333b] rounded-[28px] max-w-7xl mx-auto mx-5 bg-[#11131a]">
                 <p className="text-[#aeb2bb] font-medium">No upcoming events found. Check back soon!</p>
               </div>
            ) : (
              <div
                className={`flex w-max animate-infinite-scroll gap-6 px-4 pt-4 pb-6 ${isHovered ? 'is-paused' : ''}`}
                onMouseMove={() => {
                  if (!isAutoScrolling.current && !isHovered) setIsHovered(true);
                }}
                onMouseLeave={() => setIsHovered(false)}
              >
                {[...upcomingEvents, ...upcomingEvents].map((event: any, index: number) => {
                  const isTrending = index % 7 === 0 || index % 7 === 1;
                  return (
                    <div
                      key={`${event.eventId}-${index}`}
                      onClick={() => navigate(`/event/${event.eventId}`, { state: { event } })}
                      className="w-[280px] md:w-[340px] shrink-0 group cursor-pointer bg-[#11131a] border border-[#292c35] rounded-[28px] overflow-hidden hover:border-[#e8d5b5]/40 transition-all duration-500 hover:-translate-y-2 shadow-[0_15px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(232,213,181,0.08)] flex flex-col"
                    >
                      <div className="h-48 md:h-52 w-full overflow-hidden relative border-b border-[#292c35]">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                        <img src={getEventImage(event.eventCategory)} alt={event.eventName} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" />

                        <div className="absolute top-4 left-4 flex gap-2 z-20">
                          <span className="font-mono bg-[#07090e]/80 backdrop-blur-md border border-[#e8d5b5]/30 text-[#e8d5b5] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                            {event.eventCategory || 'Featured'}
                          </span>
                          {isTrending && (
                            <span className="font-mono bg-[#842323]/90 backdrop-blur-md border border-[#ff6b6b]/30 text-[#ffdede] flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-lg">
                              <Flame size={12} className="text-[#ff9999]" /> Fast Selling
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="font-display text-lg md:text-xl font-bold text-[#f4f2ee] mb-3 group-hover:text-[#e8d5b5] transition-colors line-clamp-2">{event.eventName}</h3>
                        <div className="space-y-2.5 text-xs font-medium text-[#a9a5a0] mb-6">
                          <p className="flex items-center gap-3"><Calendar size={14} className="text-[#e8d5b5] shrink-0 opacity-80" /> {formatEventDate(event.eventStartTime)}</p>
                          <p className="flex items-center gap-3"><MapPin size={14} className="text-[#e8d5b5] shrink-0 opacity-80" /> <span className="line-clamp-1">{event.venue || 'TBA Venue'}</span></p>
                        </div>
                        <div className="mt-auto pt-5 border-t border-[#393c46] flex justify-between items-center group-hover:border-[#e8d5b5]/30 transition-colors">
                          <span className="text-[#f4f2ee] font-bold text-sm">Secure Seats</span>
                          <Ticket size={16} className="text-[#e8d5b5] group-hover:rotate-12 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-full flex justify-center mt-4 pb-4">
            <button onClick={(e) => smoothScrollToElement(e, 'cta')} className="group flex flex-col items-center gap-2 font-mono text-[#aeb2bb] hover:text-white transition-colors focus:outline-none">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">More To Discover</span>
              <ArrowRight size={16} className="rotate-90 transition-transform duration-300 group-hover:translate-y-1.5 text-[#e8d5b5]" />
            </button>
          </div>
        </section>

{/* SECTION 3: CTA */}
        <section id="cta" className="w-full pt-16 pb-24 overflow-hidden border-t border-white/5" style={{ background: 'radial-gradient(circle at center, #1a1714 0%, #07090e 100%)' }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center relative z-10">
            <p className="font-mono text-[#e8d5b5] text-xs font-bold uppercase tracking-[0.16em] mb-5">YOUR NEXT EXPERIENCE STARTS HERE</p>
            <h2 className="font-display font-extrabold text-[#f4f2ee] text-3xl sm:text-4xl mb-5">Ready to experience it live?</h2>
            <p className="text-[#b9bbc1] text-base mb-10">Browse upcoming events and secure your spot.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/explore')} className="rounded-full bg-[#e8d5b5] text-[#101116] px-8 py-4 font-bold hover:bg-white transition-colors shadow-[0_0_40px_rgba(232,213,181,0.2)]">
                Explore All Events ↗
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

    </div>
  );
}