import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { format, startOfWeek, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

const API_URL = 'http://localhost:5000/api';

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    monthlySales: [],
    dailyTransactions: [],
    bestSellers: [],
    stockReport: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch orders and products
      const [ordersResponse, productsResponse] = await Promise.all([
        axios.get(`${API_URL}/orders/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const orders = ordersResponse.data;
      const products = productsResponse.data;

      // Process monthly sales data
      const monthlySales = processMonthlySales(orders);

      // Process daily transactions
      const dailyTransactions = processDailyTransactions(orders);

      // Process best selling products
      const bestSellers = processBestSellers(orders);

      // Process stock report
      const stockReport = processStockReport(products);

      setReportData({
        monthlySales,
        dailyTransactions,
        bestSellers,
        stockReport
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const processMonthlySales = (orders) => {
    const monthlyData = {};
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    // Initialize all months with 0
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(date, 'MMM', { locale: id });
      monthlyData[monthKey] = 0;
    }

    // Calculate sales for each month
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= sixMonthsAgo && order.status !== 'cancelled') {
        const monthKey = format(orderDate, 'MMM', { locale: id });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + order.total;
      }
    });

    // Convert to array format for chart
    return Object.entries(monthlyData)
      .map(([name, total]) => ({ name, total }))
      .reverse();
  };

  const processDailyTransactions = (orders) => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const dailyData = {};
    
    // Initialize all days with 0
    days.forEach(day => {
      dailyData[day] = 0;
    });

    // Get start of current week
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    // Calculate transactions for each day
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= weekStart && order.status !== 'cancelled') {
        const dayKey = format(orderDate, 'E', { locale: id }).substring(0, 3);
        dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
      }
    });

    // Convert to array format for chart
    return days.map(name => ({
      name,
      total: dailyData[name]
    }));
  };

  const processBestSellers = (orders) => {
    const productSales = {};

    // Calculate total quantity sold for each product
    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        order.items.forEach(item => {
          const productName = item.productName;
          productSales[productName] = (productSales[productName] || 0) + item.quantity;
        });
      }
    });

    // Convert to array and sort by quantity
    return Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4); // Take top 4 products
  };

  const processStockReport = (products) => {
    return products
      .map(product => ({
        name: product.name,
        stock: product.stock,
        lowStock: product.minStock || Math.ceil(product.stock * 0.2) // Use minStock if defined, otherwise 20% of current stock
      }))
      .sort((a, b) => a.stock - b.stock) // Sort by stock level ascending
      .slice(0, 4); // Take 4 products with lowest stock
  };

  const COLORS = ['#344293', '#4A5BA8', '#6B7BC0', '#8C9BD6'];

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
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#344293] mb-6">Laporan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Sales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#344293]/10 flex items-center justify-center mr-3">
                <DollarSign className="text-[#344293]" size={20} />
              </div>
              <h2 className="text-lg font-medium text-gray-800">Penjualan Bulanan</h2>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis 
                  stroke="#666"
                  tickFormatter={(value) => `Rp ${(value/1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  formatter={(value) => [`Rp ${(value/1000).toFixed(0)}K`, 'Penjualan']}
                />
                <Bar dataKey="total" fill="#344293" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#344293]/10 flex items-center justify-center mr-3">
                <TrendingUp className="text-[#344293]" size={20} />
              </div>
              <h2 className="text-lg font-medium text-gray-800">Transaksi Minggu Ini</h2>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.dailyTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis 
                  stroke="#666"
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  formatter={(value) => [value, 'Transaksi']}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#344293" 
                  strokeWidth={2}
                  dot={{ fill: '#344293', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#344293' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#344293]/10 flex items-center justify-center mr-3">
                <Package className="text-[#344293]" size={20} />
              </div>
              <h2 className="text-lg font-medium text-gray-800">Produk Terlaris</h2>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.bestSellers}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {reportData.bestSellers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  formatter={(value) => [`${value} pcs`, 'Terjual']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Report */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
                <AlertTriangle size={18} />
              </div>
              <h2 className="text-lg font-medium text-gray-800">Laporan Stok</h2>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.stockReport}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis 
                  stroke="#666"
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                />
                <Legend />
                <Bar dataKey="stock" fill="#344293" name="Stok Tersedia" />
                <Bar dataKey="lowStock" fill="#8C9BD6" name="Batas Stok Rendah" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;