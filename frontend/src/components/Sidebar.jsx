import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, ShoppingBag, ShoppingCart, LogOut, User } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Transaksi', path: '/transaksi', icon: <ShoppingCart size={20} /> },
    { name: 'Produk', path: '/produk', icon: <ShoppingBag size={20} /> },
  ];

  return (
    <div className="fixed top-0 left-0 bg-white text-gray-700 w-64 h-screen flex flex-col shadow-sm border-r border-gray-100">
      <div className="overflow-y-auto flex-1">
        {/* App Logo/Name */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-medium text-gray-800">KasirKita</h1>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 pt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className="mb-1 px-4">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`mr-3 ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  <span className={location.pathname === item.path ? 'font-medium' : ''}>
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* User Profile and Logout */}
      <div className="border-t border-gray-100 p-4 m-4 mt-auto rounded-xl bg-gray-50">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
            <User size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.username}</p>
            <p className="text-sm text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <LogOut size={18} className="mr-2 text-gray-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 