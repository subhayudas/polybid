-- Fix orders table RLS policies to avoid infinite recursion
-- This migration removes the problematic admin policy that references user_roles

-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Recreate simpler policies without user_roles reference
-- We'll handle admin access through direct service role or future improvements

-- Ensure customers can view their own orders
DROP POLICY IF EXISTS "Customers can view their orders" ON public.orders;
CREATE POLICY "Customers can view their orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Ensure customers can create their own orders
DROP POLICY IF EXISTS "Customers can create their orders" ON public.orders;
CREATE POLICY "Customers can create their orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ensure customers can update their own orders
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

-- Vendors can update orders assigned to them (for status updates, tracking info, etc.)
DROP POLICY IF EXISTS "Assigned vendors can update orders" ON public.orders;
CREATE POLICY "Assigned vendors can update orders"
  ON public.orders
  FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Allow authenticated users to view all orders (temporary solution for marketplace visibility)
-- This allows vendors to see orders they can bid on
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

-- Also fix the order_status_history table RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

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

COMMENT ON POLICY "Authenticated users can view all orders" ON public.orders IS 
  'Allows all authenticated users to view orders so vendors can see available orders for bidding. This is a marketplace feature.';


