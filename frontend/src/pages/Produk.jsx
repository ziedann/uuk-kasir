import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, BarChart2, Tag, Image as ImageIcon, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';
const BASE_URL = 'http://localhost:5000';

const Produk = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    image: null,
    description: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        alert('Sesi anda telah berakhir. Silahkan login kembali');
        navigate('/login');
      } else {
        alert('Gagal mengambil data produk');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Ukuran gambar terlalu besar. Maksimal 2MB');
        return;
      }
      setFormData({
        ...formData,
        image: file
      });
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: '',
      image: null,
      description: ''
    });
    setPreviewImage(null);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleAddProduct = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?.name || '',
      image: null,
      description: product.description || ''
    });
    setPreviewImage(product.imageUrl);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Anda harus login terlebih dahulu');
          navigate('/login');
          return;
        }

        await axios.delete(`${API_URL}/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        await fetchProducts(); // Refresh products list
        alert('Produk berhasil dihapus');
      } catch (error) {
        console.error('Error deleting product:', error);
        if (error.response?.status === 401) {
          alert('Sesi anda telah berakhir. Silahkan login kembali');
          navigate('/login');
        } else {
          alert('Gagal menghapus produk');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Anda harus login terlebih dahulu');
        navigate('/login');
        return;
      }

      if (!formData.name || !formData.price || !formData.stock || !formData.category) {
        alert('Semua field harus diisi');
        return;
      }

      // Create FormData object for multipart/form-data
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('price', parseFloat(formData.price));
      productData.append('stock', parseInt(formData.stock));
      productData.append('category', formData.category);
      productData.append('description', formData.description);
      
      // Append image if exists
      if (formData.image) {
        productData.append('image', formData.image);
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      if (editingProduct) {
        // Update existing product
        await axios.put(
          `${API_URL}/products/${editingProduct._id}`,
          productData,
          { headers }
        );
      } else {
        // Add new product
        await axios.post(
          `${API_URL}/products`,
          productData,
          { headers }
        );
      }

      await fetchProducts(); // Refresh products list
      resetForm(); // Reset form and close it
      alert(editingProduct ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan');
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.status === 401) {
        alert('Sesi anda telah berakhir. Silahkan login kembali');
        navigate('/login');
      } else {
        alert('Gagal menyimpan produk: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(products.map(product => 
    product.category?.name || product.category || 'Uncategorized'
  ))];

  return (
    <div className="py-8 px-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-medium text-gray-800">Produk</h2>
        <button
          onClick={handleAddProduct}
          className="flex items-center justify-center bg-[#344293] text-white px-4 py-2 rounded-xl hover:bg-[#344293]/90 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
                  <Package size={18} />
                </div>
                <h3 className="text-lg font-medium text-gray-800">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Harga (Rp)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stok</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-blue-500 transition-colors">
                    <div className="space-y-1 text-center">
                      {previewImage ? (
                        <div className="relative">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(null);
                              setFormData({ ...formData, image: null });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          </div>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-500 hover:text-blue-600 focus-within:outline-none"
                            >
                              <span>Upload gambar</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">atau drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF sampai 2MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center bg-[#344293] text-white px-4 py-2 rounded-xl hover:bg-[#344293]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <span>Menyimpan...</span>
                  ) : editingProduct ? (
                    <>
                      <Edit size={18} className="mr-2" />
                      <span>Update</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="mr-2" />
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowImagePreview(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] mx-4">
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-gray-600 hover:text-gray-900 shadow-lg"
            >
              <X size={20} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="rounded-lg max-h-[85vh] object-contain bg-white p-2"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
              <BarChart2 size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Statistik Produk</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm mb-1">Total Produk</p>
              <p className="text-2xl font-medium text-gray-900">{products.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm mb-1">Kategori</p>
              <p className="text-2xl font-medium text-gray-900">{categories.length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm mb-1">Stok Rendah</p>
              <p className="text-2xl font-medium text-gray-900">{products.filter(p => p.stock < 30).length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 text-sm mb-1">Stok Total</p>
              <p className="text-2xl font-medium text-gray-900">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#344293]/10 text-[#344293] flex items-center justify-center mr-3">
              <Tag size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Kategori Produk</h3>
          </div>

          <div className="space-y-3">
            {categories.map(category => (
              <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-800">{category}</span>
                <span className="bg-[#344293]/10 text-[#344293] px-3 py-1 rounded-full text-xs font-medium">
                  {products.filter(p => 
                    (p.category?.name || p.category) === category
                  ).length} produk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Gambar</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nama</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Kategori</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Harga</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stok</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{product._id}</td>
                  <td className="py-3 px-4">
                    <div 
                      className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (product.imageUrl) {
                          setSelectedImage(BASE_URL + product.imageUrl);
                          setShowImagePreview(true);
                        }
                      }}
                    >
                      {product.imageUrl ? (
                        <img
                          src={BASE_URL + product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-800">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600">{product.category?.name || product.category || 'Uncategorized'}</td>
                  <td className="py-3 px-4 text-gray-800">Rp {product.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-800">{product.stock}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-[#344293] hover:text-[#344293]/80 p-1 mr-2"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Produk;