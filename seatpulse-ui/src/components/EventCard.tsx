import React from 'react';
import type { Event } from '../types';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {

  const getCoverImage = (category: string = '') => {
    const cleanCategory = category.trim().toLowerCase();

    const imageMap: Record<string, string> = {
      'Tech': 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=800',
      'Music': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800',
      'Concert': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800',
      'club nights': 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=800',
      'live av': 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
      'spatial sound': 'https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=800',
      'installations': 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&q=80&w=800'
    };

    return imageMap[cleanCategory] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800';
  };

  const coverImage = getCoverImage(event.eventCategory);

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <img
        src={coverImage}
        alt={event.eventName}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800';
        }}
      />

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{event.eventName}</h3>
          <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
            {event.eventCategory}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {new Date(event.eventStartTime).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};