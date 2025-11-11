-- =====================================================
-- APPLY ALL ORDERS MIGRATIONS
-- Run this script in Supabase SQL Editor to apply all orders-related migrations
-- This combines all three migration files into one
-- =====================================================

-- =====================================================
-- PART 1: Create Orders Table (20251109000000)
-- =====================================================

-- Ensure required extension for UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create order status enum if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'order_status'
  ) THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending',
      'confirmed',
      'in_production',
      'completed',
      'shipped',
      'delivered',
      'cancelled',
      'on_hold'
    );
  END IF;
END
$$;

-- Create order priority enum if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'order_priority'
  ) THEN
    CREATE TYPE public.order_priority AS ENUM (
      'urgent',
      'high',
      'normal',
      'low'
    );
  END IF;
END
$$;

-- Helper function for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  order_number TEXT,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  material TEXT NOT NULL,
  material_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2),
  notes TEXT,
  status public.order_status DEFAULT 'pending'::order_status,
  priority public.order_priority DEFAULT 'normal'::order_priority,
  estimated_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  color TEXT,
  infill_percentage INTEGER DEFAULT 20,
  layer_height NUMERIC(4, 3) DEFAULT 0.2,
  support_required BOOLEAN DEFAULT false,
  post_processing TEXT[],
  estimated_weight NUMERIC(8, 3),
  estimated_volume NUMERIC(10, 3),
  estimated_print_time INTEGER,
  production_notes TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  assigned_to UUID,
  manufacturing_process_id UUID,
  sub_process TEXT,
  design_units TEXT DEFAULT 'mm',
  material_type_id UUID,
  material_variant_id UUID,
  selected_color TEXT,
  surface_finish_id UUID,
  technical_drawing_path TEXT,
  has_threads BOOLEAN DEFAULT false,
  threads_description TEXT,
  has_inserts BOOLEAN DEFAULT false,
  inserts_description TEXT,
  tolerance_type TEXT DEFAULT 'standard',
  tolerance_description TEXT,
  surface_roughness TEXT,
  part_marking_id UUID,
  has_assembly BOOLEAN DEFAULT false,
  assembly_type TEXT,
  finished_appearance TEXT DEFAULT 'standard',
  inspection_type_id UUID,
  itar_compliance BOOLEAN DEFAULT false,
  nda_acknowledged BOOLEAN DEFAULT false,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_order_number_key UNIQUE (order_number),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT orders_infill_percentage_check CHECK (infill_percentage >= 0 AND infill_percentage <= 100)
);

-- Supporting sequence for human friendly order numbers
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

-- Table for auditing order status transitions
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status public.order_status,
  new_status public.order_status,
  changed_by UUID,
  change_notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to auto assign order numbers
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger AS $$
DECLARE
  generated_number TEXT;
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    generated_number := 'PO-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
    NEW.order_number := generated_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders USING btree (created_at);

-- Basic triggers
DROP TRIGGER IF EXISTS set_order_number_trigger ON public.orders;
CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable row level security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: Fix Orders Policies (20251109000001)
-- =====================================================

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Customers can view their own orders
DROP POLICY IF EXISTS "Customers can view their orders" ON public.orders;
CREATE POLICY "Customers can view their orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Customers can create their own orders
DROP POLICY IF EXISTS "Customers can create their orders" ON public.orders;
CREATE POLICY "Customers can create their orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Customers can update their own orders
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

-- Allow authenticated users to view all orders (marketplace)
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON public.orders;
CREATE POLICY "Authenticated users can view all orders"
  ON public.orders
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role full access
DROP POLICY IF EXISTS "Service role full access to orders" ON public.orders;
CREATE POLICY "Service role full access to orders"
  ON public.orders
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS for order_status_history
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

-- =====================================================
-- PART 3: Complete Orders Setup (20251109000002)
-- =====================================================

-- Add missing check constraints
DO $$
BEGIN
  -- assembly_type constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_assembly_type_check' 
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_assembly_type_check CHECK (
      assembly_type IS NULL OR 
      assembly_type = ANY (ARRAY['no_assembly'::text, 'assembly_test'::text, 'ship_in_assembly'::text])
    );
  END IF;

  -- finished_appearance constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_finished_appearance_check' 
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_finished_appearance_check CHECK (
      finished_appearance IS NULL OR 
      finished_appearance = ANY (ARRAY['standard'::text, 'premium'::text])
    );
  END IF;

  -- tolerance_type constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_tolerance_type_check' 
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_tolerance_type_check CHECK (
      tolerance_type IS NULL OR 
      tolerance_type = ANY (ARRAY['standard'::text, 'tighter'::text])
    );
  END IF;

  -- design_units constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_design_units_check' 
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_design_units_check CHECK (
      design_units IS NULL OR 
      design_units = ANY (ARRAY['mm'::text, 'inch'::text, 'cm'::text])
    );
  END IF;

  -- assigned_to foreign key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_assigned_to_fkey' 
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES auth.users (id);
  END IF;
END $$;

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_orders_manufacturing_process ON public.orders USING btree (manufacturing_process_id);
CREATE INDEX IF NOT EXISTS idx_orders_material_variant ON public.orders USING btree (material_variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_material_type ON public.orders USING btree (material_type_id);
CREATE INDEX IF NOT EXISTS idx_orders_surface_finish ON public.orders USING btree (surface_finish_id);
CREATE INDEX IF NOT EXISTS idx_orders_part_marking ON public.orders USING btree (part_marking_id);
CREATE INDEX IF NOT EXISTS idx_orders_inspection_type ON public.orders USING btree (inspection_type_id);

-- Function to log order status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger AS $$
DECLARE
  acting_user UUID;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    acting_user := NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;

    INSERT INTO public.order_status_history (
      order_id,
      previous_status,
      new_status,
      changed_by,
      change_notes
    )
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      acting_user,
      NEW.production_notes
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create status change logging trigger
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON public.orders;
CREATE TRIGGER log_order_status_change_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

-- Add comments
COMMENT ON TABLE public.orders IS 'Customer manufacturing orders tracked within Polybid.';
COMMENT ON TABLE public.order_status_history IS 'Audit log capturing status transitions for customer orders.';
COMMENT ON POLICY "Authenticated users can view all orders" ON public.orders IS 
  'Allows all authenticated users to view orders so vendors can see available orders for bidding. This is a marketplace feature.';

-- =====================================================
-- DONE! All migrations applied successfully
-- =====================================================

-- Verify setup
SELECT 
  'Orders Setup Complete!' as message,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = 'orders') as total_columns,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE schemaname = 'public' AND tablename = 'orders') as total_indexes,
  (SELECT COUNT(*) FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'orders') as total_policies,
  (SELECT COUNT(*) FROM information_schema.triggers
   WHERE event_object_schema = 'public' AND event_object_table = 'orders') as total_triggers;



