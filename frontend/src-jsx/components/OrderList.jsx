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

export const OrderList = ({ orders, onEditOrder, onDeleteOrder, onUpdateOrder }) => {
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
  // Inline edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingMap, setEditingMap] = useState({}); // key: field path -> boolean
  const ORDERS_PER_PAGE = 10;

  // Normalize strings for search: lowercase and remove spaces
  const normalize = (val) => (val ?? "").toString().toLowerCase().replace(/\s+/g, "");

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

  // Open inline edit dialog instead of navigating to full page
  const handleInlineEdit = (order) => {
    // Deep clone minimal fields we allow to edit
    const clone = JSON.parse(JSON.stringify(order || {}));
    // Fallbacks
    clone.broker = clone.broker || "";
    clone.notes = clone.notes || "";
    clone.rolls = Array.isArray(clone.rolls) ? clone.rolls : [];
    setEditingOrder(clone);
    setEditingMap({});
    setEditDialogOpen(true);
  };

  const toggleEditing = (key) => {
    setEditingMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateEditingField = (path, value) => {
    setEditingOrder((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const segments = path.split(".");
      let node = next;
      for (let i = 0; i < segments.length - 1; i++) {
        const s = segments[i];
        if (!(s in node)) node[s] = {};
        node = node[s];
      }
      node[segments[segments.length - 1]] = value;
      return next;
    });
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const toISOIfSet = (dateStr) => {
    return dateStr ? new Date(dateStr).toISOString() : null;
  };

  const saveInlineEdits = async () => {
    if (!editingOrder) return;
    // Minimal validation
    if (!editingOrder.companyName) {
      alert("Please enter company name");
      return;
    }
    if (!editingOrder.orderDate) {
      alert("Please select order date");
      return;
    }
    const invalidRolls = (editingOrder.rolls || []).filter((r) => !r.hardness);
    if (invalidRolls.length > 0) {
      alert("All rolls must have hardness specified");
      return;
    }

    const payload = {
      ...editingOrder,
      // Ensure proper types and formats
      quantity: Array.isArray(editingOrder.rolls) ? editingOrder.rolls.length : editingOrder.quantity || 1,
      orderDate: toISOIfSet(formatDateForInput(editingOrder.orderDate) ? formatDateForInput(editingOrder.orderDate) : editingOrder.orderDate),
      expectedDelivery: toISOIfSet(formatDateForInput(editingOrder.expectedDelivery) ? formatDateForInput(editingOrder.expectedDelivery) : editingOrder.expectedDelivery),
      rolls: (editingOrder.rolls || []).map((roll) => ({
        rollNumber: roll.rollNumber || "",
        hardness: roll.hardness,
        machining: roll.machining || "",
        rollDescription: roll.rollDescription || "",
        dimensions: roll.dimensions || "",
        status: roll.status || "Pending",
        grade: roll.grade || "",
      })),
    };

    try {
      await onUpdateOrder(editingOrder._id, payload);
      setEditDialogOpen(false);
      setEditingOrder(null);
      setEditingMap({});
    } catch (e) {
      // errors are handled by toast in hook
    }
  };

  const rollDescriptions = [
    "SHAFT",
    "ROLL",
    "REEL",
    "CASTING",
    "FORGING",
  ];
  const statusOptions = [
    "Pending",
    "casting",
    "annealing",
    "machining",
    "bearing/wobler",
    "ready",
    "dispached",
  ];
  const gradeOptions = [
    "ALLOYS",
    "ADAMITE",
    "S.G.I",
    "W.S.G",
    "ACCICULAR",
    "CHILL",
    "EN-8",
    "EN-9",
  ];

  const filteredOrders = orders.filter((order) => {
    // Ensure order and its properties exist before accessing
    if (!order) return false; // Skip null/undefined orders

    // Normalized values (case-insensitive and space-insensitive)
    const companyName = normalize(order.companyName);
    const broker = normalize(order.broker);
    const searchNorm = normalize(searchTerm);

    const matchesSearch =
      companyName.includes(searchNorm) ||
      broker.includes(searchNorm) ||
      (order.rolls && order.rolls.some(roll => {
        const rNum = normalize(roll?.rollNumber);
        const rMach = normalize(roll?.machining);
        const rGrade = normalize(roll?.grade);
        const rDesc = normalize(roll?.rollDescription);
        const rDims = normalize(roll?.dimensions);
        const rStatus = normalize(roll?.status);
        return (
          rNum.includes(searchNorm) ||
          rMach.includes(searchNorm) ||
          rGrade.includes(searchNorm) ||
          rDesc.includes(searchNorm) ||
          rDims.includes(searchNorm) ||
          rStatus.includes(searchNorm)
        );
      }));

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
                    onClick={() => handleInlineEdit(order)}
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

      {/* Inline Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Order Inline</DialogTitle>
            <DialogDescription>
              Double-click a field to edit. Click Save when done.
            </DialogDescription>
          </DialogHeader>

          {editingOrder && (
            <div className="space-y-4">
              {/* Top fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Order Number</div>
                  <div className="p-2 border rounded bg-gray-50">{editingOrder.orderNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Company Name</div>
                  {editingMap["companyName"] ? (
                    <Input
                      value={editingOrder.companyName || ""}
                      onChange={(e) => updateEditingField("companyName", e.target.value)}
                      onBlur={() => toggleEditing("companyName")}
                      autoFocus
                    />
                  ) : (
                    <div className="p-2 border rounded cursor-pointer" onDoubleClick={() => toggleEditing("companyName")}>
                      {editingOrder.companyName || "-"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500">Broker</div>
                  {editingMap["broker"] ? (
                    <Input
                      value={editingOrder.broker || ""}
                      onChange={(e) => updateEditingField("broker", e.target.value)}
                      onBlur={() => toggleEditing("broker")}
                      autoFocus
                    />
                  ) : (
                    <div className="p-2 border rounded cursor-pointer" onDoubleClick={() => toggleEditing("broker")}>
                      {editingOrder.broker || "-"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500">Order Date</div>
                  {editingMap["orderDate"] ? (
                    <Input
                      type="date"
                      value={formatDateForInput(editingOrder.orderDate)}
                      onChange={(e) => updateEditingField("orderDate", e.target.value)}
                      onBlur={() => toggleEditing("orderDate")}
                      autoFocus
                    />
                  ) : (
                    <div className="p-2 border rounded cursor-pointer" onDoubleClick={() => toggleEditing("orderDate")}>
                      {formatDateForInput(editingOrder.orderDate) || "-"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500">Expected Delivery</div>
                  {editingMap["expectedDelivery"] ? (
                    <Input
                      type="date"
                      value={formatDateForInput(editingOrder.expectedDelivery)}
                      onChange={(e) => updateEditingField("expectedDelivery", e.target.value)}
                      onBlur={() => toggleEditing("expectedDelivery")}
                      autoFocus
                    />
                  ) : (
                    <div className="p-2 border rounded cursor-pointer" onDoubleClick={() => toggleEditing("expectedDelivery")}>
                      {formatDateForInput(editingOrder.expectedDelivery) || "-"}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-500">Notes</div>
                  {editingMap["notes"] ? (
                    <Input
                      value={editingOrder.notes || ""}
                      onChange={(e) => updateEditingField("notes", e.target.value)}
                      onBlur={() => toggleEditing("notes")}
                      autoFocus
                    />
                  ) : (
                    <div className="p-2 border rounded cursor-pointer" onDoubleClick={() => toggleEditing("notes")}>
                      {editingOrder.notes || "-"}
                    </div>
                  )}
                </div>
              </div>

              {/* Rolls table editable */}
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
                    {(editingOrder.rolls || []).map((roll, idx) => (
                      <tr key={idx}>
                        {/* Roll Number */}
                        <td className="p-2 border">
                          {editingMap[`rolls.${idx}.rollNumber`] ? (
                            <Input
                              value={roll.rollNumber || ""}
                              onChange={(e) => updateEditingField(`rolls.${idx}.rollNumber`, e.target.value)}
                              onBlur={() => toggleEditing(`rolls.${idx}.rollNumber`)}
                              autoFocus
                            />
                          ) : (
                            <div className="cursor-pointer" onDoubleClick={() => toggleEditing(`rolls.${idx}.rollNumber`)}>
                              {roll.rollNumber || "-"}
                            </div>
                          )}
                        </td>

                        {/* Hardness */}
                        <td className="p-2 border">
                          {editingMap[`rolls.${idx}.hardness`] ? (
                            <Input
                              value={roll.hardness || ""}
                              onChange={(e) => updateEditingField(`rolls.${idx}.hardness`, e.target.value)}
                              onBlur={() => toggleEditing(`rolls.${idx}.hardness`)}
                              autoFocus
                            />
                          ) : (
                            <div className="cursor-pointer" onDoubleClick={() => toggleEditing(`rolls.${idx}.hardness`)}>
                              {roll.hardness || "-"}
                            </div>
                          )}
                        </td>

                        {/* Grade */}
                        <td className="p-2 border">
                          {editingMap[`rolls.${idx}.grade`] ? (
                            <Select
                              value={roll.grade || ""}
                              onValueChange={(val) => updateEditingField(`rolls.${idx}.grade`, val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {gradeOptions.map((g) => (
                                  <SelectItem key={g} value={g}>{g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="cursor-pointer" onDoubleClick={() => toggleEditing(`rolls.${idx}.grade`)}>
                              {roll.grade || "-"}
                            </div>
                          )}
                        </td>

                        {/* Description */}
                        <td className="p-2 border">
                          {editingMap[`rolls.${idx}.rollDescription`] ? (
                            <Select
                              value={roll.rollDescription || ""}
                              onValueChange={(val) => updateEditingField(`rolls.${idx}.rollDescription`, val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select description" />
                              </SelectTrigger>
                              <SelectContent>
                                {rollDescriptions.map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="cursor-pointer" onDoubleClick={() => toggleEditing(`rolls.${idx}.rollDescription`)}>
                              {roll.rollDescription || "-"}
                            </div>
                          )}
                        </td>

                        {/* Dimensions */}
                        <td className="p-2 border">
                          {editingMap[`rolls.${idx}.dimensions`] ? (
                            <Input
                              value={roll.dimensions || ""}
                              onChange={(e) => updateEditingField(`rolls.${idx}.dimensions`, e.target.value)}
                              onBlur={() => toggleEditing(`rolls.${idx}.dimensions`)}
                              autoFocus
                            />
                          ) : (
                            <div className="cursor-pointer" onDoubleClick={() => toggleEditing(`rolls.${idx}.dimensions`)}>
                              {roll.dimensions || "-"}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-2 border">
                          {editingMap[`rolls.${idx}.status`] ? (
                            <Select
                              value={roll.status || "Pending"}
                              onValueChange={(val) => updateEditingField(`rolls.${idx}.status`, val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="cursor-pointer" onDoubleClick={() => toggleEditing(`rolls.${idx}.status`)}>
                              <StatusBadge status={roll.status} />
                            </div>
                          )}
                        </td>

                        {/* Machining */}
                        <td className="p-2 border">
                          {editingMap[`rolls.${idx}.machining`] ? (
                            <Input
                              value={roll.machining || ""}
                              onChange={(e) => updateEditingField(`rolls.${idx}.machining`, e.target.value)}
                              onBlur={() => toggleEditing(`rolls.${idx}.machining`)}
                              autoFocus
                            />
                          ) : (
                            <div className="cursor-pointer" onDoubleClick={() => toggleEditing(`rolls.${idx}.machining`)}>
                              {roll.machining || "-"}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingOrder(null); setEditingMap({}); }}>Cancel</Button>
                <Button onClick={saveInlineEdits}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
