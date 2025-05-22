import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, DollarSign, ShoppingCart, Clock, BarChart as BarChartIcon, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    todaySales: 0,
    todayTransactions: 0,
    recentTransactions: [],
    salesChart: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch total products
      const productsResponse = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch orders
      const ordersResponse = await axios.get(`${API_URL}/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Process orders data
      const orders = ordersResponse.data;
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate today's orders and sales
      const todayOrders = orders.filter(order => 
        order.createdAt.startsWith(today) && 
        order.status !== 'cancelled'
      );
      
      const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
      
      // Get recent transactions (last 5 completed orders)
      const recentTransactions = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Process sales chart data (last 6 months)
      const salesChartData = processChartData(orders);

      setDashboardData({
        totalProducts: productsResponse.data.length,
        todaySales,
        todayTransactions: todayOrders.length,
        recentTransactions,
        salesChart: salesChartData
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (orders) => {
    const last6Months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = format(date, 'MMM yy', { locale: id });
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === date.getMonth() &&
               orderDate.getFullYear() === date.getFullYear() &&
               order.status !== 'cancelled';
      });

      const totalSales = monthOrders.reduce((sum, order) => sum + order.total, 0);
      
      last6Months.push({
        date: monthYear,
        "Total Sales": totalSales,
        "Total Transactions": monthOrders.length
      });
    }
    
    return last6Months;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="py-8 px-6">
      <h2 className="text-2xl font-medium text-[#344293] mb-8">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
              <Package size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Products</h3>
          </div>
          <p className="text-gray-500 mb-2">Total products in inventory</p>
          <div className="text-3xl font-medium text-gray-900">{dashboardData.totalProducts}</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
              <DollarSign size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Today's Sales</h3>
          </div>
          <p className="text-gray-500 mb-2">Total sales for today</p>
          <div className="text-3xl font-medium text-gray-900">
            Rp {dashboardData.todaySales.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
              <ShoppingCart size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Transactions</h3>
          </div>
          <p className="text-gray-500 mb-2">Total transactions today</p>
          <div className="text-3xl font-medium text-gray-900">{dashboardData.todayTransactions}</div>
        </div>
      </div>
      
      {/* Sales Report Chart */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
              <BarChartIcon size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Sales Report</h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#344293] mr-2"></div>
              <span className="text-sm text-gray-600">Sales</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#8C9BD6] mr-2"></div>
              <span className="text-sm text-gray-600">Transactions</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.salesChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `Rp ${(value/1000000).toFixed(1)}M`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <Tooltip 
                cursor={false}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value, name) => {
                  if (name === "Total Sales") {
                    return [`Rp ${(value/1000000).toFixed(1)}M`, 'Sales'];
                  }
                  return [value, 'Transactions'];
                }}
                labelStyle={{ color: '#6B7280', fontSize: 12 }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="Total Sales" 
                fill="#344293" 
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar 
                yAxisId="right" 
                dataKey="Total Transactions" 
                fill="#8C9BD6" 
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Transactions Table */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
            <Clock size={18} />
          </div>
          <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentTransactions.map((transaction) => (
                <tr key={transaction._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">#{transaction.orderNumber}</td>
                  <td className="py-3 px-4 text-gray-800">{transaction.customer?.username || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {format(new Date(transaction.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </td>
                  <td className="py-3 px-4 text-gray-800">
                    Rp {transaction.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(transaction.status)}`}>
                      {transaction.status === 'completed' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : transaction.status === 'cancelled' ? (
                        <XCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {formatStatus(transaction.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;