import { useState } from 'react';
import { ShoppingCart, Plus, X, Clock, Check, CheckCircle2, XCircle, Search, Package } from 'lucide-react';

const Transaksi = () => {
  const [cart, setCart] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'approvals'
  
  // Sample products data (in a real app, this would come from an API)
  const products = [
    { id: 1, name: 'Kopi Hitam', price: 10000 },
    { id: 2, name: 'Kopi Susu', price: 15000 },
    { id: 3, name: 'Teh Manis', price: 8000 },
    { id: 4, name: 'Roti Bakar', price: 12000 }
  ];
  
  const [transactions, setTransactions] = useState([
    {
      id: 'TRX-001',
      customer: 'John Doe',
      date: '2024-03-15 10:30',
      items: [
        { name: 'Kopi Hitam', quantity: 2, price: 10000 },
        { name: 'Roti Bakar', quantity: 1, price: 12000 }
      ],
      total: 32000,
      status: 'completed',
      paymentMethod: 'Cash'
    },
    {
      id: 'TRX-002',
      customer: 'Jane Smith',
      date: '2024-03-15 11:45',
      items: [
        { name: 'Kopi Susu', quantity: 1, price: 15000 },
        { name: 'Teh Manis', quantity: 2, price: 8000 }
      ],
      total: 31000,
      status: 'completed',
      paymentMethod: 'Cash'
    }
  ]);

  const [pendingOrders, setPendingOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'Mike Johnson',
      date: '2024-03-15 13:20',
      items: [
        { name: 'Kopi Hitam', quantity: 1, price: 10000 },
        { name: 'Roti Bakar', quantity: 2, price: 12000 }
      ],
      total: 34000,
      status: 'pending',
      paymentMethod: 'Cash'
    },
    {
      id: 'ORD-002',
      customer: 'Sarah Wilson',
      date: '2024-03-15 14:15',
      items: [
        { name: 'Kopi Susu', quantity: 2, price: 15000 },
        { name: 'Teh Manis', quantity: 1, price: 8000 }
      ],
      total: 38000,
      status: 'pending',
      paymentMethod: 'Cash'
    }
  ]);
  
  const handleAddToCart = () => {
    if (!productId) return;
    
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;
    
    const existingItem = cart.find(item => item.productId === parseInt(productId));
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === parseInt(productId) 
          ? { ...item, quantity: item.quantity + parseInt(quantity) } 
          : item
      ));
    } else {
      setCart([...cart, {
        productId: parseInt(productId),
        name: product.name,
        price: product.price,
        quantity: parseInt(quantity)
      }]);
    }
    
    setProductId('');
    setQuantity(1);
  };
  
  const handleRemoveItem = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // In a real app, this would send the transaction to an API
    alert(`Transaction completed! Total: Rp ${calculateTotal().toLocaleString()}`);
    setCart([]);
  };

  const handleApprove = (id) => {
    setPendingOrders(pendingOrders.map(order => 
      order.id === id ? { ...order, status: 'approved' } : order
    ));
  };

  const handleReject = (id) => {
    setPendingOrders(pendingOrders.map(order => 
      order.id === id ? { ...order, status: 'rejected' } : order
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <Clock size={14} className="mr-1" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <CheckCircle2 size={14} className="mr-1" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <XCircle size={14} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-8 px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-medium text-gray-800">Transaksi</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'history'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Riwayat Transaksi
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'approvals'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Persetujuan Pesanan
        </button>
      </div>

      {/* Transaction History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center mr-3">
                <Clock size={18} />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Riwayat Transaksi</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tanggal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{transaction.id}</td>
                    <td className="py-3 px-4 text-gray-800">{transaction.customer}</td>
                    <td className="py-3 px-4 text-gray-600">{transaction.date}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {transaction.items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-800">Rp {transaction.total.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Approvals */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <Package size={18} />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Persetujuan Pesanan</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tanggal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800">{order.id}</td>
                    <td className="py-3 px-4 text-gray-800">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-600">{order.date}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-800">Rp {order.total.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 px-4">
                      {order.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaksi; 