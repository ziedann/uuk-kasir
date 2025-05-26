import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

const StockReportChart = ({ data }) => {
  return (
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
          <BarChart data={data}>
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
  );
};

export default StockReportChart; 