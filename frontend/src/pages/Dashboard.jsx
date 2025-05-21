import { useAuth } from '../contexts/AuthContext';
import { Package, DollarSign, ShoppingCart, Clock, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();

  // Sample data for the chart
  const chartdata = [
    {
      date: "Jan 23",
      "Total Sales": 2890000,
      "Total Transactions": 45,
    },
    {
      date: "Feb 23",
      "Total Sales": 3250000,
      "Total Transactions": 52,
    },
    {
      date: "Mar 23",
      "Total Sales": 3650000,
      "Total Transactions": 61,
    },
    {
      date: "Apr 23",
      "Total Sales": 4120000,
      "Total Transactions": 67,
    },
    {
      date: "May 23",
      "Total Sales": 3890000,
      "Total Transactions": 55,
    },
    {
      date: "Jun 23",
      "Total Sales": 3460000,
      "Total Transactions": 48,
    },
  ];

  return (
    <div className="py-8 px-6">
      <h2 className="text-2xl font-medium text-gray-800 mb-8">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Package size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Products</h3>
          </div>
          <p className="text-gray-500 mb-2">Total products in inventory</p>
          <div className="text-3xl font-medium text-gray-900">24</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3">
              <DollarSign size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Today's Sales</h3>
          </div>
          <p className="text-gray-500 mb-2">Total sales for today</p>
          <div className="text-3xl font-medium text-gray-900">Rp 1.250.000</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
              <ShoppingCart size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Transactions</h3>
          </div>
          <p className="text-gray-500 mb-2">Total transactions today</p>
          <div className="text-3xl font-medium text-gray-900">15</div>
        </div>
      </div>
      
      {/* Sales Report Chart */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <BarChartIcon size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Sales Report</h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Sales</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm text-gray-600">Transactions</span>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartdata} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar 
                yAxisId="right" 
                dataKey="Total Transactions" 
                fill="#8B5CF6" 
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
          <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center mr-3">
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
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">#TRX-001</td>
                <td className="py-3 px-4 text-gray-800">John Doe</td>
                <td className="py-3 px-4 text-gray-600">2023-06-15 10:30</td>
                <td className="py-3 px-4 text-gray-800">Rp 250.000</td>
                <td className="py-3 px-4">
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Completed</span>
                </td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">#TRX-002</td>
                <td className="py-3 px-4 text-gray-800">Jane Smith</td>
                <td className="py-3 px-4 text-gray-600">2023-06-15 11:45</td>
                <td className="py-3 px-4 text-gray-800">Rp 175.000</td>
                <td className="py-3 px-4">
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Completed</span>
                </td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">#TRX-003</td>
                <td className="py-3 px-4 text-gray-800">Mike Johnson</td>
                <td className="py-3 px-4 text-gray-600">2023-06-15 13:20</td>
                <td className="py-3 px-4 text-gray-800">Rp 350.000</td>
                <td className="py-3 px-4">
                  <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">Pending</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;