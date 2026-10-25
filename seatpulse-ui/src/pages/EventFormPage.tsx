import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Loader2, Tag, Type, Hash, MapPin, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';

const CATEGORIES = ['Music', 'Comedy', 'Theater', 'Sports', 'Tech', 'Concert', 'Live AV'];

// A comprehensive list of Tamil Nadu major cities and districts
const TAMIL_NADU_CITIES = [
  'Chennai', 'Coimbatore', 'Cuddalore', 'Dindigul', 'Erode',
  'Hosur', 'Kanchipuram', 'Kanyakumari', 'Karaikudi', 'Karur',
  'Kumbakonam', 'Madurai', 'Nagapattinam', 'Nagercoil', 'Neyveli',
  'Ooty (Udhagamandalam)', 'Pollachi', 'Pudukkottai', 'Rajapalayam',
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
    location: '', // Starts empty to force the user to select one
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

    setIsLoading(true);
    try {
      const payload = {
        eventName: formData.eventName,
        eventCategory: formData.eventCategory,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        totalSeats: parseInt(formData.totalSeats, 10),
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
    <div className="min-h-screen bg-slate-950 pb-24 font-sans text-slate-100">
      <div className="mx-auto max-w-3xl px-5 pt-8 lg:px-16">
        <button
          onClick={() => navigate('/admin')}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-10">
          <h1 className="font-display text-3xl font-bold text-white">Create New Event</h1>
          <p className="mt-2 text-sm text-slate-400">Fill in the details below to launch a new experience.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Hash size={16} className="text-indigo-400" /> Total Seats
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  required
                  min="1"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 rounded-xl border border-slate-800 bg-slate-950/50 p-5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <MapPin size={16} className="text-indigo-400" /> City (Tamil Nadu)
                </label>
                {/* CHANGED FROM INPUT TO SELECT */}
                <select
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
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
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] hover:bg-indigo-500 disabled:pointer-events-none disabled:opacity-70"
              >
                {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating Event...</> : 'Save & Continue to Seating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}