-- =====================================================
-- FIX ORDERS NOT FETCHING ISSUE
-- This script fixes the infinite recursion problem in the orders table RLS policies
-- Copy and paste this entire file into Supabase SQL Editor and click RUN
-- =====================================================

-- First, check if the orders table exists and has the problematic policy
DO $$
BEGIN
    -- Drop the problematic admin policy that causes infinite recursion
    DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
    
    -- Recreate customer policies (these should work fine)
    DROP POLICY IF EXISTS "Customers can view their orders" ON public.orders;
    CREATE POLICY "Customers can view their orders"
      ON public.orders
      FOR SELECT
      USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Customers can create their orders" ON public.orders;
    CREATE POLICY "Customers can create their orders"
      ON public.orders
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Customers can update their orders" ON public.orders;
    CREATE POLICY "Customers can update their orders"
      ON public.orders
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    -- Vendors can read orders assigned to them
    DROP POLICY IF EXISTS "Assigned vendors can view orders" ON public.orders;
    CREATE POLICY "Assigned vendors can view orders"
      ON public.orders
      FOR SELECT
      USING (assigned_to = auth.uid());

    -- Vendors can update orders assigned to them
    DROP POLICY IF EXISTS "Assigned vendors can update orders" ON public.orders;
    CREATE POLICY "Assigned vendors can update orders"
      ON public.orders
      FOR UPDATE
      USING (assigned_to = auth.uid())
      WITH CHECK (assigned_to = auth.uid());

    -- CRITICAL FIX: Allow all authenticated users to view orders
    -- This is needed for the marketplace feature where vendors need to see available orders to bid on
    DROP POLICY IF EXISTS "Authenticated users can view all orders" ON public.orders;
    CREATE POLICY "Authenticated users can view all orders"
      ON public.orders
      FOR SELECT
      USING (auth.role() = 'authenticated');

    -- Service role can do everything (for system operations)
    DROP POLICY IF EXISTS "Service role full access to orders" ON public.orders;
    CREATE POLICY "Service role full access to orders"
      ON public.orders
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');

    RAISE NOTICE 'Orders table RLS policies have been fixed successfully!';

EXCEPTION
    WHEN undefined_table THEN
        RAISE EXCEPTION 'Orders table does not exist. Please run the create_orders_table.sql migration first.';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error fixing orders policies: %', SQLERRM;
END;
$$;

-- Also fix the order_status_history table RLS if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_status_history') THEN
        -- Enable RLS on order_status_history if not already enabled
        ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

        -- Fix policies for order_status_history
        DROP POLICY IF EXISTS "Users can view history of their orders" ON public.order_status_history;
        CREATE POLICY "Users can view history of their orders"
          ON public.order_status_history
          FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM public.orders 
              WHERE orders.id = order_status_history.order_id 
              AND (orders.user_id = auth.uid() OR orders.assigned_to = auth.uid())
            )
          );

        DROP POLICY IF EXISTS "Service role full access to order history" ON public.order_status_history;
        CREATE POLICY "Service role full access to order history"
          ON public.order_status_history
          FOR ALL
          USING (auth.role() = 'service_role')
          WITH CHECK (auth.role() = 'service_role');

        RAISE NOTICE 'Order status history table RLS policies have been fixed successfully!';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Could not fix order_status_history policies: %', SQLERRM;
END;
$$;

-- Show current policies for verification
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
WHERE tablename IN ('orders', 'order_status_history')
ORDER BY tablename, policyname;

-- =====================================================
-- DONE! 
-- If you see the list of policies above without any errors,
-- the fix has been applied successfully.
-- 
-- You should now be able to fetch orders from your application.
-- =====================================================



