import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import type { LoginRequest, AuthResponse, SpringPage, Event, Seat } from '../types';

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
    getMyBookings: async (): Promise<any[]> => {
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

        useAuthStore.getState().login(actualToken);
        localStorage.setItem('seatpulse_jwt', actualToken);

        return actualToken;
      } catch (err) {
        throw new Error('Invalid username or password.');
      }
    },

    register: async (credentials: { username: string; emailId: string; password: string }): Promise<void> => {
      try {
        const payload = {
          userName: credentials.username,
          emailId: credentials.emailId,
          password: credentials.password
        };
        await apiClient.post('/api/auth/register', payload);
      } catch (err) {
        throw new Error('Registration failed. Username or email might already be taken.');
      }
    }
  },

  events: {
    getAll: async (category: string = ''): Promise<Event[]> => {
      try {
        const response = await apiClient.get<SpringPage<Event>>('/api/events/search', {
          params: { category, pageNo: 0, pageSize: 20, sortBy: 'eventId' }
        });
        return response.data.content;
      } catch (err) {
        console.error('Failed to fetch events:', err);
        return [];
      }
    }
  },

  seats: {
    getForEvent: async (eventId: number): Promise<Seat[]> => {
      const response = await apiClient.get<Seat[]>(`/api/events/event/${eventId}`);
      return response.data;
    },

    lock: async (seatId: number): Promise<Seat> => {
      try {
        const response = await apiClient.post<Seat>('/api/seat/lock', null, {
          params: { seatId }
        });
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        if (axiosError.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        }
        throw new Error('Failed to lock seat. It may have just been taken.');
      }
    },

    book: async (seatId: number): Promise<void> => {
      try {
        await apiClient.post('/api/seat/book', null, {
          params: { seatId }
        });
      } catch (err) {
        throw new Error('Failed to finalize booking. The seat may have expired.');
      }
    }
  },

  payment: {
    createOrder: async (seatId: number, amount: number): Promise<string> => {
      try {
        const response = await apiClient.post<{ orderId: string }>('/api/payment/create-order', null, {
          params: { seatId, amount }
        });
        return response.data.orderId;
      } catch (err) {
        throw new Error('Failed to initialize payment gateway.');
      }
    }
  }
};