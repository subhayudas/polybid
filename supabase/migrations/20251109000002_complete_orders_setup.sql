-- Complete Orders Table Setup - Aligns with exact schema requirements
-- This migration adds missing constraints, indexes, and functions without dropping existing data

-- Ensure required extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure helper function exists for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add missing check constraints if they don't exist
DO $$
BEGIN
  -- Check for assembly_type constraint
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

  -- Check for finished_appearance constraint
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

  -- Check for tolerance_type constraint
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

  -- Check for design_units constraint
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
END $$;

-- Add foreign key constraints if they don't exist (with proper error handling)
DO $$
BEGIN
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

  -- Note: Material-related foreign keys depend on those tables existing
  -- We'll add them conditionally

  -- material_id foreign key (if materials table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'materials') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'orders_material_id_fkey' 
      AND conrelid = 'public.orders'::regclass
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_material_id_fkey 
      FOREIGN KEY (material_id) REFERENCES public.materials (id);
    END IF;
  END IF;

  -- material_type_id foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'material_types') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'orders_material_type_id_fkey' 
      AND conrelid = 'public.orders'::regclass
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_material_type_id_fkey 
      FOREIGN KEY (material_type_id) REFERENCES public.material_types (id);
    END IF;
  END IF;

  -- material_variant_id foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'material_variants') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'orders_material_variant_id_fkey' 
      AND conrelid = 'public.orders'::regclass
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_material_variant_id_fkey 
      FOREIGN KEY (material_variant_id) REFERENCES public.material_variants (id);
    END IF;
  END IF;

  -- part_marking_id foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'part_marking_types') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'orders_part_marking_id_fkey' 
      AND conrelid = 'public.orders'::regclass
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_part_marking_id_fkey 
      FOREIGN KEY (part_marking_id) REFERENCES public.part_marking_types (id);
    END IF;
  END IF;

  -- surface_finish_id foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'surface_finishes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'orders_surface_finish_id_fkey' 
      AND conrelid = 'public.orders'::regclass
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_surface_finish_id_fkey 
      FOREIGN KEY (surface_finish_id) REFERENCES public.surface_finishes (id);
    END IF;
  END IF;

  -- inspection_type_id foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inspection_types') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'orders_inspection_type_id_fkey' 
      AND conrelid = 'public.orders'::regclass
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_inspection_type_id_fkey 
      FOREIGN KEY (inspection_type_id) REFERENCES public.inspection_types (id);
    END IF;
  END IF;

  -- manufacturing_process_id foreign key
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'manufacturing_processes') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'orders_manufacturing_process_id_fkey' 
      AND conrelid = 'public.orders'::regclass
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_manufacturing_process_id_fkey 
      FOREIGN KEY (manufacturing_process_id) REFERENCES public.manufacturing_processes (id);
    END IF;
  END IF;
END $$;

-- Create all required indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status);
CREATE INDEX IF NOT EXISTS idx_orders_manufacturing_process ON public.orders USING btree (manufacturing_process_id);
CREATE INDEX IF NOT EXISTS idx_orders_material_variant ON public.orders USING btree (material_variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_material_type ON public.orders USING btree (material_type_id);
CREATE INDEX IF NOT EXISTS idx_orders_surface_finish ON public.orders USING btree (surface_finish_id);
CREATE INDEX IF NOT EXISTS idx_orders_part_marking ON public.orders USING btree (part_marking_id);
CREATE INDEX IF NOT EXISTS idx_orders_inspection_type ON public.orders USING btree (inspection_type_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders USING btree (created_at);

-- Ensure order_status_history table exists
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status public.order_status,
  new_status public.order_status,
  changed_by UUID,
  change_notes TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to log order status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger AS $$
DECLARE
  acting_user UUID;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Try to get the current user from JWT claim
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

-- Ensure all triggers exist
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

-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE public.orders IS 'Customer manufacturing orders tracked within Polybid.';
COMMENT ON TABLE public.order_status_history IS 'Audit log capturing status transitions for customer orders.';

COMMENT ON POLICY "Authenticated users can view all orders" ON public.orders IS 
  'Allows all authenticated users to view orders so vendors can see available orders for bidding. This is a marketplace feature.';



