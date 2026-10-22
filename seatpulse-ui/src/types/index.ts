export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role?: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export interface Event {
  eventId: number;
  eventName: string;
  eventCategory: string;
  eventStartTime: string;
  eventEndTime: string;
  imageUrl?: string;
}

export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'CANCELLED';

export interface Seat {
  seatId: number;
  seatNo: number;
  seatCategory: string;
  seatStatus: SeatStatus;
  eventId: number;
  price?: number;
}

export interface Booking {
  eventId: number;
  seatId: number;
  seatNumber: string;
  qty: number;
  total: number;
  expiresAt: number;
}