export type Route = 'explore' | 'event' | 'checkout' | 'bookings';

export interface Booking {
  eventId: number;
  seatId: number;
  seatNumber: string;
  qty: number;
  total: number;
  expiresAt: number;
}

export interface SeatResponseDto {
  seatId: number;
  seatNumber: string;
  status?: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  price?: number;
}