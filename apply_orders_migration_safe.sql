-- =====================================================
-- POLYBID ORDERS TABLE MIGRATION (SAFE VERSION)
-- This version removes optional foreign key constraints
-- Run this in your Supabase SQL Editor
-- Project: https://xthxutsliqptoodkzrcp.supabase.co
-- =====================================================

-- Ensure required extension for UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Create the orders table (without optional foreign keys)
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
  CONSTRAINT orders_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users (id),
  CONSTRAINT orders_infill_percentage_check CHECK (infill_percentage >= 0 AND infill_percentage <= 100),
  CONSTRAINT orders_assembly_type_check CHECK (
    assembly_type IS NULL OR assembly_type = ANY (ARRAY['no_assembly', 'assembly_test', 'ship_in_assembly'])
  ),
  CONSTRAINT orders_finished_appearance_check CHECK (
    finished_appearance IS NULL OR finished_appearance = ANY (ARRAY['standard', 'premium'])
  ),
  CONSTRAINT orders_tolerance_type_check CHECK (
    tolerance_type IS NULL OR tolerance_type = ANY (ARRAY['standard', 'tighter'])
  ),
  CONSTRAINT orders_design_units_check CHECK (
    design_units IS NULL OR design_units = ANY (ARRAY['mm', 'inch', 'cm'])
  )
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status);
CREATE INDEX IF NOT EXISTS idx_orders_manufacturing_process ON public.orders USING btree (manufacturing_process_id);
CREATE INDEX IF NOT EXISTS idx_orders_material_variant ON public.orders USING btree (material_variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_material_type ON public.orders USING btree (material_type_id);
CREATE INDEX IF NOT EXISTS idx_orders_surface_finish ON public.orders USING btree (surface_finish_id);
CREATE INDEX IF NOT EXISTS idx_orders_part_marking ON public.orders USING btree (part_marking_id);
CREATE INDEX IF NOT EXISTS idx_orders_inspection_type ON public.orders USING btree (inspection_type_id);

-- Triggers
DROP TRIGGER IF EXISTS log_order_status_change_trigger ON public.orders;
CREATE TRIGGER log_order_status_change_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_status_change();

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

-- Enable row level security and define policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can manage their own orders
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

-- Allow service role to bypass RLS (for admin operations)
DROP POLICY IF EXISTS "Service role can manage all orders" ON public.orders;
CREATE POLICY "Service role can manage all orders"
  ON public.orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.orders IS 'Customer manufacturing orders tracked within Polybid.';
COMMENT ON TABLE public.order_status_history IS 'Audit log capturing status transitions for customer orders.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- ✅ Orders table created successfully
-- ✅ Row Level Security (RLS) enabled
-- ✅ Automatic order numbering configured
-- ✅ Status history tracking enabled
--
-- Next steps:
-- 1. Run test_orders_table.sql to verify
-- 2. Insert test data or use the application
-- =====================================================



