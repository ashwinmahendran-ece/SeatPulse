import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Ticket, Calendar, MapPin,
  User as UserIcon, CheckCircle2, Loader2, X, QrCode, CreditCard, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/seatPulseApi';
import { useAuthStore } from '../store/useAuthStore';

const formatTicketDate = (dateVal: string | number[] | undefined) => {
  if (!dateVal) return 'Date TBA';
  let d: Date;
  if (Array.isArray(dateVal)) {
    const [y, m, day, h = 0, min = 0, s = 0] = dateVal;
    d = new Date(y, m - 1, day, h, min, s);
  } else { d = new Date(dateVal); }
  if (Number.isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const getEmailFromToken = () => {
  try {
    const token = localStorage.getItem('seatpulse_jwt');
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).email || JSON.parse(jsonPayload).emailId || null;
  } catch (e) { return null; }
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [tokenEmail, setTokenEmail] = useState<string | null>(null);

  useEffect(() => { setTokenEmail(getEmailFromToken()); }, []);

  const [viewTicketDialog, setViewTicketDialog] = useState<{ isOpen: boolean; order: any }>({ isOpen: false, order: null });
  const [cancelDialog, setCancelDialog] = useState<{ isOpen: boolean; seatIds: number[]; seatNumbers: string; eventName: string | null; status: 'confirm' | 'success'; }>({
    isOpen: false, seatIds: [], seatNumbers: '', eventName: null, status: 'confirm'
  });

  const { data: rawBookings = [], isLoading } = useQuery({ queryKey: ['my-bookings'], queryFn: () => api.user.getMyBookings() });
  const bookings = Array.isArray(rawBookings) ? rawBookings : (rawBookings?.data || []);

  const getGroupIdForSeat = (seatId: number) => {
    const groups = JSON.parse(localStorage.getItem('seatpulse_order_groups') || '{}');
    for (const [orderId, seatIdsArray] of Object.entries(groups)) {
      if (Array.isArray(seatIdsArray) && seatIdsArray.includes(seatId)) return orderId;
    }
    return null;
  };

  const groupedBookings = bookings.reduce((acc: any, ticket: any) => {
    let orderKey = getGroupIdForSeat(ticket.seatId) || `SPX-SINGLE-${ticket.seatId}`;
    if (!acc[orderKey]) {
      acc[orderKey] = { ...ticket, displayOrderId: orderKey, seatIds: [ticket.seatId], seatNumbers: [ticket.seatNo], totalPrice: ticket.price || 0 };
    } else {
      acc[orderKey].seatIds.push(ticket.seatId);
      acc[orderKey].seatNumbers.push(ticket.seatNo);
      acc[orderKey].totalPrice += (ticket.price || 0);
    }
    return acc;
  }, {});
  const orderCards = Object.values(groupedBookings).reverse();

  const cancelMutation = useMutation({
    mutationFn: async (seatIds: number[]) => { await Promise.all(seatIds.map(id => api.user.cancelBooking(id))); },
    onSuccess: () => {
      toast.success('Order Cancelled successfully.', { style: { background: '#11131A', color: '#E8D5B5', border: '1px solid #E8D5B5' }});
      setCancelDialog(prev => ({ ...prev, status: 'success' }));
      setTimeout(() => {
        setCancelDialog({ isOpen: false, seatIds: [], seatNumbers: '', eventName: null, status: 'confirm' });
        queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      }, 2000);
    },
    onError: (error: any) => toast.error(error.message || 'Failed to cancel the order.', { style: { background: '#11131A', color: '#EF4444', border: '1px solid #EF4444' }})
  });

  const confirmCancellation = () => cancelDialog.seatIds.length > 0 ? cancelMutation.mutate(cancelDialog.seatIds) : toast.error("Error: Could not identify order.");

  const displayName = user?.userName || user?.username || 'Attendee';
  const displayEmail = user?.emailId || user?.email || tokenEmail || `${displayName.toLowerCase().replace(/\s/g, '')}@seatpulse.com`;

  return (
    <div className="min-h-screen bg-[#07090E] pb-12 font-sans text-white overflow-x-hidden selection:bg-[#E8D5B5]/30 selection:text-white">

      <style>{`
        .ticket-cutout {
          mask-image: radial-gradient(circle at left center, transparent 16px, black 16px), radial-gradient(circle at right center, transparent 16px, black 16px);
          mask-size: 51% 100%; mask-repeat: no-repeat; mask-position: left, right;
        }
        @keyframes sweepToCenter {
          0% { left: -20%; transform: translate(0, -50%) scale(0.9); opacity: 0; }
          100% { left: 50%; transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        .animate-logo-sweep {
          position: absolute; top: 50%; animation: sweepToCenter 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0;
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090E]/90 backdrop-blur-md shadow-none px-5 lg:px-16">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between relative">
          <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-[#E8D5B5] z-20">
            <ArrowLeft size={16} /> Back to Events
          </button>

          <div className="animate-logo-sweep flex items-center font-display text-xl sm:text-2xl font-black tracking-[-0.03em] whitespace-nowrap z-10">
            <span className="text-white">Seat</span>
            <span className="text-[#E8D5B5] ml-1.5">Pulse</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1000px] px-5 pt-10 lg:px-16 relative z-10 animate-fade-in">

        {/* USER PROFILE PANEL */}
        <section className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-white/10 bg-[#11131A] p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8D5B5]/10 text-[#E8D5B5] shadow-inner ring-1 ring-[#E8D5B5]/20">
              <UserIcon size={32} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">{displayName}</h1>
              <p className="text-sm font-bold text-slate-400">{displayEmail}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="rounded-xl border border-white/20 bg-transparent px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#E8D5B5] hover:text-[#07090E] hover:border-[#E8D5B5]">
            Log Out
          </button>
        </section>

        {/* BOOKINGS SECTION */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-3xl font-black text-white">My Orders</h2>
            <span className="rounded-full bg-[#E8D5B5]/10 border border-[#E8D5B5]/20 px-4 py-1.5 text-xs font-bold text-[#E8D5B5]">
              {orderCards.length} {orderCards.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#E8D5B5]">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
            </div>
          ) : orderCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/10 bg-[#11131A] py-20 text-center">
              <Ticket className="h-12 w-12 text-slate-600 mb-4" />
              <h3 className="font-display text-2xl font-bold text-white">No bookings yet</h3>
              <p className="mt-2 text-sm font-medium text-slate-400">Secure your spot at the next major event.</p>
              <button onClick={() => navigate('/explore')} className="mt-6 rounded-xl bg-[#E8D5B5] text-[#07090E] px-8 py-3.5 text-sm font-bold transition hover:bg-[#D6C09D] hover:-translate-y-1">
                Explore Events
              </button>
            </div>
          ) : (
            <div className="grid gap-8">
              {orderCards.map((order: any, index: number) => {
                const eventTitle = order.eventName || `Event #${order.eventId}`;
                return (
                  <div key={index} className="flex flex-col md:flex-row overflow-hidden rounded-3xl border border-white/10 bg-[#11131A] shadow-xl transition-transform hover:-translate-y-1 hover:border-[#E8D5B5]/50">
                    <div className="flex-1 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          <CheckCircle2 size={14} /> Confirmed
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          ID: {order.displayOrderId}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-black text-white mb-4 pr-4">{eventTitle}</h3>
                      <div className="space-y-3 text-sm font-bold text-slate-300">
                        <p className="flex items-center gap-3"><Calendar size={18} className="text-[#E8D5B5]" /> {formatTicketDate(order.eventStartTime)}</p>
                        <p className="flex items-center gap-3"><MapPin size={18} className="text-[#E8D5B5]" /> {order.venue || 'Main Stadium'}, {order.location || 'City'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center border-t-2 border-dashed border-white/10 md:border-l-2 md:border-t-0 bg-[#0A0C14] p-6 sm:p-8 md:w-[320px] relative">
                      <div className="flex gap-4 items-center mb-6">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Qty: {order.seatNumbers.length}</p>
                          <p className="font-display text-2xl font-extrabold text-[#E8D5B5] leading-tight break-words">
                            {order.seatNumbers.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setViewTicketDialog({ isOpen: true, order })} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E8D5B5] text-[#07090E] py-3 text-sm font-bold transition hover:bg-[#D6C09D] hover:-translate-y-0.5">
                          <QrCode size={18} /> View Ticket
                        </button>
                        <button onClick={() => setCancelDialog({ isOpen: true, seatIds: order.seatIds, seatNumbers: order.seatNumbers.join(', '), eventName: eventTitle, status: 'confirm' })} className="flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm font-bold text-red-400 transition hover:bg-red-500/20 hover:-translate-y-0.5">
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* QR DIGITAL TICKET MODAL */}
      {viewTicketDialog.isOpen && viewTicketDialog.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setViewTicketDialog({ isOpen: false, order: null })}></div>
          <div className="relative z-10 w-full max-w-[400px] animate-slide-up">

            <div className="bg-[#11131A] rounded-[2rem] overflow-hidden shadow-2xl ticket-cutout border border-white/10">

              <div className="bg-[#E8D5B5] p-8 text-[#07090E] text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                <h3 className="font-display text-2xl font-bold relative z-10">{viewTicketDialog.order.eventName}</h3>
                <p className="text-sm font-bold text-[#07090E]/70 mt-2 relative z-10">{formatTicketDate(viewTicketDialog.order.eventStartTime)}</p>
              </div>

              <div className="p-8 bg-[#11131A]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Seats</p>
                    <p className="font-display text-2xl font-black text-white">{viewTicketDialog.order.seatNumbers.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Qty</p>
                    <p className="font-display text-2xl font-black text-white">{viewTicketDialog.order.seatNumbers.length}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Venue</p>
                  <p className="text-sm font-bold text-white">{viewTicketDialog.order.venue}, {viewTicketDialog.order.location}</p>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-white/20">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`SEATPULSE-ORDER-${viewTicketDialog.order.displayOrderId}`)}&color=000000&bgcolor=ffffff`}
                    alt="QR" className="w-40 h-40 mb-3 rounded-lg"
                  />
                  <p className="font-mono text-xs font-bold tracking-widest text-slate-800">ORDER #{viewTicketDialog.order.displayOrderId}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-dashed border-white/10 flex justify-between items-center text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5"><UserIcon size={14} /> {displayName}</span>
                  <span className="flex items-center gap-1.5 text-emerald-400"><CreditCard size={14} /> Paid</span>
                </div>
              </div>
            </div>

            <button onClick={() => setViewTicketDialog({ isOpen: false, order: null })} className="mt-6 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#11131A] text-white border border-white/20 shadow-lg hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL - ADDED */}
      {cancelDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={() => cancelDialog.status === 'confirm' && setCancelDialog(prev => ({ ...prev, isOpen: false }))}
          ></div>

          <div className="relative z-10 w-full max-w-[400px] bg-[#11131A] rounded-3xl border border-white/10 p-8 shadow-2xl animate-slide-up text-center">
            {cancelDialog.status === 'confirm' ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6 border border-red-500/20">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">Cancel Order?</h3>
                <p className="text-slate-400 text-sm mb-8">
                  Are you sure you want to cancel your tickets for <strong className="text-white">{cancelDialog.eventName}</strong> (Seats: {cancelDialog.seatNumbers})? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelDialog(prev => ({ ...prev, isOpen: false }))}
                    disabled={cancelMutation.isPending}
                    className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Keep Tickets
                  </button>
                  <button
                    onClick={confirmCancellation}
                    disabled={cancelMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3.5 text-sm font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Yes, Cancel'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-6 border border-emerald-500/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">Cancelled</h3>
                <p className="text-slate-400 text-sm">Your order has been cancelled and seats have been released.</p>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}