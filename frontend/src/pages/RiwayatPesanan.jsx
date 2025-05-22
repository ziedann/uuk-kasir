import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const API_URL = 'http://localhost:5000/api';

const RiwayatPesanan = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/customer/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Gagal mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Menunggu',
      'processing': 'Diproses',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Pesanan</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada riwayat pesanan
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">No. Pesanan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nama Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tanggal</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">#{order.orderNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{order.customer?.username || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          {order.items.map((item) => (
                            <div key={item._id || `${item.productId}-${item.quantity}`} className="mb-1 last:mb-0">
                              {item.productName} x {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        Rp {order.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatPesanan; 