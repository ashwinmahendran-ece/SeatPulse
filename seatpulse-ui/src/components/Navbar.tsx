import { ChevronDown } from 'lucide-react';
import type { Route } from '../types/seatpulse';
const LINKS: [string, Route][] = [['Explore', 'explore'], ["What's on", 'explore'], ['Journal', 'explore'], ['My bookings', 'bookings']];
export default function Navbar({ route, onAvatar }: { route: Route; onAvatar: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between">
        <a href="#/explore" className="font-display text-2xl font-bold tracking-tight">offbeat<span className="text-brand">*</span></a>
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          {LINKS.map(([l, r]) => (
            <a key={l} href={`#/${r}`} className={route === r && l !== "What's on" && l !== 'Journal' ? 'text-brand' : 'text-muted hover:text-ink'}>{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button className="btn2 !py-1.5">London <ChevronDown size={14} /></button>
          <button onClick={onAvatar} title="Developer settings" className="flex h-9 w-9 items-center justify-center rounded-full bg-brandLight text-xs font-bold text-brandDeep">AL</button>
        </div>
      </div>
    </header>
  );
}
