import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Edit, Trash2, Search, ChevronDown, ChevronUp } from "lucide-react";
import { saveAs } from 'file-saver';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const OrderList = ({ orders, onEditOrder, onDeleteOrder }) => {
  console.log("Orders data received by OrderList:", orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [descFilter, setDescFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [orderToDelete, setOrderToDelete] = useState(null);
  const ORDERS_PER_PAGE = 10;

  // Collect all unique roll statuses, grades, and descriptions for filters
  const allRollStatuses = Array.from(new Set(orders.flatMap(o => o.rolls?.map(r => r.status) || [])));
  const allGrades = Array.from(new Set(orders.flatMap(o => o.rolls?.map(r => r.grade) || [])));
  const allDescs = Array.from(new Set(orders.flatMap(o => o.rolls?.map(r => r.rollDescription) || [])));

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
    setDeleteConfirmation("");
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation === "delete my order") {
      onDeleteOrder(orderToDelete._id);
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
      setOrderToDelete(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Ensure order and its properties exist before accessing
    if (!order) return false; // Skip null/undefined orders

    const companyName = order.companyName?.toLowerCase() || '';
    const orderNumber = order.orderNumber?.toLowerCase() || '';
    const broker = order.broker?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch =
      companyName.includes(searchTermLower) ||
      orderNumber.includes(searchTermLower) ||
      broker.includes(searchTermLower) ||
      (order.rolls && order.rolls.some(roll => 
        roll?.rollNumber?.toLowerCase().includes(searchTermLower) ||
        roll?.machining?.toLowerCase().includes(searchTermLower)
      ));

    const matchesStatus = statusFilter === "all" || (order.rolls && order.rolls.some(r => r?.status === statusFilter));
    const matchesGrade = gradeFilter === "all" || (order.rolls && order.rolls.some(r => r?.grade === gradeFilter));
    const matchesDesc = descFilter === "all" || (order.rolls && order.rolls.some(r => r?.rollDescription === descFilter));

    return matchesSearch && matchesStatus && matchesGrade && matchesDesc;
  });

  // Sort by orderDate (latest first)
  const sortedOrders = filteredOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  const totalPages = Math.ceil(sortedOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = sortedOrders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

  const handleExportJson = () => {
    const jsonString = JSON.stringify(orders, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, 'orders.json');
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <br />
            <DialogDescription style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
              Are you sure you want to delete this order? 
              <br />
              <br />
              Type <span style={{ color: 'red' }}>"delete my order"</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type 'delete my order' to confirm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
                setOrderToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmation !== "delete my order"}
            >
              Delete Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by order status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Order Statuses</SelectItem>
            {allRollStatuses.map((status) => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {allGrades.map((grade) => (
              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={descFilter} onValueChange={setDescFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by description" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Descriptions</SelectItem>
            {allDescs.map((desc) => (
              <SelectItem key={desc} value={desc}>{desc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Export Button */}
      <div className="flex justify-end space-x-2">
        <Button onClick={handleExportJson} variant="outline">
          Export to JSON
        </Button>
      </div>

      {/* Orders */}
      <div className="grid gap-4">
        {paginatedOrders.map((order) => (
          <Card key={order._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                  <p className="text-gray-600">{order.companyName}</p>
                  {order.broker && <p className="text-gray-600 text-sm">Broker: {order.broker}</p>}
                  <div className="text-xs text-gray-500 mt-1">
                    Order Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "-"} <br />
                    Expected Delivery: {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : "-"}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpanded((prev) => ({ ...prev, [order._id]: !prev[order._id] }))}
                  >
                    {expanded[order._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Rolls
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditOrder(order)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(order)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expanded[order._id] && (
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border">Roll Number</th>
                        <th className="p-2 border">Hardness</th>
                        <th className="p-2 border">Grade</th>
                        <th className="p-2 border">Description</th>
                        <th className="p-2 border">Dimensions</th>
                        <th className="p-2 border">Status</th>
                        <th className="p-2 border">Machining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.rolls && order.rolls.map((roll, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border">{roll.rollNumber}</td>
                          <td className="p-2 border">{roll.hardness}</td>
                          <td className="p-2 border">{roll.grade}</td>
                          <td className="p-2 border">{roll.rollDescription}</td>
                          <td className="p-2 border">{roll.dimensions}</td>
                          <td className="p-2 border"><StatusBadge status={roll.status} /></td>
                          <td className="p-2 border">{roll.machining}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              No orders found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-2">Page {page} of {totalPages}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
