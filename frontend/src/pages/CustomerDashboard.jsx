import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Minus, ImageIcon, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const BASE_URL = 'http://localhost:5000';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => {
      const newItems = { ...prev };
      if (newItems[productId] > 1) {
        newItems[productId]--;
      } else {
        delete newItems[productId];
      }
      return newItems;
    });
  };

  const handleDeleteFromCart = (productId) => {
    setCartItems(prev => {
      const newItems = { ...prev };
      delete newItems[productId];
      return newItems;
    });
  };

  const calculateTotal = () => {
    return Object.entries(cartItems).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p._id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const token = localStorage.getItem('token');
      
      // Prepare order data
      const orderData = {
        items: Object.entries(cartItems).map(([productId, quantity]) => ({
          productId,
          productName: products.find(p => p._id === productId)?.name,
          quantity,
          price: products.find(p => p._id === productId)?.price
        })),
        total: calculateTotal()
      };

      // Create order
      await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Clear cart
      setCartItems({});
      localStorage.removeItem('cart');

      // Show success message
      alert('Pesanan berhasil dibuat!');
      
      // Navigate to order history
      navigate('/riwayat');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col h-full overflow-hidden pr-[350px]">
        {/* Welcome Section */}
        <div className="flex-shrink-0 p-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat datang, {user?.username}!
          </h1>
          <p className="text-gray-600 mt-1">
            Silahkan pilih produk yang Anda inginkan
          </p>
        </div>

        {/* Products Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Produk Tersedia</h2>
            
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative group-hover:opacity-95 transition-opacity">
                      {product.imageUrl ? (
                        <img
                          src={BASE_URL + product.imageUrl}
                          alt={product.name}
                          className="w-full h-56 object-cover"
                        />
                      ) : (
                        <div className="w-full h-56 flex items-center justify-center text-gray-400">
                          <ImageIcon size={64} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        Stok: {product.stock}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category?.name || product.category}</p>
                      <p className="text-xl text-[#344293] font-semibold mb-4">Rp {product.price.toLocaleString()}</p>
                      
                      {cartItems[product._id] ? (
                        <div className="flex items-center justify-between p-1 bg-gray-50 rounded-xl">
                          <button
                            onClick={() => handleRemoveFromCart(product._id)}
                            className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          >
                            <Minus size={20} />
                          </button>
                          <span className="text-lg font-medium text-gray-900 min-w-[40px] text-center">
                            {cartItems[product._id]}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product._id)}
                            className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                            disabled={product.stock === cartItems[product._id]}
                          >
                            <Plus size={20} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#344293] hover:bg-[#344293]/90 text-white transition-colors"
                          disabled={product.stock === 0}
                        >
                          <Plus size={20} />
                          <span className="text-base font-medium">Tambahkan ke keranjang</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="fixed top-0 right-0 w-[350px] h-screen bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Keranjang</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {Object.keys(cartItems).length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Keranjang masih kosong
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(cartItems).map(([productId, quantity]) => {
                const product = products.find(p => p._id === productId);
                if (!product) return null;
                
                return (
                  <div key={productId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={BASE_URL + product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-500">Rp {product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleRemoveFromCart(productId)}
                        className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-medium w-5 text-center">{quantity}</span>
                      <button
                        onClick={() => handleAddToCart(productId)}
                        className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteFromCart(productId)}
                        className="p-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {Object.keys(cartItems).length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                Rp {calculateTotal().toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || Object.keys(cartItems).length === 0}
              className="w-full bg-[#344293] text-white py-3 rounded-xl hover:bg-[#344293]/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Memproses...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard; 