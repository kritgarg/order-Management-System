import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Load orders from API on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching orders...');
        const data = await api.getOrders();
        console.log('Orders fetched:', data);
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const addOrder = async (orderData) => {
    try {
      setLoading(true);
      console.log('Creating order:', orderData);
      const newOrder = await api.createOrder(orderData);
      console.log('Order created:', newOrder);
      setOrders(prevOrders => [...prevOrders, newOrder]);
      setError(null);
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      return newOrder;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, updatedOrder) => {
    try {
      setLoading(true);
      console.log('Updating order:', id, updatedOrder);
      const updated = await api.updateOrder(id, updatedOrder);
      console.log('Order updated:', updated);
      setOrders(prevOrders =>
        prevOrders.map(order => (order._id === id ? updated : order))
      );
      setError(null);
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      return updated;
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      setLoading(true);
      console.log('Deleting order:', id);
      await api.deleteOrder(id);
      console.log('Order deleted successfully');
      setOrders(prevOrders => prevOrders.filter(order => order._id !== id));
      setError(null);
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importOrders = async (importedOrders) => {
    try {
      setLoading(true);
      console.log('Importing orders:', importedOrders);
      const importPromises = importedOrders.map(order => api.createOrder(order));
      const newOrders = await Promise.all(importPromises);
      console.log('Orders imported:', newOrders);
      setOrders(prevOrders => [...prevOrders, ...newOrders]);
      setError(null);
      toast({
        title: "Success",
        description: `${importedOrders.length} orders imported successfully`,
      });
    } catch (err) {
      console.error('Error importing orders:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = () => {
    console.log('Exporting orders:', orders);
    const dataStr = JSON.stringify(orders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `rolling-mill-orders-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    deleteOrder,
    importOrders,
    exportOrders,
  };
};
