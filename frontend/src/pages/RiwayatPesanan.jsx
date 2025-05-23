import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import html2pdf from 'html2pdf.js';

const API_URL = 'http://localhost:5000/api';

const RiwayatPesanan = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const OrderDetailsModal = ({ order, isOpen, onClose }) => {
    const printRef = useRef();
    
    if (!isOpen || !order) return null;

    const handlePrint = () => {
      // Create the receipt content
      const receipt = document.createElement('div');
      receipt.innerHTML = `
        <div style="padding: 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 300px; margin: 0 auto; color: #1f2937;">
          <div style="text-align: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700;">Kasir Kita</h2>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">#${order.orderNumber}</p>
          </div>
          
          <div style="margin-bottom: 16px; font-size: 12px; color: #6b7280;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Tanggal</span>
              <span>${format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: id })}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Customer</span>
              <span>${order.customer?.username || 'N/A'}</span>
            </div>
          </div>
          
          <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            ${order.items.map(item => `
              <div style="margin-bottom: 8px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span style="font-weight: 500;">${item.productName}</span>
                  <span style="font-weight: 500;">Rp ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: #6b7280;">
                  <span>${item.quantity} x Rp ${item.price?.toLocaleString()}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 14px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
            <span>Total</span>
            <span>Rp ${order.total.toLocaleString()}</span>
          </div>
          
          <div style="text-align: center; font-size: 11px; color: #6b7280;">
            <p style="margin: 0 0 4px 0;">Terima kasih atas kunjungan Anda</p>
            <p style="margin: 0;">Simpan struk ini sebagai bukti pembayaran</p>
          </div>
        </div>
      `;

      // Configure pdf options
      const opt = {
        margin: [0.2, 0.3],
        filename: `struk-${order.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 3,
          letterRendering: true,
          useCORS: true,
        },
        jsPDF: { 
          unit: 'in', 
          format: [3.14, 6], // Lebih pendek untuk desain minimalis
          orientation: 'portrait' 
        }
      };

      // Generate and download PDF
      html2pdf().set(opt).from(receipt).save();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6" ref={printRef}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Detail Pesanan #{order.orderNumber}</h2>
              <div className="flex gap-2">
                {order.status === 'completed' ? (
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Struk
                  </button>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Struk tersedia setelah pesanan selesai
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Informasi Pesanan */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Informasi Pesanan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nomor Pesanan</p>
                    <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Pesanan</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: id })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="text-sm font-medium text-gray-900">{order.customer?.username || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Detail Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Detail Items</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item, index) => (
                        <tr key={item._id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            Rp {item.price?.toLocaleString() || '0'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            Rp {(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          Rp {order.total.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Aksi</th>
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
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openModal(order)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default RiwayatPesanan; 