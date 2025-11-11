-- Update bids table to properly reference orders table and set up RLS policies

-- Add foreign key constraint to orders table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'bids_order_id_fkey' 
    AND table_name = 'bids'
  ) THEN
    ALTER TABLE public.bids 
    ADD CONSTRAINT bids_order_id_fkey 
    FOREIGN KEY (order_id) 
    REFERENCES public.orders(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on bids table
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all bids" ON public.bids;
DROP POLICY IF EXISTS "Authenticated users can create bids" ON public.bids;
DROP POLICY IF EXISTS "Users can update their own bids" ON public.bids;
DROP POLICY IF EXISTS "Users can delete their own bids" ON public.bids;

-- Policy: Anyone can view bids (transparent bidding system)
CREATE POLICY "Users can view all bids"
ON public.bids
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can create bids
CREATE POLICY "Authenticated users can create bids"
ON public.bids
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = vendor_id);

-- Policy: Users can update their own bids
CREATE POLICY "Users can update their own bids"
ON public.bids
FOR UPDATE
TO authenticated
USING (auth.uid() = vendor_id)
WITH CHECK (auth.uid() = vendor_id);

-- Policy: Users can delete their own bids
CREATE POLICY "Users can delete their own bids"
ON public.bids
FOR DELETE
TO authenticated
USING (auth.uid() = vendor_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_bids_order_id ON public.bids(order_id);
CREATE INDEX IF NOT EXISTS idx_bids_vendor_id ON public.bids(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);

-- Update vendor_profiles table RLS if needed
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing vendor_profiles policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.vendor_profiles;

-- Policy: All vendor profiles are viewable by authenticated users
CREATE POLICY "Public profiles are viewable by everyone"
ON public.vendor_profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.vendor_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.vendor_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a trigger to automatically create vendor profile for new users if needed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a basic vendor profile for new users
  INSERT INTO public.vendor_profiles (id, company_name, business_email, is_verified, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    false,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();



