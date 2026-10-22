import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Calendar, MapPin, Loader2, LogOut, ArrowLeft, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

const fmt = (iso: string | undefined) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.user.getMyBookings(),
  });

  const cancelMutation = useMutation({
    mutationFn: (seatId: number) => api.user.cancelBooking(seatId),
    onSuccess: () => {
      toast.success('Ticket cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not cancel ticket');
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] pb-24">
      <header className="sticky top-0 z-10 border-b border-[#DCD8D2] bg-[#F8F6F2]/80 px-5 lg:px-16 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/explore')} className="flex items-center justify-center rounded-full bg-white p-2 text-[#242224] shadow-sm hover:bg-gray-50 transition">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-2xl font-bold tracking-tight text-[#242224]">
              seatpulse<span className="text-[#6735E8]">*</span>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-[#DCD8D2] bg-white px-4 py-1.5 text-sm font-medium text-[#242224] transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[800px] px-5 pt-12">
        <h1 className="font-display text-4xl font-bold tracking-tight text-[#242224]">Your Tickets</h1>
        <p className="mt-2 text-sm text-[#726E75]">View and manage your upcoming event bookings.</p>

        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12 text-[#6735E8]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load your tickets. The backend endpoint might not be ready yet.
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DCD8D2] bg-[#FFFEFB] py-16 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EFECE6] text-[#726E75]">
                <Ticket className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-[#242224]">No tickets yet</h3>
              <p className="mt-1 text-sm text-[#726E75]">You haven't booked any events yet.</p>
              <button onClick={() => navigate('/explore')} className="mt-6 rounded-xl bg-[#242224] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111011]">
                Explore Events
              </button>
            </div>
          ) : (
            bookings.map((booking: any, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row gap-6 rounded-2xl border border-[#DCD8D2] bg-[#FFFEFB] p-5 shadow-sm transition hover:shadow-md">
                <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-[#6735E8]/10 text-[#6735E8]">
                  <span className="text-xs font-bold uppercase tracking-wide">Seat</span>
                  <span className="font-display text-3xl font-bold">{booking.seatNo || '-'}</span>
                </div>

                <div className="flex flex-1 flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div className="inline-block rounded-md bg-[#EFECE6] px-2 py-0.5 w-fit text-[10px] font-bold uppercase tracking-wider text-[#726E75]">
                      {booking.status || 'CONFIRMED'}
                    </div>
                    <button
                      onClick={() => cancelMutation.mutate(booking.seatId)}
                      disabled={cancelMutation.isPending}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                    >
                      {cancelMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                      Cancel Ticket
                    </button>
                  </div>

                  <h3 className="mt-1 font-display text-xl font-bold text-[#242224]">
                    {booking.eventName || `Event #${booking.eventId}`}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#726E75]">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {fmt(booking.eventStartTime) || 'Date TBA'}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Venue Details</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}