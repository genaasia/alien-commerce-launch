import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Eye, Package, DollarSign, Calendar, User } from 'lucide-react';
import { api, Order, LineItem, OrderAddress } from '@/lib/api';

interface OrderWithDetails extends Order {
  line_items?: LineItem[];
  addresses?: OrderAddress[];
  customer_name?: string;
  item_count?: number;
}

export const OrdersManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      // Note: We'll need to add these methods to the API client
      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'PROCESSING': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'ON-HOLD': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'COMPLETED': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'REFUNDED': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'FAILED': return 'bg-red-600/20 text-red-800 border-red-600/30';
      case 'ARCHIVED': return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', orderId, 'to', newStatus);
      await api.updateOrderStatus(orderId, newStatus);
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
      loadOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Orders Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Orders Management</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Orders</span>
            </div>
            <p className="text-2xl font-bold mt-2">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatPrice(orders.reduce((sum, order) => sum + order.total_price, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Pending Orders</span>
            </div>
             <p className="text-2xl font-bold mt-2">
               {orders.filter(order => order.status === 'PENDING' || order.status === 'PROCESSING').length}
             </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-muted-foreground">Unique Customers</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {new Set(orders.map(order => order.customer_id)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by order ID or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {order.customer_name || 'Unknown Customer'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background">
                        <SelectItem value="PENDING">
                          <Badge className={getStatusColor('PENDING')}>PENDING</Badge>
                        </SelectItem>
                        <SelectItem value="PROCESSING">
                          <Badge className={getStatusColor('PROCESSING')}>PROCESSING</Badge>
                        </SelectItem>
                        <SelectItem value="ON-HOLD">
                          <Badge className={getStatusColor('ON-HOLD')}>ON-HOLD</Badge>
                        </SelectItem>
                        <SelectItem value="COMPLETED">
                          <Badge className={getStatusColor('COMPLETED')}>COMPLETED</Badge>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <Badge className={getStatusColor('CANCELLED')}>CANCELLED</Badge>
                        </SelectItem>
                        <SelectItem value="REFUNDED">
                          <Badge className={getStatusColor('REFUNDED')}>REFUNDED</Badge>
                        </SelectItem>
                        <SelectItem value="FAILED">
                          <Badge className={getStatusColor('FAILED')}>FAILED</Badge>
                        </SelectItem>
                        <SelectItem value="ARCHIVED">
                          <Badge className={getStatusColor('ARCHIVED')}>ARCHIVED</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{order.item_count || 0} items</TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(order.total_price)}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No orders found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};