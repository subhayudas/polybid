# Orders System Setup Checklist

Use this checklist to track your setup progress.

## 📋 Database Setup

### Step 1: Apply Migrations
- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy contents of `apply_all_orders_migrations.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] ✅ See "Orders Setup Complete!" message

**Alternative**: Using Supabase CLI
- [ ] Open terminal in project directory
- [ ] Run `npx supabase db push`
- [ ] ✅ See success messages for all migrations

### Step 2: Verify Setup
- [ ] In SQL Editor, copy contents of `TEST_ORDER_SETUP.sql`
- [ ] Run the script
- [ ] Check results:
  - [ ] ✅ Orders table has 68 columns
  - [ ] ✅ 9 indexes exist
  - [ ] ✅ 9 constraints exist
  - [ ] ✅ 3 triggers exist
  - [ ] ✅ 7 RLS policies exist
  - [ ] ✅ 2 enums exist (order_status, order_priority)
  - [ ] ✅ order_status_history table exists

### Step 3: Create Test Data
- [ ] Get your user ID: Run `SELECT auth.uid();` (while logged in)
- [ ] Insert test order (replace YOUR_USER_ID):
```sql
INSERT INTO public.orders (
  user_id, file_name, material, quantity, price, notes
) VALUES (
  'YOUR_USER_ID', 'test-part.stl', 'PLA', 5, 49.99, 'Test order'
);
```
- [ ] ✅ Order inserted successfully
- [ ] Verify: Run `SELECT * FROM orders;`
- [ ] ✅ See your test order with auto-generated order_number

## 💻 Frontend Setup

### Step 4: Verify Type Definitions
- [ ] Open `src/types/database.ts`
- [ ] ✅ File exists with Order interface
- [ ] ✅ All type exports present

### Step 5: Verify Utility Functions
- [ ] Open `src/lib/orderUtils.ts`
- [ ] ✅ File exists with 15+ functions
- [ ] ✅ No linter errors

### Step 6: Test OrdersPage Component
- [ ] Start development server: `npm run dev`
- [ ] Navigate to `/orders` in browser
- [ ] Check browser console:
  - [ ] ✅ See "Fetching orders for user: [user-id]"
  - [ ] ✅ See "Successfully fetched X orders"
  - [ ] ✅ No error messages
- [ ] Check UI:
  - [ ] ✅ Orders page loads
  - [ ] ✅ See your test order
  - [ ] ✅ Order details displayed correctly
  - [ ] ✅ No loading errors

## 🧪 Functional Testing

### Step 7: Test Order Fetching
- [ ] In browser console, test:
```javascript
import { fetchOrders } from '@/lib/orderUtils';
const orders = await fetchOrders();
console.log(orders);
```
- [ ] ✅ Returns array of orders
- [ ] ✅ Each order has all expected fields

### Step 8: Test Order Creation
- [ ] Try creating order through UI or console:
```javascript
import { createOrder } from '@/lib/orderUtils';
const order = await createOrder({
  file_name: 'new-part.stl',
  material: 'ABS',
  quantity: 3
});
console.log('Created:', order.order_number);
```
- [ ] ✅ Order created successfully
- [ ] ✅ Order number auto-generated
- [ ] ✅ Timestamps populated

### Step 9: Test Status Update
- [ ] Update an order status:
```javascript
import { updateOrderStatus } from '@/lib/orderUtils';
await updateOrderStatus('order-id', 'confirmed', 'Order confirmed!');
```
- [ ] ✅ Status updated successfully
- [ ] ✅ updated_at timestamp changed
- [ ] Verify in SQL: `SELECT * FROM order_status_history;`
- [ ] ✅ Status change logged in history

### Step 10: Test RLS Policies
- [ ] Sign in as different user
- [ ] Navigate to `/orders`
- [ ] ✅ Can see all orders (marketplace feature)
- [ ] Try to update someone else's order
- [ ] ✅ Update fails (permission denied) - this is correct!

## 📚 Documentation Review

### Step 11: Read Documentation
- [ ] Read `ORDERS_README.md` (5-10 min)
- [ ] Skim `ORDERS_QUICK_START.md` (2-3 min)
- [ ] Bookmark `ORDERS_INDEX.md` for reference

## 🎯 Final Checks

### Step 12: Complete System Verification
- [ ] ✅ Database tables created
- [ ] ✅ All migrations applied
- [ ] ✅ RLS policies working
- [ ] ✅ Test data inserted
- [ ] ✅ Frontend types defined
- [ ] ✅ Utility functions available
- [ ] ✅ OrdersPage displays orders
- [ ] ✅ Can create orders
- [ ] ✅ Can update orders
- [ ] ✅ Status changes logged
- [ ] ✅ Order numbers auto-generate
- [ ] ✅ No linter errors
- [ ] ✅ No console errors

### Step 13: Performance Check
- [ ] Run `TEST_ORDER_SETUP.sql` performance section
- [ ] Check index usage
- [ ] ✅ Indexes being used
- [ ] ✅ No sequential scans on large tables

## 🚀 Ready for Development

If all boxes are checked above, you're ready to:
- ✅ Build order management features
- ✅ Implement bidding system
- ✅ Add custom filters and views
- ✅ Create order analytics
- ✅ Deploy to production

## ❌ Troubleshooting

If any checks fail, refer to:
- `ORDERS_README.md` → Troubleshooting section
- `ORDERS_SETUP_COMPLETE.md` → Common Issues
- Run `TEST_ORDER_SETUP.sql` to diagnose
- Check browser console for errors
- Check Supabase logs in Dashboard

## 📊 Progress Tracker

**Database**: __ / 12 steps complete  
**Frontend**: __ / 10 steps complete  
**Total**: __ / 22 steps complete

---

## 🎉 Completion

When all steps are checked:

✅ **DATABASE SETUP COMPLETE**
- Orders table with 68 columns
- All constraints and indexes
- All triggers and functions
- RLS policies active

✅ **FRONTEND SETUP COMPLETE**
- Type-safe interfaces
- Utility functions ready
- Orders page working
- React Query integrated

✅ **SYSTEM VERIFIED**
- Test data created
- All operations tested
- Performance validated
- Documentation reviewed

✅ **READY FOR PRODUCTION**
- Secure (RLS enabled)
- Performant (indexed)
- Type-safe (TypeScript)
- Well-documented

---

**Completion Date**: ____________

**Verified By**: ____________

**Notes**: ____________

---

## Quick Reference

**Run migrations**: `apply_all_orders_migrations.sql`  
**Verify setup**: `TEST_ORDER_SETUP.sql`  
**Documentation**: `ORDERS_INDEX.md`  
**Quick API**: `ORDERS_QUICK_START.md`  
**Utilities**: `src/lib/orderUtils.ts`  
**Types**: `src/types/database.ts`

**Status**: 🟡 In Progress → 🟢 Complete


