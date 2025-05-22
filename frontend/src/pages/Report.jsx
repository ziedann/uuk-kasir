import { useState } from 'react';
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

const Report = () => {
  // Dummy data for sales chart
  const salesData = [
    { name: 'Jan', total: 4000 },
    { name: 'Feb', total: 3000 },
    { name: 'Mar', total: 5000 },
    { name: 'Apr', total: 2780 },
    { name: 'Mei', total: 1890 },
    { name: 'Jun', total: 2390 },
  ];

  // Dummy data for transactions
  const transactionData = [
    { name: 'Senin', total: 24 },
    { name: 'Selasa', total: 13 },
    { name: 'Rabu', total: 18 },
    { name: 'Kamis', total: 22 },
    { name: 'Jumat', total: 15 },
    { name: 'Sabtu', total: 30 },
    { name: 'Minggu', total: 25 },
  ];

  // Dummy data for best-selling products
  const productData = [
    { name: 'Kopi Hitam', value: 400 },
    { name: 'Teh Tarik', value: 300 },
    { name: 'Nasi Goreng', value: 200 },
    { name: 'Mie Goreng', value: 100 },
  ];

  // Dummy data for stock report
  const stockData = [
    { name: 'Kopi Hitam', stock: 50, lowStock: 20 },
    { name: 'Teh Tarik', stock: 30, lowStock: 15 },
    { name: 'Nasi Goreng', stock: 25, lowStock: 10 },
    { name: 'Mie Goreng', stock: 15, lowStock: 10 },
  ];

  // Colors for pie chart
  const COLORS = ['#344293', '#4A5BA8', '#6B7BC0', '#8C9BD6'];

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
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
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
              <h2 className="text-lg font-medium text-gray-800">Transaksi Harian</h2>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
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
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {productData.map((entry, index) => (
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
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
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