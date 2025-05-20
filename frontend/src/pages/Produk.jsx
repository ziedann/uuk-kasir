import { useState } from 'react';
import { Package, Plus, Edit, Trash2, BarChart2, Tag } from 'lucide-react';

const Produk = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Kopi Hitam', price: 10000, stock: 50, category: 'Minuman' },
    { id: 2, name: 'Kopi Susu', price: 15000, stock: 45, category: 'Minuman' },
    { id: 3, name: 'Teh Manis', price: 8000, stock: 60, category: 'Minuman' },
    { id: 4, name: 'Roti Bakar', price: 12000, stock: 25, category: 'Makanan' }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: ''
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      category: ''
    });
    setShowForm(true);
  };
  
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category
    });
    setShowForm(true);
  };
  
  const handleDeleteProduct = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      alert('Semua field harus diisi');
      return;
    }
    
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(product => 
        product.id === editingProduct.id 
          ? { 
              ...product, 
              name: formData.name,
              price: parseFloat(formData.price),
              stock: parseInt(formData.stock),
              category: formData.category
            } 
          : product
      ));
    } else {
      // Add new product
      const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category
      };
      
      setProducts([...products, newProduct]);
    }
    
    setShowForm(false);
    setEditingProduct(null);
  };
  
  const categories = [...new Set(products.map(product => product.category))];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-medium text-gray-800">Produk</h2>
        <button 
          onClick={handleAddProduct}
          className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          <span>Tambah Produk</span>
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Package size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit}>
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
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="mr-3 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
              >
                {editingProduct ? (
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
      )}
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nama</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Kategori</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Harga</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stok</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{product.id}</td>
                  <td className="py-3 px-4 text-gray-800">{product.name}</td>
                  <td className="py-3 px-4 text-gray-600">{product.category}</td>
                  <td className="py-3 px-4 text-gray-800">Rp {product.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-800">{product.stock}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
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
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              <Tag size={18} />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Kategori Produk</h3>
          </div>
          
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-800">{category}</span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {products.filter(p => p.category === category).length} produk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Produk; 