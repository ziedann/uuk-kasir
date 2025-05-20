const express = require('express')
const cors = require('cors')
const app = express()
const connectDB = require('./config/db')

require('dotenv').config();
const port = process.env.PORT;

// Connect to database
connectDB()

// CORS configuration - more permissive for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow both localhost and 127.0.0.1
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', require('./routes/authRoutes'))

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})