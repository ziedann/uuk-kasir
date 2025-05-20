const mongoose = require('mongoose');

const pelangganSchema = new mongoose.Schema({
  NamaPelanggan: { 
    type: String, 
    required: true 
  },
  Alamat: { 
    type: String 
  },
  NomorTelepon: {
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Pelanggan', pelangganSchema);
