import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import type { LoginRequest, SpringPage, Event, Seat, SeatPlanItem, UserBooking } from '../types';

const API_BASE_URL = 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('seatpulse_jwt');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("401 Unauthorized. The backend rejected the token or blocked the request.");
      useAuthStore.getState().logout();
      localStorage.removeItem('seatpulse_jwt');
    }
    return Promise.reject(error);
  }
);

export const api = {
  user: {
    getMyBookings: async () => {
      const response = await apiClient.get('/api/seat/me');
      return response.data;
    },
    cancelBooking: async (seatId: number): Promise<string> => {
      try {
        const response = await apiClient.post('/api/seat/cancel', null, { params: { seatId } });
        return response.data;
      } catch (err: any) {
        throw new Error(err.response?.data || 'Failed to cancel ticket.');
      }
    }
  },

  auth: {
    login: async (credentials: LoginRequest): Promise<string> => {
      try {
        const payload = { userName: credentials.username, password: credentials.password };
        const response = await apiClient.post('/api/auth/login', payload);
        const actualToken = response.data?.token || response.data;
        if (!actualToken || typeof actualToken !== 'string') {
          throw new Error("Backend did not return a valid token string.");
        }
        localStorage.setItem('seatpulse_jwt', actualToken);
        return actualToken;
      } catch (err) {
        throw new Error('Invalid username or password.');
      }
    },
    register: async (credentials: { username: string; emailId: string; password: string }): Promise<void> => {
      try {
        const payload = { userName: credentials.username, emailId: credentials.emailId, password: credentials.password };
        await apiClient.post('/api/auth/register', payload);
      } catch (err) {
        throw new Error('Registration failed. Username or email might already be taken.');
      }
    }
  },

  admin: {
    getStats: async (): Promise<{ totalEvents: number; activeBookings: number; totalRevenue: number; registeredUsers: number }> => {
      const response = await apiClient.get('/api/admin/stats');
      return response.data;
    }
  },

  events: {
    // FIX: Set default pageSize to 100 so all your 16-20 events are fetched at once
    getAll: async (category: string = '', pageNo: number = 0, pageSize: number = 100): Promise<SpringPage<Event> | null> => {
      try {
        const response = await apiClient.get<SpringPage<Event>>('/api/events/search', {
          params: {
            category: category === 'All' ? '' : category,
            pageNo,
            pageSize,
            sortBy: 'eventStartTime'
          }
        });
        return response.data;
      } catch (err) {
        console.error('Failed to fetch events:', err);
        return null;
      }
    },
    create: async (eventData: Omit<Event, 'eventId'> & { totalSeats: number }): Promise<Event & { totalSeats?: number }> => {
      try {
        const response = await apiClient.post('/api/events/addEvent', eventData);
        return response.data;
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to create event.');
      }
    },
    saveSeatingPlan: async (eventId: number, seats: any[]): Promise<void> => {
          try {
            await apiClient.post(`/api/events/${eventId}/seats`, { seats });
          } catch (err: any) {
            console.error("Backend Error Details:", err.response?.data);
            throw new Error(err.response?.data?.message || err.response?.data || 'Failed to save seating plan.');
          }
        },
  },

seats: {
    getForEvent: async (eventId: number): Promise<Seat[]> => {
      const response = await apiClient.get<Seat[]>('/api/seat/available', { params: { eventId } });
      return response.data;
    },
    lock: async (seatId: number): Promise<Seat> => {
      try {
        const response = await apiClient.post<Seat>('/api/seat/lock', null, { params: { seatId } });
        return response.data;
      } catch (err) {
        // ... error handling
        throw new Error('Failed to lock seat. It may have just been taken.');
      }
    },

    bookBulk: async (seatIds: number[], orderId: string): Promise<void> => {
      try {
        await apiClient.post('/api/seat/book-bulk', null, {
          params: {
            seatIds: seatIds.join(','),
            orderId: orderId
          }
        });
      } catch (err) {
        throw new Error('Failed to finalize bulk booking. Seats may have expired.');
      }
    }
  },

  payment: {
    createOrder: async (seatIds: number[], amount: number): Promise<string> => {
      try {
        const response = await apiClient.post<{ orderId: string }>('/api/payment/create-order', null, {
          params: { seatIds: seatIds.join(','), amount }
        });
        return response.data.orderId;
      } catch (err) {
        throw new Error('Failed to initialize payment gateway.');
      }
    }
  }
};