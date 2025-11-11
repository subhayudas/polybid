-- =====================================================
-- INSERT TEST ORDERS
-- Run this AFTER creating the orders table
-- This will create sample orders you can see on the website
-- =====================================================

-- Insert 3 test orders for the current logged-in user
INSERT INTO public.orders (
  user_id,
  file_name,
  material,
  quantity,
  price,
  notes,
  status,
  priority,
  estimated_delivery
) VALUES
(
  auth.uid(),
  'gear_assembly.stl',
  'PLA Plastic',
  25,
  249.99,
  'Urgent order for prototype testing. Need high quality finish.',
  'pending',
  'urgent',
  CURRENT_DATE + INTERVAL '3 days'
),
(
  auth.uid(),
  'mounting_bracket.step',
  'Aluminum 6061',
  100,
  1499.99,
  'Production run for client project. Standard tolerances acceptable.',
  'confirmed',
  'high',
  CURRENT_DATE + INTERVAL '10 days'
),
(
  auth.uid(),
  'custom_housing.stl',
  'ABS Plastic',
  50,
  899.99,
  'Custom housing parts with logo embossing required.',
  'in_production',
  'normal',
  CURRENT_DATE + INTERVAL '7 days'
);

-- Verify the orders were created
SELECT 
  order_number,
  file_name,
  material,
  quantity,
  price,
  status,
  priority,
  created_at
FROM public.orders
ORDER BY created_at DESC;

-- =====================================================
-- DONE! Test orders created
-- Now refresh your website at /orders to see them!
-- =====================================================


