import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Since orders come from the main polyform system, we'll need to connect to that database
// For now, we'll create a mock structure that matches what we expect

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  file_name: string;
  material: string;
  quantity: number;
  price?: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'quality_check' | 'shipped' | 'delivered' | 'cancelled' | 'on_hold';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimated_delivery?: string;
  manufacturing_process_id?: string;
  material_variant_id?: string;
  surface_finish_id?: string;
  created_at: string;
  updated_at: string;
  // Additional fields from comprehensive system
  design_units?: string;
  selected_color?: string;
  has_threads?: boolean;
  threads_description?: string;
  has_inserts?: boolean;
  inserts_description?: string;
  tolerance_type?: string;
  tolerance_description?: string;
  part_marking_id?: string;
  has_assembly?: boolean;
  assembly_type?: string;
  finished_appearance?: string;
  inspection_type_id?: string;
}

export const useAvailableOrders = () => {
  return useQuery({
    queryKey: ['available-orders'],
    queryFn: async () => {
      // This would typically fetch from the main polyform database
      // For now, we'll return mock data
      const mockOrders: Order[] = [
        {
          id: '1',
          order_number: 'ORD-001',
          user_id: 'user-1',
          file_name: 'gear_assembly.stl',
          material: 'Aluminum 6061',
          quantity: 5,
          price: 150.00,
          notes: 'High precision required for gear teeth',
          status: 'pending',
          priority: 'high',
          estimated_delivery: '2025-02-01',
          created_at: '2025-01-17T10:00:00Z',
          updated_at: '2025-01-17T10:00:00Z',
          design_units: 'mm',
          selected_color: 'Silver white',
          has_threads: true,
          threads_description: 'M6 x 1.0 threads on mounting holes',
          tolerance_type: 'tighter',
          finished_appearance: 'premium'
        },
        {
          id: '2',
          order_number: 'ORD-002',
          user_id: 'user-2',
          file_name: 'bracket_v2.step',
          material: 'Stainless Steel 316L',
          quantity: 10,
          price: 280.00,
          notes: 'Food grade application, requires passivation',
          status: 'pending',
          priority: 'normal',
          estimated_delivery: '2025-02-05',
          created_at: '2025-01-17T11:30:00Z',
          updated_at: '2025-01-17T11:30:00Z',
          design_units: 'mm',
          selected_color: 'Natural',
          has_inserts: true,
          inserts_description: 'Threaded inserts for M4 screws',
          tolerance_type: 'standard',
          finished_appearance: 'standard'
        },
        {
          id: '3',
          order_number: 'ORD-003',
          user_id: 'user-3',
          file_name: 'prototype_housing.stl',
          material: 'ABS Black',
          quantity: 2,
          price: 85.00,
          notes: 'Prototype for testing, standard tolerances acceptable',
          status: 'pending',
          priority: 'low',
          estimated_delivery: '2025-01-25',
          created_at: '2025-01-17T14:15:00Z',
          updated_at: '2025-01-17T14:15:00Z',
          design_units: 'mm',
          selected_color: 'Black',
          tolerance_type: 'standard',
          finished_appearance: 'standard'
        }
      ];

      return mockOrders;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for new orders
  });
};

export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      // This would fetch detailed order information from the main system
      // Including files, specifications, etc.
      const mockOrderDetails = {
        id: orderId,
        // ... other order details
        files: [
          {
            id: 'file-1',
            name: 'main_model.stl',
            type: 'model',
            size: 2048576,
            url: '/mock-file-url'
          }
        ],
        specifications: {
          dimensions: '100mm x 50mm x 25mm',
          weight: '150g estimated',
          complexity: 'Medium'
        }
      };

      return mockOrderDetails;
    },
    enabled: !!orderId,
  });
};
