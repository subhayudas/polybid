import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateBid } from '@/hooks/useBids';
import { Order } from '@/hooks/useOrders';
import { toast } from 'sonner';
import { DollarSign, Calendar, FileText } from 'lucide-react';

interface BidFormProps {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export const BidForm: React.FC<BidFormProps> = ({ order, onClose, onSuccess }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [notes, setNotes] = useState('');
  const createBid = useCreateBid();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(bidAmount);
    const days = parseInt(deliveryDays);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (isNaN(days) || days <= 0) {
      toast.error('Please enter valid delivery days');
      return;
    }

    try {
      await createBid.mutateAsync({
        order_id: order.id,
        bid_amount: amount,
        estimated_delivery_days: days,
        notes: notes.trim() || undefined,
      });

      toast.success('Bid submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to submit bid. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Place Bid</CardTitle>
          <CardDescription>
            Submit your bid for order {order.order_number}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-muted/50 rounded-md">
            <h4 className="font-medium">{order.file_name}</h4>
            <p className="text-sm text-muted-foreground">
              {order.material} • Qty: {order.quantity}
            </p>
            {order.price && (
              <p className="text-sm text-muted-foreground">
                Customer budget: ${order.price.toFixed(2)}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bidAmount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Bid Amount (USD)
              </Label>
              <Input
                id="bidAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter your bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDays" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Estimated Delivery (Days)
              </Label>
              <Input
                id="deliveryDays"
                type="number"
                min="1"
                placeholder="Number of days to complete"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes (Optional)
              </Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Additional details about your bid, capabilities, or timeline..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createBid.isPending}
              >
                {createBid.isPending ? 'Submitting...' : 'Submit Bid'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
