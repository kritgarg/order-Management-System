import express from 'express';
import Order from '../models/Order.js';
import storageService from '../services/storageService.js';
import mongoose from 'mongoose';

const router = express.Router();

console.log('🛣️  Initializing Orders Routes...');
console.log('   Storage: MongoDB Only');
console.log('   Cache: Disabled');
console.log('   Local Fallback: Disabled');

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all orders with optional pagination and filtering
router.get('/', asyncHandler(async (req, res) => {
  const query = {};

  // Add filters if provided
  if (req.query.status) {
    query['rolls.status'] = req.query.status;
  }
  if (req.query.grade) {
    query['rolls.grade'] = req.query.grade;
  }
  if (req.query.companyName) {
    query.companyName = new RegExp(req.query.companyName, 'i');
  }

  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  const hasPagination = typeof req.query.limit !== 'undefined' || typeof req.query.page !== 'undefined';

  if (!hasPagination) {
    // Return all orders by default (no pagination applied)
    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({
      orders: orders || [],
      pagination: {
        total: orders ? orders.length : 0,
        page: 1,
        pages: 1
      }
    });
  }

  // Apply pagination only when explicitly requested
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query)
  ]);

  res.json({
    orders: orders || [],
    pagination: {
      total: total || 0,
      page,
      pages: Math.ceil((total || 0) / limit)
    }
  });
}));

// Get overdue orders
router.get('/overdue', asyncHandler(async (req, res) => {
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const overdueOrders = await Order.findOverdue();
  res.json(overdueOrders);
}));

// Create a new order (with cache invalidation)
router.post('/', asyncHandler(async (req, res) => {
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const savedOrder = await storageService.createOrder(req.body);
  res.status(201).json(savedOrder);
}));

// Update an order (with cache invalidation)
router.put('/:id', asyncHandler(async (req, res) => {
  console.log('🔄 Updating order:', req.params.id);
  console.log('📝 Update data:', req.body);
  
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const order = await storageService.updateOrder(req.params.id, req.body);
  console.log('✅ Order updated:', order);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  res.json(order);
}));

// Delete an order
router.delete('/:id', asyncHandler(async (req, res) => {
  console.log('🗑️  Deleting order:', req.params.id);
  
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const order = await Order.findByIdAndDelete(req.params.id);
  console.log('✅ Order deleted:', order);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ message: 'Order deleted successfully' });
}));

// Get order statistics (cached)
router.get('/stats', asyncHandler(async (req, res) => {
  // Ensure MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection unavailable');
  }

  // Use MongoDB only
  const stats = await storageService.getDashboardStats();
  res.json(stats);
}));

// Get analytics data
router.get('/analytics', asyncHandler(async (req, res) => {
  const timeRange = req.query.range || '30d';
  const analytics = await storageService.getOrderAnalytics(timeRange);
  res.json(analytics);
}));

// Storage health check
router.get('/health', asyncHandler(async (req, res) => {
  const health = await storageService.healthCheck();
  res.json(health);
}));

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      error: error.message
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: error.message
    });
  }
  
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message,
      error: error.message
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
    error: error.message
  });
});

export default router; 