import { useState } from 'react';
import { ShoppingCart, Plus, X, Clock, Check } from 'lucide-react';

const Transaksi = () => {
  const [cart, setCart] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Sample products data (in a real app, this would come from an API)
  const products = [
    { id: 1, name: 'Kopi Hitam', price: 10000 },
    { id: 2, name: 'Kopi Susu', price: 15000 },
    { id: 3, name: 'Teh Manis', price: 8000 },
    { id: 4, name: 'Roti Bakar', price: 12000 }
  ];
  
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

  return (
    <div>
      <h2 className="text-2xl font-medium text-gray-800 mb-8">Transaksi</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <ShoppingCart size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Buat Transaksi Baru</h3>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Produk</label>
            <select 
              value={productId} 
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih Produk</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - Rp {product.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
            <input 
              type="number" 
              min="1"
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            <span>Tambah ke Keranjang</span>
          </button>
          
          <div className="mt-6">
            <h4 className="font-medium mb-3 text-gray-800">Keranjang</h4>
            {cart.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                Keranjang kosong
              </div>
            ) : (
              <div>
                <div className="border-b border-gray-100 pb-4 mb-4">
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between items-center mb-3 bg-gray-50 p-3 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-3 text-gray-800">Rp {(item.price * item.quantity).toLocaleString()}</span>
                        <button 
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-gray-400 hover:text-red-500 bg-white p-1 rounded-full"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center font-medium text-gray-800 mb-4">
                  <span>Total:</span>
                  <span>Rp {calculateTotal().toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-colors"
                >
                  <Check size={18} className="mr-2" />
                  <span>Proses Pembayaran</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Transaction History */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center mr-3">
              <Clock size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Riwayat Transaksi Hari Ini</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Waktu</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">#TRX-001</td>
                  <td className="py-3 px-4 text-gray-600">10:30</td>
                  <td className="py-3 px-4 text-gray-800">Rp 250.000</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Selesai</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">#TRX-002</td>
                  <td className="py-3 px-4 text-gray-600">11:45</td>
                  <td className="py-3 px-4 text-gray-800">Rp 175.000</td>
                  <td className="py-3 px-4">
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Selesai</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">#TRX-003</td>
                  <td className="py-3 px-4 text-gray-600">13:20</td>
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
    </div>
  );
};

export default Transaksi; 