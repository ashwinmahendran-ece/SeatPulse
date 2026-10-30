import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white font-sans uppercase selection:bg-cyan selection:text-black overflow-x-hidden">

      {/* INLINE BRUTALIST STYLES */}
      <style>{`
        .marquee-container {
          width: 100vw;
          overflow: hidden;
          white-space: nowrap;
          border-top: 2px solid #00FFFF;
          border-bottom: 2px solid #00FFFF;
          background-color: #050505;
          color: #00FFFF;
        }
        .marquee-content {
          display: inline-block;
          animation: marquee 15s linear infinite;
          padding: 1rem 0;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hard-hover:hover {
          background-color: #00FFFF;
          color: #050505;
          transition: none;
        }
      `}</style>

      {/* 1. HERO GRID */}
      <section className="w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 border-b border-gray">

        {/* Left Typography Block */}
        <div className="md:col-span-8 border-r border-gray p-6 md:p-12 lg:p-20 flex flex-col justify-end min-h-[60vh] md:min-h-[80vh]">
          <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.85] tracking-tighter text-white mb-6">
            DISTRICT<br/>
            <span className="text-amethyst">ACCESS.</span>
          </h1>
          <p className="font-mono text-cyan text-sm md:text-lg max-w-md tracking-widest">
            // UNFILTERED EVENT ALLOCATION. DIRECT RESERVATION PROTOCOL.
          </p>
        </div>

        {/* Right Action Block */}
        <div className="md:col-span-4 flex flex-col">
          <div className="flex-1 p-6 md:p-12 border-b border-gray flex items-end">
            <p className="font-bold text-xl md:text-3xl leading-tight">
              SECURE YOUR ENTRY. NO QUEUES. NO MIDDLEMEN.
            </p>
          </div>
          <Link
            to="/explore"
            className="w-full bg-amethyst text-white font-mono font-black text-xl md:text-2xl p-8 text-center uppercase tracking-widest border-t-4 border-transparent hover:border-cyan hard-hover"
          >
            ENTER DIRECTORY
          </Link>
        </div>
      </section>

      {/* 2. TICKER TAPE */}
      <div className="marquee-container my-12">
        <div className="marquee-content font-mono text-xl font-bold tracking-widest">
          SYSTEM ONLINE // ZERO FEES // SECURE ALLOCATION // SYSTEM ONLINE // ZERO FEES // SECURE ALLOCATION // SYSTEM ONLINE // ZERO FEES // SECURE ALLOCATION //
        </div>
      </div>

      {/* 3. ASYMMETRICAL SPECIFICATION GRID */}
      <section className="w-full max-w-[1440px] mx-auto px-6 py-12">
        <h2 className="font-mono text-amethyst text-2xl font-black mb-8 tracking-widest">
          [ ARCHITECTURE ]
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray">

          <div className="p-10 md:p-16 border-b md:border-b-0 md:border-r border-gray hover:bg-white hover:text-black transition-none group">
            <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-6">QR PROTOCOL</h3>
            <p className="font-mono text-sm md:text-base opacity-80 group-hover:opacity-100 uppercase">
              Encrypted digital passes generated instantly upon ledger confirmation.
            </p>
          </div>

          <div className="grid grid-rows-2">
            <div className="p-8 border-b border-gray hover:bg-amethyst hover:text-white transition-none group">
              <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-3">CONCURRENCY</h3>
              <p className="font-mono text-xs md:text-sm opacity-80 group-hover:opacity-100 uppercase">
                Pessimistic locking enforced. Zero double-bookings.
              </p>
            </div>
            <div className="p-8 hover:bg-cyan hover:text-black transition-none group">
              <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-3">CURATION</h3>
              <p className="font-mono text-xs md:text-sm opacity-80 group-hover:opacity-100 uppercase">
                Exclusive grid access to verified sector venues only.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. MASSIVE TERMINAL FOOTER CTA */}
      <section className="w-full border-t border-gray mt-24">
        <Link
          to="/explore"
          className="block w-full text-center py-32 md:py-48 bg-black hover:bg-cyan text-white hover:text-black transition-none group border-b-[16px] border-amethyst group-hover:border-black"
        >
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter group-hover:tracking-widest transition-all duration-150">
            INITIALIZE
          </h2>
        </Link>
      </section>

    </div>
  );
}