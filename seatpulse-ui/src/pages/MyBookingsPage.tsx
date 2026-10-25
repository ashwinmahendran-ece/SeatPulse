import { useState } from 'react';
import { CalendarDays, Mail } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import { EVENTS } from '../data';
import type { Route } from '../types/seatpulse';

const TABS: [string, number][] = [['Upcoming', 2], ['Past experiences', 8], ['Cancelled', 1], ['Saved', 6]];
const BOOKED = [20, 22];

const BookingCard = ({ id, title, badge, when }: { id: string; title: string; badge: string; when: string }) => (
  <div className="card overflow-hidden">
    <div className="flex gap-5 p-5">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-brandLight text-brandDeep"><b className="text-xl">{badge}</b><span className="text-[10px] font-semibold">{when}</span></div>
      <div className="flex-1"><span className="chip">Confirmed · {id}</span><h3 className="mt-2 text-xl font-bold">{title}</h3>
        <div className="mt-3 flex gap-2"><button className="btn !py-2">View tickets</button><button className="btn2 !py-2">Manage booking</button></div></div>
    </div>
    <p className="flex items-center gap-2 bg-emerald-50 px-5 py-2.5 text-xs font-medium text-emerald-800"><Mail size={14} /> Confirmation sent to alex.lee@email.com</p>
  </div>
);

export default function MyBookingsPage({ go }: { go: (r: Route) => void }) {
  const [tab, setTab] = useState('Upcoming');
  const [synced, setSynced] = useState(false);
  const days = [...Array(6).fill(0), ...Array.from({ length: 30 }, (_, i) => i + 1)];
  return (
    <div className="wrap py-10">
      <div className="flex flex-wrap items-end justify-between gap-4"><h1 className="text-5xl font-bold">Good plans, Alex.</h1>
        <button className="btn" onClick={() => go('explore')}>Find your next thing</button></div>
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-line">
        {TABS.map(([t, n]) => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${tab === t ? 'border-brand text-brand' : 'border-transparent text-muted'}`}>{t} <span className="chip ml-1">{n}</span></button>
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          {tab === 'Upcoming' ? (<><h2 className="text-2xl font-bold">Next up</h2>
            <BookingCard id="OB-2611-0842" title="After Hours: Light / Sound" badge="NOV 20" when="FRIDAY" />
            <BookingCard id="OB-2611-0618" title="Clay, coffee & good company" badge="NOV 22" when="SUNDAY" /></>)
            : <p className="card p-10 text-center text-muted">Nothing to show in “{tab}” yet. Your {tab.toLowerCase()} plans will land here.</p>}
        </section>
        <aside className="space-y-5">
          <div className="card p-5"><h3 className="mb-3 text-lg font-bold">November 2026</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="py-1 font-semibold text-muted">{d}</span>)}
              {days.map((d, i) => <span key={i} className={`rounded-full py-1.5 ${BOOKED.includes(d) ? 'bg-brand font-bold text-white' : ''}`}>{d || ''}</span>)}
            </div>
            <button className="btn2 mt-4 w-full" onClick={() => setSynced(true)}><CalendarDays size={16} /> {synced ? 'Calendar synced' : 'Sync my calendar'}</button></div>
          <div className="card p-5"><h3 className="font-bold">Plans changed?</h3><p className="mt-1 text-sm text-muted">Cancel or transfer tickets up to 48 hours before the event.</p></div>
        </aside>
      </div>
      <h2 className="mb-5 mt-16 text-3xl font-bold">Keep the good plans coming.</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {EVENTS.slice(2, 5).map((e) => (
          <EventCard
            key={e.id}
            event={{
              eventId: e.id,
              eventName: e.title,
              eventCategory: '',
              eventStartTime: '',
              eventEndTime: '',
              imageUrl: e.image,
            }}
          />
        ))}
      </div>
    </div>
  );
}
