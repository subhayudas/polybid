-- =====================================================
-- CREATE ORDERS TABLE - COPY ALL OF THIS
-- Paste into Supabase SQL Editor and click RUN
-- =====================================================

-- Required extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Order status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending', 'confirmed', 'in_production', 'completed', 
      'shipped', 'delivered', 'cancelled', 'on_hold'
    );
  END IF;
END $$;

-- Order priority enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_priority') THEN
    CREATE TYPE public.order_priority AS ENUM (
      'urgent', 'high', 'normal', 'low'
    );
  END IF;
END $$;

-- CREATE ORDERS TABLE
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

-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

-- Status history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status public.order_status,
  new_status public.order_status,
  changed_by UUID,
  change_notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-assign order numbers
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);

-- Triggers
DROP TRIGGER IF EXISTS set_order_number_trigger ON public.orders;
CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = user_id);

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access" ON public.orders;
CREATE POLICY "Service role full access"
ON public.orders FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Enable RLS on history table
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view history of their orders" ON public.order_status_history;
CREATE POLICY "Users can view history of their orders"
ON public.order_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- =====================================================
-- DONE! Orders table created successfully
-- =====================================================



