# Orders System - Quick Start Guide

## Setup (One-time)

### 1. Apply Database Migrations

Run these migrations in order in your Supabase SQL Editor:

```bash
# Navigate to your Supabase project Dashboard > SQL Editor
```

Then execute these migration files in order:
1. `supabase/migrations/20251109000000_create_orders_table.sql`
2. `supabase/migrations/20251109000001_fix_orders_policies.sql`
3. `supabase/migrations/20251109000002_complete_orders_setup.sql` ✨ NEW

Or if using Supabase CLI:
```bash
npx supabase db push
```

### 2. Verify Setup

Run the test script to verify everything is configured correctly:
```bash
# In Supabase SQL Editor, run:
# TEST_ORDER_SETUP.sql
```

### 3. Test with Sample Data (Optional)

Insert a test order:
```sql
-- First, get your user ID
SELECT auth.uid();

-- Then insert a test order (replace YOUR_USER_ID)
INSERT INTO public.orders (
  user_id,
  file_name,
  material,
  quantity,
  price,
  notes
) VALUES (
  'YOUR_USER_ID',
  'test-part.stl',
  'PLA',
  5,
  49.99,
  'This is a test order'
);
```

## Usage in Frontend

### Import Types

```typescript
import type { Order, OrderStatus, OrderPriority, Bid } from '@/types/database';
```

### Fetch Orders

#### Option 1: Use the utility functions
```typescript
import { fetchOrders, fetchOrderById } from '@/lib/orderUtils';

// Fetch all orders
const orders = await fetchOrders();

// Fetch single order
const order = await fetchOrderById('order-uuid-here');
```

#### Option 2: Direct Supabase query
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .order('created_at', { ascending: false });
```

### Create Order

```typescript
import { createOrder } from '@/lib/orderUtils';

const newOrder = await createOrder({
  file_name: 'part123.stl',
  material: 'PLA',
  quantity: 10,
  price: 99.99,
  notes: 'Customer notes here',
  color: 'Black',
  infill_percentage: 20,
  layer_height: 0.2,
});
```

### Update Order Status

```typescript
import { updateOrderStatus } from '@/lib/orderUtils';

await updateOrderStatus(
  orderId,
  'in_production',
  'Started manufacturing process'
);
```

### Fetch Order Bids

```typescript
import { fetchOrderBids } from '@/lib/orderUtils';

const bids = await fetchOrderBids(orderId);
```

### Place a Bid

```typescript
import { placeBid } from '@/lib/orderUtils';

await placeBid(
  orderId,
  149.99,  // bid amount
  7,       // delivery days
  'We can deliver high-quality parts',  // optional notes
  '2025-12-31T23:59:59Z'  // optional expiration
);
```

### Get Order Statistics

```typescript
import { getOrderStatistics } from '@/lib/orderUtils';

const stats = await getOrderStatistics();
console.log(stats);
// {
//   total: 150,
//   byStatus: { pending: 45, confirmed: 30, ... },
//   byPriority: { urgent: 10, high: 25, ... },
//   recent: 12  // last 7 days
// }
```

## Access Control (RLS Policies)

### Who Can See What?

| User Type | View All Orders | View Own Orders | Update Own Orders | Update Assigned Orders |
|-----------|----------------|-----------------|-------------------|----------------------|
| Customer | ✅ Yes (marketplace) | ✅ Yes | ✅ Yes | ❌ No |
| Vendor | ✅ Yes (marketplace) | ✅ Yes | ✅ Yes | ✅ Yes |
| Unauthenticated | ❌ No | ❌ No | ❌ No | ❌ No |

### Policy Details

1. **Authenticated users can view all orders** - Enables marketplace/bidding
2. **Users can view their own orders** - Customers see their orders
3. **Users can insert their own orders** - Create orders
4. **Users can update their own orders** - Modify own orders
5. **Assigned vendors can view orders** - Vendors see assigned work
6. **Assigned vendors can update orders** - Vendors update status/tracking

## Order Status Flow

```
pending → confirmed → in_production → completed → shipped → delivered
                                                           ↘ cancelled
                                                 ↘ on_hold
