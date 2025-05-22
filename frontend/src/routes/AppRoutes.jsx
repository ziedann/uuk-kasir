import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CustomerDashboard from '../pages/CustomerDashboard';
import Transaksi from '../pages/Transaksi';
import Produk from '../pages/Produk';
import Report from '../pages/Report';
import RiwayatPesanan from '../pages/RiwayatPesanan';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const { user } = useAuth();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    return user.role === 'pelanggan' ? '/customer-dashboard' : '/dashboard';
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes with Layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Admin and Staff Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'petugas']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaksi"
          element={
            <ProtectedRoute allowedRoles={['admin', 'petugas']}>
              <Transaksi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produk"
          element={
            <ProtectedRoute allowedRoles={['admin', 'petugas']}>
              <Produk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute allowedRoles={['admin', 'petugas']}>
              <Report />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['pelanggan']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/riwayat"
          element={
            <ProtectedRoute allowedRoles={['pelanggan']}>
              <RiwayatPesanan />
            </ProtectedRoute>
          }
        />
      </Route>
      
      <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
    </Routes>
  );
};

export default AppRoutes; 