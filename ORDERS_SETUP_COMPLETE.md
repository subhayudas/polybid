# Orders System - Complete Setup Documentation

## Overview
This document describes the complete setup for the orders system in Polybid, aligned with the exact database schema requirements.

## Database Schema

### Orders Table Structure

The `orders` table includes all fields required for manufacturing order management:

#### Core Order Fields
- `id` (UUID): Primary key, auto-generated
- `order_number` (TEXT): Unique, auto-generated (format: PO-YYYYMMDD-#####)
- `user_id` (UUID): Foreign key to auth.users, required
- `file_name` (TEXT): Required
- `material` (TEXT): Required
- `quantity` (INTEGER): Required, default 1
- `price` (NUMERIC(10,2)): Optional
- `notes` (TEXT): Customer notes
- `status` (order_status enum): Default 'pending'
- `priority` (order_priority enum): Default 'normal'
- `estimated_delivery` (DATE): Optional
- `created_at`, `updated_at` (TIMESTAMPTZ): Auto-managed

#### Manufacturing Specifications
- `color` (TEXT)
- `infill_percentage` (INTEGER): 0-100, default 20
- `layer_height` (NUMERIC(4,3)): Default 0.2
- `support_required` (BOOLEAN): Default false
- `post_processing` (TEXT[]): Array of post-processing steps
- `estimated_weight` (NUMERIC(8,3)): In grams
- `estimated_volume` (NUMERIC(10,3)): In cm³
- `estimated_print_time` (INTEGER): In minutes
- `production_notes` (TEXT)

#### Advanced Manufacturing Options
- `manufacturing_process_id` (UUID): FK to manufacturing_processes
- `sub_process` (TEXT)
- `design_units` (TEXT): 'mm', 'inch', or 'cm', default 'mm'
- `material_type_id` (UUID): FK to material_types
- `material_variant_id` (UUID): FK to material_variants
- `selected_color` (TEXT)
- `surface_finish_id` (UUID): FK to surface_finishes
- `technical_drawing_path` (TEXT)

#### Threading & Inserts
- `has_threads` (BOOLEAN): Default false
- `threads_description` (TEXT)
- `has_inserts` (BOOLEAN): Default false
- `inserts_description` (TEXT)

#### Tolerances & Quality
- `tolerance_type` (TEXT): 'standard' or 'tighter', default 'standard'
- `tolerance_description` (TEXT)
- `surface_roughness` (TEXT)
- `part_marking_id` (UUID): FK to part_marking_types

#### Assembly & Finishing
- `has_assembly` (BOOLEAN): Default false
- `assembly_type` (TEXT): 'no_assembly', 'assembly_test', or 'ship_in_assembly'
- `finished_appearance` (TEXT): 'standard' or 'premium', default 'standard'
- `inspection_type_id` (UUID): FK to inspection_types

#### Compliance
- `itar_compliance` (BOOLEAN): Default false
- `nda_acknowledged` (BOOLEAN): Default false

#### Shipping & Fulfillment
- `shipping_address` (JSONB)
- `billing_address` (JSONB)
- `tracking_number` (TEXT)
- `shipped_at` (TIMESTAMPTZ)
- `delivered_at` (TIMESTAMPTZ)
- `cancelled_at` (TIMESTAMPTZ)
- `cancelled_reason` (TEXT)
- `assigned_to` (UUID): FK to auth.users (vendor)

### Enums

#### order_status
- `pending`: Initial state
- `confirmed`: Order accepted
- `in_production`: Manufacturing in progress
- `completed`: Manufacturing complete
- `shipped`: In transit
- `delivered`: Delivered to customer
- `cancelled`: Order cancelled
- `on_hold`: Temporarily paused

#### order_priority
- `urgent`: Highest priority
- `high`: High priority
- `normal`: Standard priority (default)
- `low`: Low priority

### Constraints

1. **orders_infill_percentage_check**: infill_percentage >= 0 AND <= 100
2. **orders_assembly_type_check**: assembly_type IN ('no_assembly', 'assembly_test', 'ship_in_assembly')
3. **orders_finished_appearance_check**: finished_appearance IN ('standard', 'premium')
4. **orders_tolerance_type_check**: tolerance_type IN ('standard', 'tighter')
5. **orders_design_units_check**: design_units IN ('mm', 'inch', 'cm')

### Indexes

For optimal query performance:
- `idx_orders_user_id` on user_id
- `idx_orders_status` on status
- `idx_orders_manufacturing_process` on manufacturing_process_id
- `idx_orders_material_variant` on material_variant_id
- `idx_orders_material_type` on material_type_id
- `idx_orders_surface_finish` on surface_finish_id
- `idx_orders_part_marking` on part_marking_id
- `idx_orders_inspection_type` on inspection_type_id
- `idx_orders_created_at` on created_at

### Triggers

1. **set_order_number_trigger**: Auto-generates order numbers before insert
2. **update_orders_updated_at**: Updates updated_at timestamp before update
3. **log_order_status_change_trigger**: Logs status changes to order_status_history

## Row Level Security (RLS) Policies

### Current Policies

1. **"Users can view their own orders"** (SELECT)
   - Users can view orders where they are the customer (auth.uid() = user_id)

2. **"Users can insert their own orders"** (INSERT)
   - Users can create orders for themselves

3. **"Users can update their own orders"** (UPDATE)
   - Users can update their own orders

4. **"Authenticated users can view all orders"** (SELECT)
   - All authenticated users can view all orders (marketplace feature)
   - Allows vendors to see available orders for bidding

5. **"Assigned vendors can view orders"** (SELECT)
   - Vendors can view orders assigned to them

6. **"Assigned vendors can update orders"** (UPDATE)
   - Vendors can update orders assigned to them (status, tracking, etc.)

7. **"Service role full access"** (ALL)
   - Service role has unrestricted access for system operations

### Policy Implications

- **Customers**: Can create, view, and update their own orders
- **Vendors**: Can view all orders (for bidding) and update orders assigned to them
- **Marketplace**: All authenticated users can see all orders, enabling the bidding marketplace

## Frontend Implementation

### TypeScript Types

Located in `/src/types/database.ts`:
- `Order`: Complete order interface matching database schema
- `OrderStatus`: Type-safe status enum
- `OrderPriority`: Type-safe priority enum
- `AssemblyType`, `FinishedAppearance`, `ToleranceType`, `DesignUnits`: Type-safe enums
- `Bid`: Bid interface for vendor bidding system

### OrdersPage Component

Located in `/src/pages/OrdersPage.tsx`:

#### Features:
1. **Authentication Check**: Verifies user is authenticated before fetching
2. **Real-time Data**: Uses React Query for caching and auto-refresh
3. **Error Handling**: Comprehensive error messages and loading states
4. **Order Display**: Shows all order fields with proper formatting
5. **Bidding System**: Integrated bid viewing and placement
6. **Responsive Design**: Mobile-friendly card layout

#### Key Functions:

```typescript
const fetchOrders = async (): Promise<Order[]>
```
- Fetches all orders based on RLS policies
- Includes authentication validation
- Comprehensive error handling
- Returns typed Order array

```typescript
const fetchOrderBids = async (orderId: string)
```
- Fetches all bids for a specific order
- Includes vendor company name via join

### Data Fetching Flow

1. User navigates to `/orders` page
2. `useAuth()` hook checks authentication status
3. Once authenticated, `useQuery` triggers `fetchOrders()`
4. `fetchOrders()` validates session and fetches from Supabase
5. RLS policies determine which orders are returned
6. Orders displayed with formatted data
7. Each order card can fetch bids independently

## Migrations

### Migration Files (in order):

1. **20251109000000_create_orders_table.sql**
   - Creates orders table, enums, sequences
   - Creates order_status_history table
   - Defines functions for order number generation
   - Creates basic indexes and triggers
   - Sets up initial RLS policies

2. **20251109000001_fix_orders_policies.sql**
   - Removes recursive admin policy
   - Adds marketplace-friendly policies
   - Enables authenticated users to view all orders
   - Adds vendor assignment policies

3. **20251109000002_complete_orders_setup.sql** (NEW)
   - Adds all missing constraints (assembly_type, tolerance_type, etc.)
   - Adds all foreign key constraints conditionally
   - Creates all required indexes
   - Adds log_order_status_change function and trigger
   - Ensures all triggers are in place

## Testing Order Fetching

### Prerequisites
1. User must be authenticated (signed in)
2. Orders table must exist with proper schema
3. RLS policies must be applied
4. User must have at least one of:
   - Orders they created (user_id matches)
   - Orders assigned to them (assigned_to matches)
   - Valid authentication (marketplace access)

### Test Scenarios

#### 1. Customer Views Own Orders
```typescript
// Customer creates order
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: auth.uid(),
    file_name: 'part123.stl',
    material: 'PLA',
    quantity: 5
  })
  .select()
  .single();

// Customer fetches orders
const { data: orders } = await supabase
  .from('orders')
  .select('*');
// Should return their own orders
```

#### 2. Vendor Views All Orders (Marketplace)
```typescript
// Any authenticated vendor
const { data: orders } = await supabase
  .from('orders')
  .select('*');
// Should return all orders (for bidding purposes)
```

#### 3. Vendor Updates Assigned Order
```typescript
// Vendor updates order status
const { data } = await supabase
  .from('orders')
  .update({ 
    status: 'in_production',
    production_notes: 'Started manufacturing'
  })
  .eq('id', orderId)
  .eq('assigned_to', auth.uid());
// Should succeed if vendor is assigned
```

## Common Issues & Solutions

### Issue: "You must be authenticated to view orders"
**Solution**: Ensure user is signed in before accessing OrdersPage. The RequireAuth wrapper should handle this.

### Issue: "Failed to fetch orders: permission denied"
**Solution**: 
1. Verify RLS policies are applied: Run migration 20251109000001_fix_orders_policies.sql
2. Check user has valid session: `supabase.auth.getSession()`
3. Verify table exists: Check in Supabase Dashboard

### Issue: Orders return empty array
**Possible causes**:
1. No orders in database - Create test orders
2. RLS filtering out orders - Check policies
3. User not authenticated - Verify session

**Solution**: Insert test orders:
```sql
INSERT INTO public.orders (
  user_id, file_name, material, quantity
) VALUES (
  auth.uid(), 'test-part.stl', 'PLA', 1
);
```

### Issue: Foreign key constraint violations
**Solution**: Referenced tables may not exist yet. The migration handles this gracefully by checking table existence before adding constraints.

## Best Practices

1. **Always use typed imports** from `@/types/database`
2. **Handle loading states** for better UX
3. **Display meaningful errors** to users
4. **Use React Query** for caching and optimistic updates
5. **Validate data** before insert/update operations
6. **Log actions** for debugging and audit trails
7. **Test RLS policies** thoroughly before production

## Future Enhancements

1. **Order Search & Filtering**: Add search by order number, status, material
2. **Bulk Operations**: Enable bulk status updates
3. **File Upload**: Integrate STL/CAD file uploads
4. **Real-time Updates**: Use Supabase Realtime for live order updates
5. **Analytics Dashboard**: Track order metrics and trends
6. **Email Notifications**: Notify users of order status changes
7. **Quote System**: Generate quotes before order creation
8. **Role-based Views**: Different views for customers vs vendors
9. **Advanced Filtering**: Filter by manufacturing process, material, etc.
10. **Export Functionality**: Export orders to CSV/PDF

## Maintenance

### Regular Tasks
- Monitor order_status_history table size
- Review and optimize indexes based on query patterns
- Archive old completed/cancelled orders
- Update RLS policies as business rules change

### Database Maintenance
```sql
-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('public.orders'));

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public' AND tablename = 'orders'
ORDER BY idx_scan;

-- Archive old orders (example: older than 2 years)
CREATE TABLE IF NOT EXISTS public.orders_archive (LIKE public.orders INCLUDING ALL);
INSERT INTO public.orders_archive
SELECT * FROM public.orders
WHERE created_at < NOW() - INTERVAL '2 years'
  AND status IN ('delivered', 'cancelled');
```

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase logs in Dashboard
3. Check browser console for client-side errors
4. Verify migration status
5. Test RLS policies in SQL Editor

## Version History

- **v1.0** (2025-11-09): Initial complete setup with full schema support
- Added comprehensive RLS policies
- Implemented marketplace features
- Created typed frontend components


