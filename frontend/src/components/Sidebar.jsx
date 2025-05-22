import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart, 
  LogOut,
  History,
  Receipt,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu items based on role
  const getMenuItems = () => {
    if (user.role === 'pelanggan') {
      return [
        {
          path: '/customer-dashboard',
          name: 'Dashboard',
          icon: <LayoutDashboard size={20} />
        },
        {
          path: '/riwayat',
          name: 'Riwayat',
          icon: <History size={20} />
        }
      ];
    }

    // Admin and Petugas menu
    return [
      {
        path: '/dashboard',
        name: 'Dashboard',
        icon: <LayoutDashboard size={20} />
      },
      {
        path: '/transaksi',
        name: 'Transaksi',
        icon: <ShoppingCart size={20} />
      },
      {
        path: '/produk',
        name: 'Produk',
        icon: <Package size={20} />
      },
      {
        path: '/laporan',
        name: 'Laporan',
        icon: <BarChart size={20} />
      }
    ];
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#344293]">KasirKita</h1>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#344293]/10 flex items-center justify-center">
              <User size={20} className="text-[#344293]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {getMenuItems().map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#344293] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-gray-700 hover:text-red-600 w-full px-4 py-2.5 rounded-lg transition-colors hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 