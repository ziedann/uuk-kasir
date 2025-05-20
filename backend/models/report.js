const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  generatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
},
  reportType: {
    type: String,
    enum: [
        'penjualan', 
        'per_pelanggan', 
        'produk_terlaris'
    ],
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now 
}
});

module.exports = mongoose.model('Report', reportSchema);
