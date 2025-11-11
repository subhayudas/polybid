-- =====================================================
-- TEST QUERIES FOR ORDERS TABLE
-- Run these AFTER applying the main migration
-- =====================================================

-- 1. Verify the orders table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'orders';
-- Expected: Should return one row with 'orders'

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;
-- Expected: Should return all columns from the orders table

-- 3. Insert a test order (OPTIONAL)
-- This will create a sample order for your current user
INSERT INTO public.orders (
  user_id,
  file_name,
  material,
  quantity,
  price,
  notes,
  status,
  priority,
  estimated_delivery
) VALUES (
  auth.uid(), -- Uses your current authenticated user ID
  'sample_part.stl',
  'PLA Plastic',
  10,
  99.99,
  'This is a test order created to verify the migration',
  'pending',
  'normal',
  CURRENT_DATE + INTERVAL '7 days'
);
-- Expected: "Success. No rows returned"

-- 4. Query all orders for the current user
SELECT 
  order_number,
  file_name,
  material,
  quantity,
  price,
  status,
  priority,
  created_at
FROM public.orders
ORDER BY created_at DESC;
-- Expected: Should show your test order(s)

-- 5. Check RLS policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'orders';
-- Expected: Should show all RLS policies for the orders table

-- =====================================================
-- CLEANUP (If you want to remove test data)
-- =====================================================
-- Run this ONLY if you want to delete the test orders
-- DELETE FROM public.orders WHERE notes LIKE '%test order%';



