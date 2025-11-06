-- Polybid Vendor Bidding System Migration
-- This migration creates the vendor bidding system for Polyform orders

-- Create vendor profiles table
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  phone TEXT,
  address JSONB,
  business_license TEXT,
  tax_id TEXT,
  capabilities TEXT[], -- e.g., ['3d_printing', 'cnc_machining', 'sheet_metal']
  materials_offered TEXT[], -- materials they can work with
  certifications TEXT[], -- ISO, quality certifications
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_orders_completed INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor applications table (for new vendor registration)
CREATE TABLE IF NOT EXISTS public.vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  phone TEXT,
  address JSONB,
  business_license TEXT,
  tax_id TEXT,
  capabilities TEXT[],
  materials_offered TEXT[],
  certifications TEXT[],
  portfolio_urls TEXT[],
  business_description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL, -- References orders from main polyform system
  vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  bid_amount DECIMAL(10,2) NOT NULL,
  estimated_delivery_days INTEGER NOT NULL,
  notes TEXT,
  materials_breakdown JSONB, -- detailed cost breakdown
  status TEXT CHECK (status IN ('active', 'withdrawn', 'accepted', 'rejected', 'expired')) DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order assignments table (when a bid is accepted)
CREATE TABLE IF NOT EXISTS public.order_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE, -- One assignment per order
  vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE CASCADE NOT NULL,
  winning_bid_id UUID REFERENCES public.bids(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_completion TIMESTAMP WITH TIME ZONE,
  actual_completion TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'assigned',
  completion_notes TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bid notifications table
CREATE TABLE IF NOT EXISTS public.bid_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'new_order', 'bid_accepted', 'bid_rejected', 'order_completed'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_order_id UUID,
  related_bid_id UUID REFERENCES public.bids(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor reviews table
CREATE TABLE IF NOT EXISTS public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_assignment_id UUID REFERENCES public.order_assignments(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) NOT NULL, -- Customer who placed the order
  vendor_id UUID REFERENCES public.vendor_profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_capabilities ON public.vendor_profiles USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_materials ON public.vendor_profiles USING GIN(materials_offered);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_active ON public.vendor_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_verified ON public.vendor_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON public.vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_bids_order_id ON public.bids(order_id);
CREATE INDEX IF NOT EXISTS idx_bids_vendor_id ON public.bids(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_expires_at ON public.bids(expires_at);
CREATE INDEX IF NOT EXISTS idx_order_assignments_order_id ON public.order_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_assignments_vendor_id ON public.order_assignments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bid_notifications_recipient ON public.bid_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_bid_notifications_unread ON public.bid_notifications(recipient_id, is_read);

-- Enable RLS on all tables
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_profiles
CREATE POLICY "Vendors can view their own profile" ON public.vendor_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Vendors can update their own profile" ON public.vendor_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Verified vendors are publicly viewable" ON public.vendor_profiles
  FOR SELECT USING (is_verified = true AND is_active = true);

CREATE POLICY "Admins can manage all vendor profiles" ON public.vendor_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for vendor_applications
CREATE POLICY "Users can view their own applications" ON public.vendor_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON public.vendor_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending applications" ON public.vendor_applications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all applications" ON public.vendor_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bids
CREATE POLICY "Vendors can view their own bids" ON public.bids
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM public.vendor_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Vendors can create bids" ON public.bids
  FOR INSERT WITH CHECK (
    vendor_id IN (
      SELECT id FROM public.vendor_profiles WHERE id = auth.uid() AND is_verified = true
    )
  );

CREATE POLICY "Vendors can update their own active bids" ON public.bids
  FOR UPDATE USING (
    vendor_id IN (
      SELECT id FROM public.vendor_profiles WHERE id = auth.uid()
    ) AND status = 'active'
  );

CREATE POLICY "Admins can view all bids" ON public.bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for order_assignments
CREATE POLICY "Vendors can view their assignments" ON public.order_assignments
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM public.vendor_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update their assignments" ON public.order_assignments
  FOR UPDATE USING (
    vendor_id IN (
      SELECT id FROM public.vendor_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all assignments" ON public.order_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bid_notifications
CREATE POLICY "Users can view their own notifications" ON public.bid_notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications" ON public.bid_notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

CREATE POLICY "System can create notifications" ON public.bid_notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for vendor_reviews
CREATE POLICY "Reviews are publicly readable" ON public.vendor_reviews
  FOR SELECT USING (true);

CREATE POLICY "Order customers can create reviews" ON public.vendor_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Admins can manage all reviews" ON public.vendor_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_profiles_updated_at 
  BEFORE UPDATE ON public.vendor_profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_applications_updated_at 
  BEFORE UPDATE ON public.vendor_applications 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bids_updated_at 
  BEFORE UPDATE ON public.bids 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_assignments_updated_at 
  BEFORE UPDATE ON public.order_assignments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update vendor ratings
CREATE OR REPLACE FUNCTION public.update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vendor_profiles 
  SET rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM public.vendor_reviews 
    WHERE vendor_id = NEW.vendor_id
  ),
  total_orders_completed = (
    SELECT COUNT(*)
    FROM public.order_assignments 
    WHERE vendor_id = NEW.vendor_id AND status = 'completed'
  )
  WHERE id = NEW.vendor_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_rating_trigger
  AFTER INSERT ON public.vendor_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_rating();

-- Function to expire old bids
CREATE OR REPLACE FUNCTION public.expire_old_bids()
RETURNS void AS $$
BEGIN
  UPDATE public.bids 
  SET status = 'expired'
  WHERE status = 'active' 
    AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Add comments for documentation
COMMENT ON TABLE public.vendor_profiles IS 'Verified vendor profiles with capabilities and ratings';
COMMENT ON TABLE public.vendor_applications IS 'Vendor registration applications pending approval';
COMMENT ON TABLE public.bids IS 'Vendor bids on customer orders';
COMMENT ON TABLE public.order_assignments IS 'Winning bid assignments to vendors';
COMMENT ON TABLE public.bid_notifications IS 'Notifications for bidding system events';
COMMENT ON TABLE public.vendor_reviews IS 'Customer reviews and ratings for completed orders';
