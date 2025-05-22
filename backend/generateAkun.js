const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

const SALT_ROUNDS = 10;
const password = "admin123"; // Password untuk admin

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Fungsi untuk membuat admin
async function createAdmin() {
  try {
    // Generate hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Data admin
    const adminData = {
      username: "admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin"
    };

    // Cek apakah admin sudah ada
    const existingAdmin = await User.findOne({ username: adminData.username });
    if (existingAdmin) {
      console.log('Admin already exists!');
      mongoose.connection.close();
      return;
    }

    // Buat admin baru
    const admin = new User(adminData);
    await admin.save();
    
    console.log('Admin created successfully!');
    console.log('Username:', adminData.username);
    console.log('Password:', password); // Password asli untuk login
    console.log('Role:', adminData.role);
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Jalankan fungsi
createAdmin(); 