import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

import Footer from './components/Footer';

// Public Pages
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import EventDetailsPage from './pages/EventDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';

// Protected Pages
import MyBookingsPage from './pages/MyBookingsPage';

// Admin Pages
import DashboardPage from './pages/DashboardPage';
import EventFormPage from './pages/EventFormPage';
import SeatingBuilderPage from './pages/SeatingBuilderPage';

// Security Wrappers
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#07090E] text-white transition-colors duration-300">

          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/event/:id" element={<EventDetailsPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />

              {/* Protected User Routes (Requires Login) */}
              <Route element={<PrivateRoute />}>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<MyBookingsPage />} />
              </Route>

              {/* Protected Admin Routes (Requires Login AND Admin Role) */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/events/new" element={<EventFormPage />} />
                <Route path="/admin/events/:eventId/seating" element={<SeatingBuilderPage />} />
              </Route>

              {/* Catch-all for bad URLs */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#11131A',
                color: '#E8D5B5',
                border: '1px solid rgba(232, 213, 181, 0.2)',
                fontWeight: 'bold',
                borderRadius: '0.75rem'
              },
              success: {
                style: {
                  background: '#11131A',
                  color: '#E8D5B5',
                  border: '1px solid #E8D5B5',
                }
              },
              error: {
                style: {
                  background: '#11131A',
                  color: '#EF4444',
                  border: '1px solid #EF4444',
                }
              }
            }}
          />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}