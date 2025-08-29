// Force local development API URL unless explicitly overridden
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; 

// Debug logging
console.log('🔍 API_URL configured as:', API_URL);
console.log('🔍 import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔍 import.meta.env.PROD:', import.meta.env.PROD);
console.log('🔍 import.meta.env.MODE:', import.meta.env.MODE);

export const api = {
  // Get all orders
  getOrders: async () => {
    try {
      console.log('🔍 Fetching orders from:', `${API_URL}/orders`);
      console.log('🔍 Environment:', import.meta.env.MODE);
      console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL);
      
      const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
      // Backend returns paginated data, extract orders array
      return data.orders || data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Backend server is not running. Please start the backend server on port 3000.');
      }
      throw error;
    }
  },

  // Create a new order
  createOrder: async (orderData) => {
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