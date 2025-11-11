-- =====================================================
-- TEST ORDER SETUP - Verification & Testing Script
-- Run this in Supabase SQL Editor to verify everything is working
-- =====================================================

-- 1. Verify orders table exists and has correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Verify enums exist
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('order_status', 'order_priority')
ORDER BY t.typname, e.enumsortorder;

-- 3. Verify indexes exist
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'orders'
ORDER BY indexname;

-- 4. Verify constraints exist
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
  END AS constraint_type_description,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'orders'
ORDER BY con.conname;

-- 5. Verify triggers exist
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'orders'
ORDER BY trigger_name;

-- 6. Verify functions exist
SELECT
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('set_order_number', 'log_order_status_change', 'update_updated_at_column')
ORDER BY p.proname;

-- 7. Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'order_status_history');

-- 8. Verify RLS policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'orders'
ORDER BY policyname;

-- 9. Check current order count
SELECT 
  COUNT(*) as total_orders,
  COUNT(DISTINCT user_id) as unique_customers,
  COUNT(DISTINCT assigned_to) as assigned_vendors
FROM public.orders;

-- 10. Check orders by status
SELECT 
  status,
  COUNT(*) as count
FROM public.orders
GROUP BY status
ORDER BY count DESC;

-- 11. Check orders by priority
SELECT 
  priority,
  COUNT(*) as count
FROM public.orders
GROUP BY priority
ORDER BY 
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
  END;

-- 12. Verify order_status_history table
SELECT 
  COUNT(*) as total_status_changes,
  COUNT(DISTINCT order_id) as orders_with_changes
FROM public.order_status_history;

-- 13. Test order number sequence
SELECT 
  sequence_name,
  last_value,
  increment_by
FROM information_schema.sequences
WHERE sequence_schema = 'public'
  AND sequence_name = 'order_number_seq';

-- =====================================================
-- INSERT TEST DATA (Optional - Uncomment to use)
-- =====================================================

-- Insert a test order (replace USER_ID with actual auth user ID)
-- You can get your user ID with: SELECT auth.uid();

/*
INSERT INTO public.orders (
  user_id,
  file_name,
  material,
  quantity,
  price,
  notes,
  status,
  priority,
  color,
  infill_percentage,
  layer_height,
  support_required,
  design_units,
  tolerance_type,
  finished_appearance,
  itar_compliance,
  nda_acknowledged
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID
  'test-part-001.stl',
  'PLA',
  5,
  49.99,
  'Test order for verification',
  'pending',
  'normal',
  'Black',
  20,
  0.2,
  false,
  'mm',
  'standard',
  'standard',
  false,
  true
);
*/

-- =====================================================
-- CLEANUP TEST DATA (Optional - Uncomment to use)
-- =====================================================

/*
-- Delete test orders
DELETE FROM public.orders
WHERE notes = 'Test order for verification';
*/

-- =====================================================
-- VERIFY RLS POLICIES WORK
-- =====================================================

-- Test 1: Check if authenticated users can view orders
-- Run this while logged in as a user
/*
SELECT COUNT(*) as visible_orders
FROM public.orders;
*/

-- Test 2: Try to insert order as current user
-- Run this while logged in
/*
INSERT INTO public.orders (
  user_id,
  file_name,
  material,
  quantity
) VALUES (
  auth.uid(),
  'rls-test.stl',
  'ABS',
  1
);
*/

-- Test 3: Verify you can't insert orders for other users
-- This should fail
/*
INSERT INTO public.orders (
  user_id,
  file_name,
  material,
  quantity
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Different user
  'should-fail.stl',
  'PLA',
  1
);
*/

-- =====================================================
-- PERFORMANCE TESTS
-- =====================================================

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'orders'
ORDER BY idx_scan DESC;

-- Check table statistics
SELECT
  schemaname,
  relname,
  seq_scan as sequential_scans,
  seq_tup_read as seq_tuples_read,
  idx_scan as index_scans,
  idx_tup_fetch as idx_tuples_fetched,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname = 'orders';

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

SELECT 
  'Orders Table Setup Complete' as status,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = 'orders') as total_columns,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname = 'public' AND tablename = 'orders') as total_indexes,
  (SELECT COUNT(*) FROM pg_constraint con
   JOIN pg_class rel ON rel.oid = con.conrelid
   WHERE rel.relname = 'orders') as total_constraints,
  (SELECT COUNT(*) FROM information_schema.triggers
   WHERE event_object_schema = 'public' AND event_object_table = 'orders') as total_triggers,
  (SELECT COUNT(*) FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'orders') as total_policies,
  (SELECT COUNT(*) FROM public.orders) as total_orders;

-- =====================================================
-- If all queries run successfully, your setup is complete!
-- =====================================================



