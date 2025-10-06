import { useState, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { OrderList } from "@/components/OrderList";
import { OrderForm } from "@/components/OrderForm";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { DevelopmentWarning } from "@/components/DevelopmentWarning";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [editingOrder, setEditingOrder] = useState(null);
  const fileInputRef = useRef(null);
  const { orders, addOrder, updateOrder, deleteOrder, importOrders, exportOrders } =
    useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem("oms_auth");
    } catch {}
    navigate("/login", { replace: true });
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setCurrentPage("edit-order");
  };

  const handleDeleteOrder = (id) => {
    deleteOrder(id);
    toast({
      title: "Success",
      description: "Order deleted successfully",
    });
  };

  const handleFormSubmit = async (orderData) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder._id, orderData);
        toast({
          title: "Success",
          description: "Order updated successfully",
        });
      } else {
        await addOrder(orderData);
        toast({
          title: "Success",
          description: "Order created successfully",
        });
      }
      setEditingOrder(null);
      setCurrentPage("orders");
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save order",
        variant: "destructive",
      });
    }
  };

  const handleFormCancel = () => {
    setEditingOrder(null);
    setCurrentPage("orders");
  };

  const handleImportJson = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedOrders = JSON.parse(e.target?.result);
          importOrders(importedOrders);
          toast({
            title: "Success",
            description: `${importedOrders.length} orders imported successfully`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to import JSON file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard orders={orders} />;
      case "orders":
        return (
          <OrderList
            orders={orders}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateOrder={updateOrder}
          />
        );
      case "add-order":
        return (
          <OrderForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
        );
      case "edit-order":
        return (
          <OrderForm
            order={editingOrder || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        );
      default:
        return <Dashboard orders={orders} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Dashboard";
      case "orders":
        return "All Orders";
      case "add-order":
        return "Add New Order";
      case "edit-order":
        return "Edit Order";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="mt-4 mx-6 bg-white/60 backdrop-blur-xl shadow-lg border border-white/70 rounded-2xl px-8 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">{getPageTitle()}</h1>
            <div className="flex items-center gap-4">
              <ConnectionStatus />
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">
          <DevelopmentWarning />
          {renderCurrentPage()}
        </main>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default Index;
