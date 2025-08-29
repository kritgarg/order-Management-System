/**
 * Storage Service - MongoDB Only
 * Simple storage service using only MongoDB for data persistence
 */

import Order from '../models/Order.js';

class StorageService {
  constructor() {
    console.log('🗄️  Initializing Storage Service (MongoDB Only)');
    console.log('   Cache: Disabled');
    console.log('   Blob Storage: Disabled');
    console.log('   Local Storage: Disabled');
    console.log('   Primary Storage: MongoDB');
  }

  // ==================== ORDER OPERATIONS ====================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    console.log('📊 Fetching dashboard statistics...');
    const startTime = Date.now();

    try {
      const [totalOrders, pendingOrders, completedOrders] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ 'rolls.status': 'Pending' }),
        Order.countDocuments({ 'rolls.status': 'dispached' })
      ]);

      const stats = {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: 0, // Revenue calculation would need pricing data
        lastUpdated: new Date().toISOString()
      };

      const duration = Date.now() - startTime;
      console.log(`✅ Dashboard stats fetched in ${duration}ms`);
      console.log(`   Total Orders: ${totalOrders}`);
      console.log(`   Pending Orders: ${pendingOrders}`);
      console.log(`   Completed Orders: ${completedOrders}`);

      return stats;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error.message);
      throw error;
    }
  }

  /**
   * Get orders with filtering
   */
  async getOrders(filters = {}) {
    let query = Order.find(filters);
    
    // Apply sorting
    query = query.sort({ createdAt: -1 });
    
    return await query.exec();
  }

  /**
   * Create order
   */
  async createOrder(orderData) {
    console.log('📝 Creating new order...');
    console.log(`   Company: ${orderData.companyName || 'Unknown'}`);
    console.log(`   Order Number: ${orderData.orderNumber || 'Not specified'}`);
    console.log(`   Rolls Count: ${orderData.rolls?.length || 0}`);

    const startTime = Date.now();

    try {
      const order = await Order.create(orderData);
      const duration = Date.now() - startTime;

      console.log(`✅ Order created successfully in ${duration}ms`);
      console.log(`   Order ID: ${order._id}`);
      console.log(`   Created At: ${order.createdAt}`);

      return order;
    } catch (error) {
      console.error('❌ Error creating order:', error.message);
      if (error.name === 'ValidationError') {
        console.error('🔍 Validation errors:', Object.keys(error.errors));
      }
      throw error;
    }
  }

  /**
   * Update order
   */
  async updateOrder(id, updateData) {
    const order = await Order.findByIdAndUpdate(
      id, 
      { ...updateData, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    );
    return order;
  }

  /**
   * Delete order
   */
  async deleteOrder(id) {
    const order = await Order.findByIdAndDelete(id);
    return order;
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(timeRange = '30d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const analytics = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          totalRolls: { $sum: { $size: '$rolls' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return analytics;
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check storage service health
   */
  async healthCheck() {
    console.log('🏥 Running storage health check...');
    const startTime = Date.now();

    const health = {
      mongodb: false,
      cache: false,
      blob: false,
      timestamp: new Date().toISOString(),
      details: {}
    };

    // Test MongoDB
    try {
      console.log('🔍 Testing MongoDB connection...');
      const testDoc = await Order.findOne().limit(1);
      health.mongodb = true;
      health.details.mongodb = {
        status: 'connected',
        testQuery: 'successful',
        sampleDocument: testDoc ? 'found' : 'empty_collection'
      };
      console.log('✅ MongoDB health check passed');
    } catch (error) {
      console.error('❌ MongoDB health check failed:', error.message);
      health.details.mongodb = {
        status: 'failed',
        error: error.message,
        code: error.code
      };
    }

    // KV and Blob are disabled
    health.cache = false;
    health.blob = false;
    health.details.cache = { status: 'disabled', reason: 'MongoDB-only configuration' };
    health.details.blob = { status: 'disabled', reason: 'MongoDB-only configuration' };

    const duration = Date.now() - startTime;
    console.log(`🏥 Health check completed in ${duration}ms`);
    console.log(`   MongoDB: ${health.mongodb ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   Cache: ⚪ Disabled`);
    console.log(`   Blob: ⚪ Disabled`);

    return health;
  }
}

export default new StorageService();
