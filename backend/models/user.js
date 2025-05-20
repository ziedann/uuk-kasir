const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  email: {
    type: String 
  },
  role: { 
    type: String, 
    enum: [
      'admin', 'petugas', 'pelanggan'
    ], 
    required: true },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);

