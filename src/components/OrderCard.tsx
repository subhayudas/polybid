import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order } from '@/hooks/useOrders';
import { useOrderBids } from '@/hooks/useBids';
import { Clock, Package, DollarSign, AlertCircle } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onPlaceBid: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails, onPlaceBid }) => {
  const { data: bids } = useOrderBids(order.id);
  const lowestBid = bids && bids.length > 0 ? Math.min(...bids.map(b => b.bid_amount)) : null;
  const bidCount = bids?.length || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.order_number}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Package className="h-4 w-4" />
              {order.file_name}
            </CardDescription>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
            {order.priority.toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Material:</span>
            <p className="font-medium">{order.material}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Quantity:</span>
            <p className="font-medium">{order.quantity}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Budget:</span>
            <p className="font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {order.price ? `$${order.price.toFixed(2)}` : 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Delivery:</span>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {order.estimated_delivery ? formatDate(order.estimated_delivery) : 'Flexible'}
            </p>
          </div>
        </div>

        {order.notes && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              {order.notes}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {bidCount > 0 ? (
              <span>
                {bidCount} bid{bidCount !== 1 ? 's' : ''} 
                {lowestBid && ` • Lowest: $${lowestBid.toFixed(2)}`}
              </span>
            ) : (
              <span>No bids yet</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
              View Details
            </Button>
            <Button size="sm" onClick={() => onPlaceBid(order)}>
              Place Bid
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
