import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

const MonthlySalesChart = ({ data }) => {
  return (
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
          <BarChart data={data}>
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
  );
};

export default MonthlySalesChart; 