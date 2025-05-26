import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const DailyTransactionsChart = ({ data }) => {
  return (
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
          <LineChart data={data}>
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
  );
};

export default DailyTransactionsChart; 