```

### Status Meanings

- **pending**: Initial state, awaiting confirmation
- **confirmed**: Order accepted, ready to start
- **in_production**: Currently being manufactured
- **completed**: Manufacturing finished
- **shipped**: In transit to customer
- **delivered**: Received by customer
- **cancelled**: Order cancelled
- **on_hold**: Temporarily paused

## Order Priority Levels

- **urgent**: Needs immediate attention (1-2 days)
- **high**: Important (3-5 days)
- **normal**: Standard timeline (1-2 weeks)
- **low**: Can wait (2-4 weeks)

## Common Operations

### Filter Orders by Status

```typescript
import { fetchOrdersByStatus } from '@/lib/orderUtils';

const inProductionOrders = await fetchOrdersByStatus('in_production');
```

### Filter by Priority

```typescript
import { fetchOrdersByPriority } from '@/lib/orderUtils';

const urgentOrders = await fetchOrdersByPriority('urgent');
```

### Assign Order to Vendor

```typescript
import { assignOrderToVendor } from '@/lib/orderUtils';

await assignOrderToVendor(orderId, vendorUserId);
// This also sets status to 'confirmed'
```

### Cancel Order

```typescript
import { cancelOrder } from '@/lib/orderUtils';

await cancelOrder(orderId, 'Customer requested cancellation');
```

### View Order History

```typescript
import { fetchOrderStatusHistory } from '@/lib/orderUtils';

const history = await fetchOrderStatusHistory(orderId);
// Returns array of status changes with timestamps
```

## React Component Example

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/orderUtils';

function OrdersList() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {orders?.map(order => (
        <div key={order.id}>
          <h3>{order.order_number}</h3>
          <p>Status: {order.status}</p>
          <p>Material: {order.material}</p>
          <p>Quantity: {order.quantity}</p>
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Can't see any orders?

1. **Check authentication**: Make sure you're logged in
2. **Check RLS policies**: Run `TEST_ORDER_SETUP.sql` section 8
3. **Create test order**: Use SQL from section above
4. **Check browser console**: Look for error messages

### "Permission denied" error?

1. Verify you're authenticated: `supabase.auth.getSession()`
2. Check RLS policies are applied: See `TEST_ORDER_SETUP.sql`
3. Ensure migrations ran successfully

### Orders not updating?

1. Check if you own the order or are assigned to it
2. Verify update permissions in RLS policies
3. Check for constraint violations (e.g., invalid status)

### Can't place bids?

1. Ensure `bids` table exists
2. Check you're authenticated
3. Verify vendor_profiles table exists if using company names

## Database Schema Summary

### Required Fields
- `user_id` - Customer who created the order
- `file_name` - Name of the part file
- `material` - Material to use
- `quantity` - Number of parts (min: 1)

### Optional but Common Fields
- `price` - Total price
- `notes` - Customer notes
- `status` - Current status (default: pending)
- `priority` - Priority level (default: normal)
- `color` - Part color
- `infill_percentage` - Fill density (0-100%, default: 20%)
- `layer_height` - Layer height in mm (default: 0.2)

### Auto-Generated Fields
- `id` - UUID primary key
- `order_number` - Format: PO-YYYYMMDD-#####
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

## API Reference

All utility functions are in `/src/lib/orderUtils.ts`:

- `fetchOrders()` - Get all visible orders
- `fetchOrderById(id)` - Get single order
- `fetchUserOrders(userId)` - Get user's orders
- `fetchVendorOrders(vendorId)` - Get vendor's assigned orders
- `fetchOrdersByStatus(status)` - Filter by status
- `fetchOrdersByPriority(priority)` - Filter by priority
- `createOrder(data)` - Create new order
- `updateOrder(id, data)` - Update order
- `updateOrderStatus(id, status, notes?)` - Update status
- `assignOrderToVendor(orderId, vendorId)` - Assign to vendor
- `fetchOrderBids(orderId)` - Get order bids
- `placeBid(orderId, amount, days, notes?, expires?)` - Place bid
- `fetchOrderStatusHistory(orderId)` - Get status history
- `cancelOrder(orderId, reason?)` - Cancel order
- `getOrderStatistics()` - Get order stats

## Next Steps

1. ✅ Apply migrations
2. ✅ Verify setup with test script
3. ✅ Create test orders
4. ✅ Test order fetching in your app
5. 🚀 Build your order management features!

## Support

- Full documentation: `ORDERS_SETUP_COMPLETE.md`
- Test script: `TEST_ORDER_SETUP.sql`
- Type definitions: `src/types/database.ts`
- Utility functions: `src/lib/orderUtils.ts`
- Example component: `src/pages/OrdersPage.tsx`



