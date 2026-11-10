import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminRoute() {

  const token = useAuthStore((state) => state.token) || sessionStorage.getItem('seatpulse_jwt');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}