const Order = require('../models/Order');
const Product = require('../models/produk');

// Get all orders (for admin & staff)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('customer', 'username') // Populate customer data
      .populate('items.product', 'name price imageUrl') // Populate product details
      .select('-__v'); // Exclude version key

    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get all orders for a specific customer
const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    
    // Verify that the authenticated user is requesting their own orders
    if (req.user.id.toString() !== customerId) {
      return res.status(403).json({ message: 'Unauthorized access to orders' });
    }

    const orders = await Order.find({ customer: customerId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('customer', 'username') // Populate customer data
      .populate('items.product', 'name price imageUrl') // Populate product details
      .select('-__v'); // Exclude version key

    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, total } = req.body;
    const customerId = req.user.id;

    // Validate items
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Check stock and update products
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
    }

    // Generate order number
    const datePrefix = new Date().toISOString().slice(2,10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `${datePrefix}-${randomSuffix}`;

    // Create order
    const order = new Order({
      customer: customerId,
      items: items.map(item => ({
        product: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      })),
      total,
      status: 'pending',
      orderNumber
    });

    // Save order
    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Return created order
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price imageUrl');
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ 
      message: error.message || 'Error creating order',
      details: error.errors ? Object.values(error.errors).map(e => e.message) : null
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log('Updating order status:', { orderId, status });

    // Validate orderId
    if (!orderId) {
      return res.status(400).json({ message: 'ID pesanan tidak valid' });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    // Find and update order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    console.log('Found order:', order);

    // Update the status
    order.status = status;
    await order.save();

    // Populate the updated order
    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'username')
      .populate('items.product', 'name price imageUrl');

    console.log('Updated order:', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      message: 'Gagal mengubah status pesanan',
      error: error.message 
    });
  }
};

module.exports = {
  getAllOrders,
  getCustomerOrders,
  createOrder,
  updateOrderStatus
}; 