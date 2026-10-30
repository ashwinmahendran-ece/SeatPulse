import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Loader2, Tag, Type, Hash, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';

const CATEGORIES = ['Music', 'Comedy', 'Theater', 'Sports', 'Tech', 'Concert', 'Live AV'];

const TAMIL_NADU_CITIES = [
  'Chennai', 'Coimbatore', 'Cuddalore', 'Dindigul', 'Erode',
  'Hosur', 'Kanchipuram', 'Kanyakumari', 'Karaikudi', 'Karur',
  'Kumbakonam', 'Madurai', 'Nagapattinam', 'Nagercoil', 'Neyveli',
  'Ooty', 'Pollachi', 'Pudukkottai', 'Rajapalayam',
  'Ranipet', 'Salem', 'Sivakasi', 'Thanjavur', 'Thoothukudi',
  'Tiruchirappalli (Trichy)', 'Tirunelveli', 'Tiruppur', 'Tiruvannamalai',
  'Vellore'
];

export default function EventFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    eventCategory: CATEGORIES[0],
    eventStartTime: '',
    eventEndTime: '',
    totalSeats: '',
    location: '',
    venue: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.eventStartTime) >= new Date(formData.eventEndTime)) {
      toast.error('End time must be after start time.');
      return;
    }

    if (!formData.location) {
      toast.error('Please select a city.');
      return;
    }

    const requestedSeats = parseInt(formData.totalSeats, 10);
    if (!requestedSeats || requestedSeats <= 0) {
      toast.error('Please enter a valid total seating capacity.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        eventName: formData.eventName,
        eventCategory: formData.eventCategory,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        totalSeats: requestedSeats,
        location: formData.location,
        venue: formData.venue
      };

      const newEvent = await api.events.create(payload);

      await queryClient.invalidateQueries({ queryKey: ['admin-events'] });

      toast.success('Event created successfully!');
      navigate(`/admin/events/${newEvent.eventId}/seating`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1C1E] pb-24 font-sans text-slate-100 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1F2124]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="flex items-center font-display text-xl font-black tracking-[-0.03em] whitespace-nowrap">
            <span className="text-white">Seat</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-[#05d5ff] ml-1">Pulse</span>
            <span className="text-indigo-500 animate-pulse ml-0.5">*</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pt-10 lg:px-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white">Create New Event</h1>
          <p className="mt-2 text-sm text-slate-400">Configure event details and core capacity before designing the map.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-[#1F2124] p-6 shadow-xl sm:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Event Details</h2>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Type size={16} className="text-indigo-400" /> Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  required
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="e.g., Ilaiyaraaja Live Concert"
                  className="w-full rounded-xl border border-white/10 bg-[#1A1C1E] px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Tag size={16} className="text-indigo-400" /> Category
                  </label>
                  <select
                    name="eventCategory"
                    value={formData.eventCategory}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#1A1C1E] px-4 py-3.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Hash size={16} className="text-indigo-400" /> Total Active Capacity
                  </label>
                  <input
                    type="number"
                    name="totalSeats"
                    required
                    min="1"
                    value={formData.totalSeats}
                    onChange={handleChange}
                    placeholder="Maximum number of attendees"
                    className="w-full rounded-xl border border-white/10 bg-[#1A1C1E] px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#1F2124] p-6 shadow-xl sm:p-8">
            <h2 className="font-display text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Schedule & Location</h2>

            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <MapPin size={16} className="text-indigo-400" /> City (Tamil Nadu)
                  </label>
                  <select
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#1A1C1E] px-4 py-3.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Select a city...</option>
                    {TAMIL_NADU_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Building size={16} className="text-indigo-400" /> Venue Name
                  </label>
                  <input
                    type="text"
                    name="venue"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="e.g., Nehru Stadium"
                    className="w-full rounded-xl border border-white/10 bg-[#1A1C1E] px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Calendar size={16} className="text-indigo-400" /> Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="eventStartTime"
                    required
                    value={formData.eventStartTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#1A1C1E] px-4 py-3.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Calendar size={16} className="text-indigo-400" /> End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="eventEndTime"
                    required
                    value={formData.eventEndTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#1A1C1E] px-4 py-3.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-6 pb-12">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-base font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.01] hover:bg-indigo-500 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
            >
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Launching Event...</> : 'Save Details & Design Map'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}