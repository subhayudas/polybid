import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bid } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderBids = (orderId: string) => {
  return useQuery({
    queryKey: ['order-bids', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          vendor_profiles (
            company_name,
            rating,
            total_orders_completed,
            capabilities,
            materials_offered
          )
        `)
        .eq('order_id', orderId)
        .eq('status', 'active')
        .order('bid_amount', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
};

export const useVendorBids = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor-bids', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('vendor_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateBid = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bidData: {
      order_id: string;
      bid_amount: number;
      estimated_delivery_days: number;
      notes?: string;
      materials_breakdown?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Set expiration to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('bids')
        .insert({
          ...bidData,
          vendor_id: user.id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['vendor-bids', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['order-bids', data.order_id] });
      
      // Create notification for order owner (would need to implement)
      // createBidNotification(data);
    },
  });
};

export const useUpdateBid = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bidId, updates }: { bidId: string; updates: Partial<Bid> }) => {
      const { data, error } = await supabase
        .from('bids')
        .update(updates)
        .eq('id', bidId)
        .eq('vendor_id', user?.id) // Ensure vendor can only update their own bids
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bids', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['order-bids', data.order_id] });
    },
  });
};

export const useWithdrawBid = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bidId: string) => {
      const { data, error } = await supabase
        .from('bids')
        .update({ status: 'withdrawn' })
        .eq('id', bidId)
        .eq('vendor_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bids', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['order-bids', data.order_id] });
    },
  });
};

export const useVendorOrderAssignments = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor-assignments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('order_assignments')
        .select(`
          *,
          bids (
            bid_amount,
            estimated_delivery_days,
            notes
          )
        `)
        .eq('vendor_id', user.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateOrderAssignment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      assignmentId, 
      updates 
    }: { 
      assignmentId: string; 
      updates: {
        status?: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
        completion_notes?: string;
        actual_completion?: string;
      }
    }) => {
      const { data, error } = await supabase
        .from('order_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .eq('vendor_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-assignments', user?.id] });
    },
  });
};
