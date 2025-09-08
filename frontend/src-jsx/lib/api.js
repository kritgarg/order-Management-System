// Force local development API URL unless explicitly overridden
import config from '../config/env.js';

// Get API URL from configuration
const API_URL = config.API_URL;

// Log environment variable status
if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL environment variable is NOT SET, using fallback URL');
} else {
  console.log('✅ VITE_API_URL is set:', import.meta.env.VITE_API_URL);
}
console.log('🔍 Will connect to:', API_URL);

// Debug logging
console.log('🔍 API_URL configured as:', API_URL);
console.log('🔍 import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔍 import.meta.env.PROD:', import.meta.env.PROD);
console.log('🔍 import.meta.env.MODE:', import.meta.env.MODE);

export const api = {
  // Get all orders
  getOrders: async () => {
    try {
      if (!API_URL) {
        throw new Error('API URL not configured. Please set VITE_API_URL environment variable.');
      }
      
      console.log('🔍 Fetching orders from:', `${API_URL}/orders`);
      console.log('🔍 Environment:', import.meta.env.MODE);
      console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL);
      
      // Add cache-busting parameter
      const cacheBuster = Date.now();
      const fullUrl = `${API_URL}/orders?t=${cacheBuster}`;
      console.log('🔍 Making request to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('Error fetching orders:', data.message || 'Failed to fetch orders');
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      console.log('🔍 Raw API response:', data);
      
      // Backend returns paginated response with orders array and pagination info
      const orders = data.orders || [];
      console.log('🔍 Extracted orders:', orders);
      console.log('🔍 Pagination info:', data.pagination);
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Please check if the server is running and VITE_API_URL is set correctly.');
      }
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData) => {
    if (!API_URL) {
      throw new Error('API URL not configured. Please set VITE_API_URL environment variable.');
    }
    
    console.log('Sending order data:', orderData);
    console.log('API URL for create:', `${API_URL}/orders`);
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Error creating order:', data.message || 'Failed to create order');
      console.error('Response status:', response.status);
      throw new Error(data.message || 'Failed to create order');
    }
    
    const data = await response.json();
    console.log('Order created successfully:', data);
    return data;
  },

  // Update an order
  updateOrder: async (id, orderData) => {
    if (!API_URL) {
      throw new Error('API URL not configured. Please set VITE_API_URL environment variable.');
    }
    
    console.log('Updating order:', id, orderData);
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Error updating order:', data.message || 'Failed to update order');
      throw new Error(data.message || 'Failed to update order');
    }
    
    const data = await response.json();
    console.log('Order updated successfully:', data);
    return data;
  },

  // Delete an order
  deleteOrder: async (id) => {
    if (!API_URL) {
      throw new Error('API URL not configured. Please set VITE_API_URL environment variable.');
    }
    
    console.log('Deleting order:', id);
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Error deleting order:', data.message || 'Failed to delete order');
      throw new Error(data.message || 'Failed to delete order');
    }
    
    const data = await response.json().catch(() => ({ message: 'Order deleted successfully' }));
    console.log('Order deleted successfully:', data);
    return data;
  },
}; 