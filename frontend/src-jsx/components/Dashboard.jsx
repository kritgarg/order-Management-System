import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, DollarSign, Calendar } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Dashboard = ({ orders }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const currentYear = new Date().getFullYear();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const stats = {
    total: orders.length,
    pending: orders.reduce((count, order) => 
      count + (order.rolls?.filter(r => r.status === "Pending").length || 0), 0),
    casting: orders.reduce((count, order) => 
      count + (order.rolls?.filter(r => r.status === "casting").length || 0), 0),
    annealing: orders.reduce((count, order) => 
      count + (order.rolls?.filter(r => r.status === "annealing").length || 0), 0),
    machining: orders.reduce((count, order) => 
      count + (order.rolls?.filter(r => r.status === "machining").length || 0), 0),
    bearingWobler: orders.reduce((count, order) => 
      count + (order.rolls?.filter(r => r.status === "bearing/wobler").length || 0), 0),
    dispached: orders.reduce((count, order) => 
      count + (order.rolls?.filter(r => r.status === "dispached").length || 0), 0),
    inProgress: orders.filter(order => 
      order.rolls && order.rolls.length > 0 && 
      order.rolls.some(roll => roll.status !== "dispached")
    ).length,
    completedOrders: orders.filter(order => 
      order.rolls && order.rolls.length > 0 && 
      order.rolls.every(roll => roll.status === "dispached")
    ).length,
    totalValue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
    paidValue: orders
      .filter((o) => o.status === "paid")
      .reduce((sum, order) => sum + order.totalPrice, 0),
  };

  const recentOrders = orders
    .sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    )
    .slice(0, 5);

  const ordersInSelectedMonth = orders.filter((order) => {
    const date = new Date(order.orderDate);
    return date.getMonth() === selectedMonth && 
           date.getFullYear() === currentYear;
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="end">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-full border-0">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersInSelectedMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {months[selectedMonth]} {currentYear}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Pending</span>
                <Badge variant="secondary">{stats.pending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Casting</span>
                <Badge variant="secondary">{stats.casting}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Annealing</span>
                <Badge variant="secondary">{stats.annealing}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Machining</span>
                <Badge variant="secondary">{stats.machining}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Bearing/Wobler</span>
                <Badge variant="secondary">{stats.bearingWobler}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Dispached</span>
                <Badge variant="secondary">{stats.dispached}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.companyName}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.rolls ? `${order.rolls.length} Rolls` : '0 Rolls'}
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-gray-500 text-center">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
