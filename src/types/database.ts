// Database types matching the exact Supabase schema
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_production'
  | 'completed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'on_hold';

export type OrderPriority = 
  | 'urgent'
  | 'high'
  | 'normal'
  | 'low';

export type AssemblyType = 
  | 'no_assembly'
  | 'assembly_test'
  | 'ship_in_assembly';

export type FinishedAppearance = 
  | 'standard'
  | 'premium';

export type ToleranceType = 
  | 'standard'
  | 'tighter';

export type DesignUnits = 
  | 'mm'
  | 'inch'
  | 'cm';

export interface Order {
  id: string;
  order_number: string | null;
  user_id: string;
  file_name: string;
  material: string;
  material_id: string | null;
  quantity: number;
  price: number | null;
  notes: string | null;
  status: OrderStatus | null;
  priority: OrderPriority | null;
  estimated_delivery: string | null;
  created_at: string | null;
  updated_at: string | null;
  color: string | null;
  infill_percentage: number | null;
  layer_height: number | null;
  support_required: boolean | null;
  post_processing: string[] | null;
  estimated_weight: number | null;
  estimated_volume: number | null;
  estimated_print_time: number | null;
  production_notes: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancelled_reason: string | null;
  assigned_to: string | null;
  manufacturing_process_id: string | null;
  sub_process: string | null;
  design_units: DesignUnits | null;
  material_type_id: string | null;
  material_variant_id: string | null;
  selected_color: string | null;
  surface_finish_id: string | null;
  technical_drawing_path: string | null;
  has_threads: boolean | null;
  threads_description: string | null;
  has_inserts: boolean | null;
  inserts_description: string | null;
  tolerance_type: ToleranceType | null;
  tolerance_description: string | null;
  surface_roughness: string | null;
  part_marking_id: string | null;
  has_assembly: boolean | null;
  assembly_type: AssemblyType | null;
  finished_appearance: FinishedAppearance | null;
  inspection_type_id: string | null;
  itar_compliance: boolean | null;
  nda_acknowledged: boolean | null;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status: OrderStatus | null;
  new_status: OrderStatus | null;
  changed_by: string | null;
  change_notes: string | null;
  changed_at: string;
}

export type BidStatus = 
  | 'active'
  | 'withdrawn'
  | 'accepted'
  | 'rejected'
  | 'expired';

export interface Bid {
  id: string;
  order_id: string;
  vendor_id: string;
  bid_amount: number;
  estimated_delivery_days: number;
  notes: string | null;
  status: BidStatus | null;
  expires_at: string | null;
  submitted_at: string | null;
  vendor?: {
    company_name: string | null;
  } | null;
}

