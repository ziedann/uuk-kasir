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
import { TrendingUp, DollarSign, Package, AlertTriangle, Download } from 'lucide-react';
import axios from 'axios';
import { format, startOfWeek, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import html2pdf from 'html2pdf.js';

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
    if (!orders || orders.length === 0) return [];

    // Sort orders by date ascending to get the first transaction date
    const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstTransactionDate = new Date(sortedOrders[0].createdAt);
    const currentDate = new Date();

    // Calculate the difference in months between first transaction and now
    const monthDiff = (currentDate.getFullYear() - firstTransactionDate.getFullYear()) * 12 
      + (currentDate.getMonth() - firstTransactionDate.getMonth());
    
    // Take the last 6 months or all months if less than 6
    const monthsToShow = Math.min(6, monthDiff + 1);
    const monthlyData = {};

    // Initialize months from first transaction (limited to last 6 months)
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - (monthsToShow - 1) + i,
        1
      );
      const monthKey = format(date, 'MMM yyyy', { locale: id });
      monthlyData[monthKey] = 0;
    }

    // Calculate sales for each month
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      // Only count orders within the selected month range and not cancelled
      if (order.status !== 'cancelled') {
        const monthKey = format(orderDate, 'MMM yyyy', { locale: id });
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey] += order.total;
        }
      }
    });

    // Convert to array format for chart and add year to month name
    return Object.entries(monthlyData)
      .map(([name, total]) => ({ name, total }));
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

  const handleDownloadPDF = () => {
    const receipt = document.createElement('div');
    receipt.innerHTML = `
      <div style="padding: 40px; font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; color: #1f2937;">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
          <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #344293;">Laporan Penjualan UUK KASIR</h1>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Periode: ${reportData.monthlySales[0]?.name || '-'} - ${reportData.monthlySales[reportData.monthlySales.length - 1]?.name || '-'}
          </p>
        </div>

        <!-- Ringkasan Penjualan Bulanan -->
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h2 style="font-size: 18px; font-weight: 600; color: #344293; margin-bottom: 15px;">Penjualan Bulanan</h2>
          <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 0;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 12px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Bulan</th>
                  <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Total Penjualan</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.monthlySales.map(sale => `
                  <tr class="hover:bg-gray-50">
                    <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">${sale.name}</td>
                    <td style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb;">
                      Rp ${sale.total.toLocaleString()}
                    </td>
                  </tr>
                `).join('')}
                <tr style="font-weight: 600; background-color: #f8fafc;">
                  <td style="padding: 12px 20px;">Total Keseluruhan</td>
                  <td style="padding: 12px 20px; text-align: right;">
                    Rp ${reportData.monthlySales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Transaksi Mingguan -->
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h2 style="font-size: 18px; font-weight: 600; color: #344293; margin-bottom: 15px;">Transaksi Minggu Ini</h2>
          <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 0;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 12px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Hari</th>
                  <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Jumlah Transaksi</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.dailyTransactions.map(day => `
                  <tr class="hover:bg-gray-50">
                    <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb;">${day.name}</td>
                    <td style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb;">
                      ${day.total} transaksi
                    </td>
                  </tr>
                `).join('')}
                <tr style="font-weight: 600; background-color: #f8fafc;">
                  <td style="padding: 12px 20px;">Total Transaksi</td>
                  <td style="padding: 12px 20px; text-align: right;">
                    ${reportData.dailyTransactions.reduce((sum, day) => sum + day.total, 0)} transaksi
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Produk Terlaris -->
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h2 style="font-size: 18px; font-weight: 600; color: #344293; margin-bottom: 15px;">Produk Terlaris</h2>
          <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 0;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 12px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Produk</th>
                  <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Jumlah Terjual</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.bestSellers.map((product, index) => `
                  <tr class="hover:bg-gray-50">
                    <td style="padding: 12px 20px; border-bottom: ${index !== reportData.bestSellers.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                      ${product.name}
                    </td>
                    <td style="padding: 12px 20px; text-align: right; border-bottom: ${index !== reportData.bestSellers.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                      ${product.value} pcs
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Laporan Stok -->
        <div style="margin-bottom: 40px; page-break-inside: avoid;">
          <h2 style="font-size: 18px; font-weight: 600; color: #344293; margin-bottom: 15px;">Laporan Stok Minimum</h2>
          <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 0;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 12px 20px; text-align: left; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Produk</th>
                  <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Stok Tersedia</th>
                  <th style="padding: 12px 20px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #4b5563;">Batas Minimum</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.stockReport.map((product, index) => `
                  <tr class="hover:bg-gray-50">
                    <td style="padding: 12px 20px; border-bottom: ${index !== reportData.stockReport.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                      ${product.name}
                    </td>
                    <td style="padding: 12px 20px; text-align: right; border-bottom: ${index !== reportData.stockReport.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                      ${product.stock} pcs
                    </td>
                    <td style="padding: 12px 20px; text-align: right; border-bottom: ${index !== reportData.stockReport.length - 1 ? '1px solid #e5e7eb' : 'none'};">
                      ${product.lowStock} pcs
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="margin: 0;">Laporan ini dibuat secara otomatis oleh sistem <span style="font-weight">Kasir Kita</span></p>
          <p style="margin: 5px 0 0 0;">Dicetak pada: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}</p>
        </div>
      </div>
    `;

    const opt = {
      margin: [0.75, 0.75],
      filename: `laporan-penjualan-${format(new Date(), 'dd-MM-yyyy')}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 3,
        letterRendering: true,
        useCORS: true,
      },
      jsPDF: { 
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    html2pdf().set(opt).from(receipt).save();
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#344293]">Laporan</h1>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#344293] hover:bg-[#2a3574] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#344293]"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Laporan PDF
        </button>
      </div>
      
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