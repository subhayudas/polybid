-- Fix infinite recursion in user_roles RLS policies
-- This migration fixes the issue where querying user_roles in triggers causes infinite recursion

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_admin_users();
DROP FUNCTION IF EXISTS public.notify_admins_new_application();

-- Helper function to get admin users bypassing RLS
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(user_id UUID)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with SECURITY DEFINER, so it bypasses RLS
  -- when querying user_roles
  RETURN QUERY
  SELECT ur.user_id
  FROM public.user_roles ur
  WHERE ur.role = 'admin';
END;
$$ language 'plpgsql';

-- Function to notify admins when new application is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_new_application()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user RECORD;
BEGIN
  -- Use the helper function to get admin users, which bypasses RLS
  FOR admin_user IN 
    SELECT * FROM public.get_admin_users()
  LOOP
    INSERT INTO public.bid_notifications (
      recipient_id,
      type,
      title,
      message,
      related_order_id
    )
    VALUES (
      admin_user.user_id,
      'new_vendor_application',
      'New Vendor Application',
      'A new vendor application has been submitted by ' || NEW.company_name || ' (' || NEW.business_email || ').',
      NULL
    );
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If user_roles table doesn't exist or has issues, just return without error
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update admin policies to include WITH CHECK clauses
DROP POLICY IF EXISTS "Admins can manage all vendor profiles" ON public.vendor_profiles;
CREATE POLICY "Admins can manage all vendor profiles" ON public.vendor_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all applications" ON public.vendor_applications;
CREATE POLICY "Admins can manage all applications" ON public.vendor_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.order_assignments;
CREATE POLICY "Admins can manage all assignments" ON public.order_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.vendor_reviews;
CREATE POLICY "Admins can manage all reviews" ON public.vendor_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );





