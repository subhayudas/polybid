import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Order, Bid } from '@/types/database';
import {
  Package,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [bidNotes, setBidNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      fetchBidsForOrder(selectedOrder.id);
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBidsForOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('order_id', orderId)
        .order('bid_amount', { ascending: true });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setBids([]);
    }
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !user) return;

    try {
      setIsSubmittingBid(true);
      const { error } = await supabase.from('bids').insert({
        order_id: selectedOrder.id,
        vendor_id: user.id,
        bid_amount: parseFloat(bidAmount),
        estimated_delivery_days: parseInt(deliveryDays),
        notes: bidNotes || null,
        status: 'active',
      });

      if (error) throw error;

      // Reset form
      setBidAmount('');
      setDeliveryDays('');
      setBidNotes('');

      // Refresh bids
      fetchBidsForOrder(selectedOrder.id);
      alert('Bid submitted successfully!');
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Failed to submit bid. Please try again.');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_production':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Orders & Bidding</h1>
          <p className="mt-2 text-lg text-slate-600">
            Browse available orders and submit your bids
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No orders yet</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Orders will appear here once customers place them.
                </p>
              </Card>
            ) : (
              orders.map((order) => (
                <Card
                  key={order.id}
                  className={`cursor-pointer p-6 transition-all hover:shadow-lg ${
                    selectedOrder?.id === order.id
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {order.order_number || 'N/A'}
                        </h3>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityColor(
                            order.priority,
                          )}`}
                        >
                          {order.priority}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">File:</span> {order.file_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">Material:</span> {order.material}
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">Quantity:</span> {order.quantity}
                        </div>
                        {order.price && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">Price:</span> ${order.price}
                          </div>
                        )}
                        {order.created_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">Posted:</span>{' '}
                            {formatDistanceToNow(new Date(order.created_at), {
                              addSuffix: true,
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Order Details & Bidding Panel */}
          <div className="space-y-4">
            {selectedOrder ? (
              <>
                {/* Order Details Card */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Order Details</h3>
                  <Separator className="my-4" />
                  <div className="space-y-3 text-sm">
                    {selectedOrder.color && (
                      <div>
                        <span className="font-medium text-slate-700">Color:</span>{' '}
                        <span className="text-slate-600">{selectedOrder.color}</span>
                      </div>
                    )}
                    {selectedOrder.infill_percentage !== null && (
                      <div>
                        <span className="font-medium text-slate-700">Infill:</span>{' '}
                        <span className="text-slate-600">{selectedOrder.infill_percentage}%</span>
                      </div>
                    )}
                    {selectedOrder.layer_height !== null && (
                      <div>
                        <span className="font-medium text-slate-700">Layer Height:</span>{' '}
                        <span className="text-slate-600">{selectedOrder.layer_height}mm</span>
                      </div>
                    )}
                    {selectedOrder.support_required !== null && (
                      <div>
                        <span className="font-medium text-slate-700">Support Required:</span>{' '}
                        <span className="text-slate-600">
                          {selectedOrder.support_required ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    {selectedOrder.estimated_delivery && (
                      <div>
                        <span className="font-medium text-slate-700">Estimated Delivery:</span>{' '}
                        <span className="text-slate-600">
                          {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div>
                        <span className="font-medium text-slate-700">Notes:</span>
                        <p className="mt-1 text-slate-600">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Submit Bid Card */}
                <Card className="p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    Submit Your Bid
                  </h3>
                  <Separator className="my-4" />
                  <form onSubmit={handleSubmitBid} className="space-y-4">
                    <div>
                      <Label htmlFor="bidAmount">Bid Amount ($)</Label>
                      <Input
                        id="bidAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter your bid amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryDays">Estimated Delivery (days)</Label>
                      <Input
                        id="deliveryDays"
                        type="number"
                        min="1"
                        placeholder="Enter delivery time in days"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bidNotes">Additional Notes (Optional)</Label>
                      <Input
                        id="bidNotes"
                        placeholder="Add any additional information"
                        value={bidNotes}
                        onChange={(e) => setBidNotes(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmittingBid}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmittingBid ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Bid'
                      )}
                    </Button>
                  </form>
                </Card>

                {/* Existing Bids Card */}
                <Card className="p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Current Bids ({bids.length})
                  </h3>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    {bids.length === 0 ? (
                      <p className="text-center text-sm text-slate-500">
                        No bids yet. Be the first to bid!
                      </p>
                    ) : (
                      bids.map((bid, index) => (
                        <div
                          key={bid.id}
                          className={`rounded-lg border p-4 ${
                            index === 0
                              ? 'border-emerald-200 bg-emerald-50/50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">
                                ${bid.bid_amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {bid.estimated_delivery_days} days delivery
                              </p>
                            </div>
                            {index === 0 && (
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                Lowest Bid
                              </span>
                            )}
                          </div>
                          {bid.notes && (
                            <p className="mt-2 text-sm text-slate-600">{bid.notes}</p>
                          )}
                          {bid.submitted_at && (
                            <p className="mt-2 text-xs text-slate-400">
                              {formatDistanceToNow(new Date(bid.submitted_at), {
                                addSuffix: true,
                              })}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-8 text-center">
                <Package className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Select an order
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Click on an order to view details and place your bid
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

