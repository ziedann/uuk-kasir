const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  }, 
  invoiceNumber: {
    type: String, 
    unique: true, 
    required: true
  },
  totalAmount: { 
    type: Number, 
    required: true
  },
  transactionDate: {
    type: Date,
    default: Date.now 
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
