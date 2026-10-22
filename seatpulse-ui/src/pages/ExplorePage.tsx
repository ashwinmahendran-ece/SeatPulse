import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Search, Tag } from 'lucide-react';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';
import type { Event } from '../types';

const CATEGORIES = ['All', 'Music', 'Comedy', 'Theater', 'Sports', 'Tech'];

const CATEGORY_IMAGES: Record<string, string> = {
  Music: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
  Comedy: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&q=80&w=800',
  Theater: 'https://images.unsplash.com/photo-1507676184212-d0330a15233c?auto=format&fit=crop&q=80&w=800',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
  Tech: 'https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=800',
  Default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
};

const getEventImage = (category?: string) => {
  return (category && CATEGORY_IMAGES[category]) || CATEGORY_IMAGES.Default;
};

const fmt = (iso: string | undefined, opts: Intl.DateTimeFormatOptions) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-GB', opts);
};

export default function ExplorePage() {
  const navigate = useNavigate();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const [activeCategory, setActiveCategory] = useState('All');

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', activeCategory],
    queryFn: () => api.events.getAll(activeCategory === 'All' ? '' : activeCategory),
  });

  return (
    <div className="min-h-screen bg-[#F8F6F2] pb-24">
      <header className="sticky top-0 z-10 border-b border-[#DCD8D2] bg-[#F8F6F2]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <span className="font-display text-2xl font-bold tracking-tight text-[#242224]">
            seatpulse<span className="text-[#6735E8]">*</span>
          </span>
          <div className="flex items-center gap-4">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#242224] shadow-sm hover:bg-gray-50">
              <Search className="h-4 w-4" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="rounded-full bg-[#6735E8]/10 px-4 py-1.5 text-sm font-semibold text-[#6735E8] hover:bg-[#6735E8]/20 transition"
                >
                  My Tickets
                </button>
                <button
                  onClick={logout}
                  className="rounded-full border border-[#DCD8D2] bg-white px-4 py-1.5 text-sm font-medium text-[#242224] hover:bg-gray-50 transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="rounded-full bg-[#242224] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#111011] transition"
              >
                Log In
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1440px] overflow-x-auto px-5 py-3 hide-scrollbar lg:px-16">
          <div className="flex gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeCategory === c
                    ? 'bg-[#242224] text-white'
                    : 'bg-white text-[#726E75] hover:bg-gray-100 hover:text-[#242224]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-5 pt-8 lg:px-16">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#242224] sm:text-5xl">
          {activeCategory === 'All' ? 'Upcoming Events' : `${activeCategory} Events`}
        </h1>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Failed to load events. Please try again.
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3 rounded-2xl p-3">
                <div className="h-48 w-full rounded-xl bg-[#EFECE6]"></div>
                <div className="h-5 w-3/4 bg-[#EFECE6] rounded"></div>
                <div className="h-4 w-1/2 bg-[#EFECE6] rounded"></div>
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#726E75]">
              No events found for this category.
            </div>
          ) : (
            events.map(event => (
              <button
                key={event.eventId}
                onClick={() => navigate(`/event/${event.eventId}`, { state: { event } })}
                className="group flex flex-col text-left transition hover:scale-[1.02] focus:outline-none"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    src={getEventImage(event.eventCategory)}
                    alt={event.eventName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {event.eventCategory && (
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#242224] backdrop-blur-md">
                      <Tag className="h-3 w-3" />
                      {event.eventCategory}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-1 px-1">
                  <h3 className="font-display text-xl font-bold text-[#242224] line-clamp-1 group-hover:text-[#6735E8] transition">
                    {event.eventName}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-sm text-[#726E75]">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">
                      {fmt(event.eventStartTime, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#726E75]">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">Virtual / Venue</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </main>
    </div>
  );
}