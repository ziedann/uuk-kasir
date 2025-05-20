const mongoose = require('mongoose');

const transactionDetailSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  price: {
    type: Number, 
    required: true
  } 
});

module.exports = mongoose.model('TransactionDetail', transactionDetailSchema);
