import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VendorProfile, VendorApplication } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export const useVendorProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
};

export const useVendorApplication = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['vendor-application', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
};

export const useCreateVendorApplication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (applicationData: Omit<VendorApplication, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'reviewed_by' | 'reviewed_at' | 'review_notes'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vendor_applications')
        .insert({
          ...applicationData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-application', user?.id] });
    },
  });
};

export const useUpdateVendorProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profileData: Partial<VendorProfile>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vendor_profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile', user?.id] });
    },
  });
};
