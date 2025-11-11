-- Fix bids table policies to allow authenticated users to submit bids
-- This migration resolves the 403 error when submitting bids

-- Drop all existing policies on bids table
DROP POLICY IF EXISTS "Vendors can view their own bids" ON public.bids;
DROP POLICY IF EXISTS "Vendors can create bids" ON public.bids;
DROP POLICY IF EXISTS "Vendors can update their own active bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can view all bids" ON public.bids;
DROP POLICY IF EXISTS "Users can view all bids" ON public.bids;
DROP POLICY IF EXISTS "Authenticated users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can update their own bids" ON public.bids;
DROP POLICY IF EXISTS "Users can delete their own bids" ON public.bids;

-- First, check if bids table has the correct foreign key constraint
-- Drop the old foreign key that requires vendor_profiles
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bids_vendor_id_fkey' 
    AND table_name = 'bids'
  ) THEN
    ALTER TABLE public.bids DROP CONSTRAINT bids_vendor_id_fkey;
  END IF;
END $$;

-- Add new foreign key that references auth.users directly
ALTER TABLE public.bids 
ADD CONSTRAINT bids_vendor_id_fkey 
FOREIGN KEY (vendor_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Ensure RLS is enabled
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that allow all authenticated users to interact with bids

-- Policy 1: All authenticated users can view all bids (transparent marketplace)
CREATE POLICY "All users can view bids"
ON public.bids
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Authenticated users can create bids for themselves
CREATE POLICY "Users can create their own bids"
ON public.bids
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = vendor_id);

-- Policy 3: Users can update their own bids if they're still active
CREATE POLICY "Users can update their own active bids"
ON public.bids
FOR UPDATE
TO authenticated
USING (auth.uid() = vendor_id AND status = 'active')
WITH CHECK (auth.uid() = vendor_id AND status = 'active');

-- Policy 4: Users can delete their own bids
CREATE POLICY "Users can delete their own bids"
ON public.bids
FOR DELETE
TO authenticated
USING (auth.uid() = vendor_id);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_bids_order_id ON public.bids(order_id);
CREATE INDEX IF NOT EXISTS idx_bids_vendor_id ON public.bids(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_submitted_at ON public.bids(submitted_at);

-- Comment on the policies
COMMENT ON POLICY "All users can view bids" ON public.bids IS 
  'Allows all authenticated users to view bids for transparency in the marketplace';

COMMENT ON POLICY "Users can create their own bids" ON public.bids IS 
  'Allows authenticated users to submit bids on orders';



