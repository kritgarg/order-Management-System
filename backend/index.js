import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }
};

export default async function handler(req, res) {
  // CORS configuration for production
  const allowedOrigins = [
    'https://cs-frontend-rust.vercel.app',
    'http://localhost:3000', // for local development
    'http://localhost:5173'  // for Vite dev server
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    res.status(200).json({
      message: '✅ Vercel + MongoDB working!',
      mongo: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        host: mongoose.connection.host,
        db: mongoose.connection.name
      },
      time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: '❌ Failed to connect to MongoDB',
      details: error.message
    });
  }
}
