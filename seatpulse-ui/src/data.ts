import { SeatResponseDto } from './types/seatpulse';

export const EVENTS = [
  {
    id: 5,
    title: 'After Hours: Light / Sound',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
  }
];

export const mockSeats = (): SeatResponseDto[] => [
  { seatId: 194, seatNumber: 'A12', status: 'AVAILABLE' },
  { seatId: 198, seatNumber: 'A14', status: 'AVAILABLE' },
  { seatId: 199, seatNumber: 'B04', status: 'AVAILABLE' },
];