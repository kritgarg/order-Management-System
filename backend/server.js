import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ordersRouter from './routes/orders.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true
}));
app.use(express.json());

// Database connection
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set');
      process.exit(1);
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }
};

// Routes
app.use('/api/orders', ordersRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: '✅ OMS Backend Server Running!',
    mongo: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      db: mongoose.connection.name
    },
    time: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}`);
      console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 