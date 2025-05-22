import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, testConnection } from '../services/authService';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Test connection to server when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testConnection();
        setIsServerConnected(true);
      } catch (err) {
        console.error('Server connection check failed:', err);
        setIsServerConnected(false);
        setError('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.');
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (userData.password !== userData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError('Format email tidak valid');
      return;
    }

    setIsLoading(true);

    try {
      // First check if server is reachable
      if (!isServerConnected) {
        try {
          await testConnection();
          setIsServerConnected(true);
        } catch (err) {
          throw new Error('Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.');
        }
      }
      
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...registerData } = userData;
      await register(registerData);
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login.' } });
    } catch (err) {
      console.error('Registration submission error:', err);
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
      
      // If it's a connection error, update the server connection status
      if (err.message.includes('connect to the server') || err.message.includes('Failed to fetch')) {
        setIsServerConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Daftar KasirKita</h1>
        
        {!isServerConnected && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Peringatan: Tidak dapat terhubung ke server backend. Pastikan server berjalan di http://localhost:5000
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#344293]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#344293]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#344293]"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#344293]"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#344293] text-white py-2 px-4 rounded-md hover:bg-[#344293]/90 focus:outline-none focus:ring-2 focus:ring-[#344293] focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#344293] hover:text-[#344293]/80">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;