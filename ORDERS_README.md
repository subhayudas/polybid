# Polybid Orders System

Complete order management system for manufacturing marketplace with bidding capabilities.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Files Overview](#files-overview)
3. [Database Schema](#database-schema)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Step 1: Apply Database Migrations

Choose one of these methods:

**Method A: All-in-one script (Recommended)**
```sql
-- In Supabase SQL Editor, run:
apply_all_orders_migrations.sql
```

**Method B: Individual migrations**
```bash
# If using Supabase CLI
npx supabase db push

# Or run each migration file in order in SQL Editor:
# 1. supabase/migrations/20251109000000_create_orders_table.sql
# 2. supabase/migrations/20251109000001_fix_orders_policies.sql
# 3. supabase/migrations/20251109000002_complete_orders_setup.sql
```

### Step 2: Verify Setup

```sql
-- In Supabase SQL Editor, run:
TEST_ORDER_SETUP.sql
```

This will verify:
- ✅ Tables created
- ✅ Indexes in place
- ✅ Constraints added
- ✅ Triggers active
- ✅ RLS policies applied

### Step 3: Create Test Order

```sql
-- Get your user ID
SELECT auth.uid();

-- Create a test order (replace YOUR_USER_ID)
INSERT INTO public.orders (
  user_id, file_name, material, quantity, price
) VALUES (
  'YOUR_USER_ID', 'test-part.stl', 'PLA', 5, 49.99
);
```

### Step 4: Verify in Frontend

Navigate to `/orders` in your app. You should see your test order!

## 📁 Files Overview

### Documentation
- **`ORDERS_README.md`** (this file) - Overview and quick start
- **`ORDERS_SETUP_COMPLETE.md`** - Comprehensive technical documentation
- **`ORDERS_QUICK_START.md`** - Developer quick reference guide

### Database Scripts
- **`apply_all_orders_migrations.sql`** - One-click migration application
- **`TEST_ORDER_SETUP.sql`** - Verification and testing script
- **`CREATE_ORDERS_TABLE.sql`** - Original table creation script (legacy)

### Migrations (use these for version control)
- **`supabase/migrations/20251109000000_create_orders_table.sql`**
- **`supabase/migrations/20251109000001_fix_orders_policies.sql`**
- **`supabase/migrations/20251109000002_complete_orders_setup.sql`** ✨ NEW

### Frontend Code
- **`src/types/database.ts`** - TypeScript type definitions
- **`src/lib/orderUtils.ts`** - Order utility functions
- **`src/pages/OrdersPage.tsx`** - Order display component

## 🗄️ Database Schema

### Core Tables

#### `orders` table
Main table storing all order information with 68 columns including:
- Core fields (id, order_number, user_id, etc.)
- Manufacturing specs (material, quantity, color, etc.)
- Advanced options (tolerances, finishes, etc.)
- Tracking (status, shipping, delivery)
- Compliance (ITAR, NDA)

#### `order_status_history` table
Audit log tracking all status changes with:
- Previous and new status
- Who made the change
- When it happened
- Optional notes

### Enums

```typescript
order_status: 'pending' | 'confirmed' | 'in_production' | 'completed' 
            | 'shipped' | 'delivered' | 'cancelled' | 'on_hold'

order_priority: 'urgent' | 'high' | 'normal' | 'low'
```

### Key Constraints

- Order number is unique (format: `PO-YYYYMMDD-#####`)
- Infill percentage: 0-100%
- Assembly type: 'no_assembly', 'assembly_test', 'ship_in_assembly'
- Tolerance: 'standard', 'tighter'
- Design units: 'mm', 'inch', 'cm'
- Appearance: 'standard', 'premium'

### RLS Policies

| Policy | Who | Action | Description |
|--------|-----|--------|-------------|
| Customers view own | Customer | SELECT | View orders they created |
| Customers create | Customer | INSERT | Create new orders |
| Customers update own | Customer | UPDATE | Modify their orders |
| Vendors view assigned | Vendor | SELECT | View assigned orders |
| Vendors update assigned | Vendor | UPDATE | Update assigned orders |
| All authenticated view | Any user | SELECT | **Marketplace feature** - see all orders for bidding |
| Service role access | Service | ALL | System operations |

**Important**: The "All authenticated view" policy enables the marketplace - all logged-in users can see all orders to enable bidding.

## 💻 Frontend Integration

### Import Types

```typescript
import type { Order, OrderStatus, OrderPriority, Bid } from '@/types/database';
```

### Basic Operations

```typescript
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  fetchOrderBids,
  placeBid
} from '@/lib/orderUtils';

// Fetch all orders
const orders = await fetchOrders();

// Create order
const order = await createOrder({
  file_name: 'part.stl',
  material: 'PLA',
  quantity: 10
});

// Update status
await updateOrderStatus(orderId, 'in_production', 'Started work');

// Get bids
const bids = await fetchOrderBids(orderId);

// Place bid
await placeBid(orderId, 149.99, 7, 'We can deliver high quality');
```

### React Component Example

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/orderUtils';

function OrdersList() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {orders?.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

See `src/pages/OrdersPage.tsx` for full implementation example.

## 🧪 Testing

### 1. Test Database Setup

```sql
-- Run in Supabase SQL Editor
\i TEST_ORDER_SETUP.sql
```

Checks:
- Table structure
- Indexes
- Constraints
- Triggers
- Functions
- RLS policies

### 2. Test Order Creation

```typescript
// In browser console or test file
import { createOrder } from '@/lib/orderUtils';

const testOrder = await createOrder({
  file_name: 'test.stl',
  material: 'PLA',
  quantity: 1,
  notes: 'Test order'
});

console.log('Created order:', testOrder.order_number);
```

### 3. Test Order Fetching

```typescript
import { fetchOrders } from '@/lib/orderUtils';

const orders = await fetchOrders();
console.log(`Found ${orders.length} orders`);
```

### 4. Test RLS Policies

```sql
-- As authenticated user, should succeed
SELECT * FROM orders;

-- Try to insert order for different user, should fail
INSERT INTO orders (user_id, file_name, material, quantity)
VALUES ('different-user-id', 'test.stl', 'PLA', 1);
```

## 🔧 Troubleshooting

### Problem: Can't see any orders

**Solutions:**
1. Check you're logged in: `await supabase.auth.getSession()`
2. Verify RLS policies applied: Run `TEST_ORDER_SETUP.sql` section 8
3. Create a test order: See Quick Start Step 3
4. Check browser console for errors

### Problem: "Permission denied for table orders"

**Solutions:**
1. Verify migrations ran: Check Supabase Dashboard > Database > Migrations
2. Check RLS is enabled: Run `TEST_ORDER_SETUP.sql` section 7
3. Verify you're authenticated
4. Try re-applying policies: Run migration `20251109000001`

### Problem: Order number not auto-generating

**Solutions:**
1. Check trigger exists: Run `TEST_ORDER_SETUP.sql` section 5
2. Verify function exists: Check `set_order_number` function
3. Verify sequence exists: Check `order_number_seq`

### Problem: Can't update order status

**Solutions:**
1. Verify you own the order OR are assigned to it
2. Check status is valid enum value
3. Verify RLS policies allow update
4. Check for trigger errors in Supabase logs

### Problem: Bids not showing

**Solutions:**
1. Verify `bids` table exists
2. Check `vendor_profiles` table exists (for company names)
3. Verify RLS policies on bids table
4. Check browser console for fetch errors

### Problem: Foreign key violations

**Possible causes:**
- Referenced tables don't exist (materials, surface_finishes, etc.)
- Invalid UUIDs in foreign key fields
- Referenced records were deleted

**Solutions:**
- Make foreign key fields nullable (they are by default)
- Ensure referenced tables exist before assigning IDs
- Use NULL for optional foreign keys

## 📊 Order Status Flow

```
Customer Creates Order
         ↓
    [pending] ← Initial status
         ↓
    [confirmed] ← Vendor accepts
         ↓
  [in_production] ← Manufacturing
         ↓
    [completed] ← Finished
         ↓
    [shipped] ← In transit
         ↓
   [delivered] ← Customer received
   
Side paths:
[on_hold] ← Temporary pause
[cancelled] ← Terminated
```

## 🎯 Common Use Cases

### 1. Customer Places Order

```typescript
const order = await createOrder({
  file_name: 'custom-part.stl',
  material: 'ABS',
  quantity: 25,
  color: 'Black',
  infill_percentage: 30,
  notes: 'Need by end of month'
});
```

### 2. Vendor Views Available Orders

```typescript
// All authenticated users can view all orders (marketplace)
const orders = await fetchOrders();
const availableOrders = orders.filter(o => 
  o.status === 'pending' && !o.assigned_to
);
```

### 3. Vendor Places Bid

```typescript
await placeBid(
  orderId,
  199.99,  // price
  5,       // days
  'High quality finish guaranteed'
);
```

### 4. Vendor Updates Assigned Order

```typescript
await updateOrderStatus(
  orderId,
  'in_production',
  'Started manufacturing process'
);
```

### 5. Track Order History

```typescript
const history = await fetchOrderStatusHistory(orderId);
history.forEach(change => {
  console.log(
    `${change.previous_status} → ${change.new_status} at ${change.changed_at}`
  );
});
```

## 📈 Performance Tips

1. **Use indexes**: All foreign keys and commonly queried fields are indexed
2. **Limit results**: Add `.limit()` to queries fetching many orders
3. **Use React Query**: Caching reduces database calls
4. **Paginate**: For large result sets, implement pagination
5. **Optimize selects**: Only fetch columns you need

Example optimized query:
```typescript
const { data } = await supabase
  .from('orders')
  .select('id, order_number, status, created_at')
  .eq('status', 'pending')
  .order('created_at', { ascending: false })
  .limit(50);
```

## 🔐 Security Considerations

1. **RLS is always enabled** - No order can be accessed without proper permissions
2. **User ID validation** - Users can only create orders for themselves
3. **Vendor assignment** - Only assigned vendors can update orders
4. **Audit trail** - All status changes are logged
5. **Service role** - System operations use service role, never exposed to client

## 🚀 Next Steps

1. ✅ Complete setup (follow Quick Start)
2. 📖 Read ORDERS_QUICK_START.md for API reference
3. 🔍 Study OrdersPage.tsx for implementation examples
4. 🛠️ Build custom features using orderUtils.ts
5. 📊 Add analytics and reporting

## 📚 Additional Resources

- **Full Documentation**: `ORDERS_SETUP_COMPLETE.md`
- **Quick Reference**: `ORDERS_QUICK_START.md`
- **Type Definitions**: `src/types/database.ts`
- **Utilities**: `src/lib/orderUtils.ts`
- **Example Component**: `src/pages/OrdersPage.tsx`
- **Test Script**: `TEST_ORDER_SETUP.sql`

## 🤝 Support

If you encounter issues:

1. Check this README's troubleshooting section
2. Run `TEST_ORDER_SETUP.sql` to verify setup
3. Check Supabase logs in Dashboard
4. Review browser console for client errors
5. Verify authentication status

## ✨ Features

- ✅ Complete order lifecycle management
- ✅ Real-time bidding system
- ✅ Status change auditing
- ✅ Marketplace visibility
- ✅ Role-based access control
- ✅ Auto-generated order numbers
- ✅ Comprehensive material specifications
- ✅ Manufacturing process tracking
- ✅ Shipping and fulfillment
- ✅ Compliance tracking (ITAR, NDA)
- ✅ Type-safe TypeScript interfaces
- ✅ React Query integration
- ✅ Responsive UI components

## 📝 License

Part of the Polybid project.

---

**Version**: 1.0.0  
**Last Updated**: November 9, 2025  
**Status**: ✅ Production Ready



