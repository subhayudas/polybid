import { supabase } from '@/integrations/supabase/client';
import type { Order, OrderStatus, OrderPriority, Bid } from '@/types/database';

/**
 * Fetches all orders visible to the current user based on RLS policies
 */
export async function fetchOrders(): Promise<Order[]> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to verify authentication status.');
    }

    if (!session) {
      throw new Error('You must be authenticated to view orders.');
    }

    console.log('Fetching orders for user:', session.user.id);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    console.log('Successfully fetched', data?.length || 0, 'orders');
    return (data || []) as Order[];
  } catch (error) {
    console.error('Unexpected error in fetchOrders:', error);
    throw error;
  }
}

/**
 * Fetches a single order by ID
 */
export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  return data as Order;
}

/**
 * Fetches orders for a specific user
 */
export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user orders: ${error.message}`);
  }

  return (data || []) as Order[];
}

/**
 * Fetches orders assigned to a specific vendor
 */
export async function fetchVendorOrders(vendorId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('assigned_to', vendorId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vendor orders: ${error.message}`);
  }

  return (data || []) as Order[];
}

/**
 * Fetches orders by status
 */
export async function fetchOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders by status: ${error.message}`);
  }

  return (data || []) as Order[];
}

/**
 * Fetches orders by priority
 */
export async function fetchOrdersByPriority(priority: OrderPriority): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('priority', priority)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders by priority: ${error.message}`);
  }

  return (data || []) as Order[];
}

/**
 * Creates a new order
 */
export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('You must be authenticated to create an order.');
  }

  // Ensure user_id is set to current user
  const orderWithUser = {
    ...orderData,
    user_id: session.user.id,
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(orderWithUser)
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return data as Order;
}

/**
 * Updates an existing order
 */
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    throw new Error(`Failed to update order: ${error.message}`);
  }

  return data as Order;
}

/**
 * Updates order status
 */
export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus,
  notes?: string
): Promise<Order> {
  const updates: Partial<Order> = { status };
  
  if (notes) {
    updates.production_notes = notes;
  }

  // Update timestamps based on status
  if (status === 'shipped') {
    updates.shipped_at = new Date().toISOString();
  } else if (status === 'delivered') {
    updates.delivered_at = new Date().toISOString();
  } else if (status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString();
  }

  return updateOrder(orderId, updates);
}

/**
 * Assigns an order to a vendor
 */
export async function assignOrderToVendor(orderId: string, vendorId: string): Promise<Order> {
  return updateOrder(orderId, { 
    assigned_to: vendorId,
    status: 'confirmed' as OrderStatus
  });
}

/**
 * Fetches all bids for a specific order
 */
export async function fetchOrderBids(orderId: string): Promise<Bid[]> {
  const { data, error } = await supabase
    .from('bids')
    .select(`
      id,
      order_id,
      vendor_id,
      bid_amount,
      estimated_delivery_days,
      notes,
      status,
      expires_at,
      submitted_at,
      vendor:vendor_profiles(company_name)
    `)
    .eq('order_id', orderId)
    .order('submitted_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch order bids: ${error.message}`);
  }

  return (data || []) as Bid[];
}

/**
 * Places a bid on an order
 */
export async function placeBid(
  orderId: string,
  bidAmount: number,
  estimatedDeliveryDays: number,
  notes?: string,
  expiresAt?: string
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('You must be authenticated to place a bid.');
  }

  const payload = {
    order_id: orderId,
    vendor_id: session.user.id,
    bid_amount: bidAmount,
    estimated_delivery_days: estimatedDeliveryDays,
    notes: notes || null,
    expires_at: expiresAt || null,
  };

  const { error } = await supabase.from('bids').insert(payload);
  
  if (error) {
    throw new Error(`Failed to place bid: ${error.message}`);
  }
}

/**
 * Fetches order status history
 */
export async function fetchOrderStatusHistory(orderId: string) {
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('changed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch order history: ${error.message}`);
  }

  return data || [];
}

/**
 * Deletes an order (soft delete by setting status to cancelled)
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<Order> {
  return updateOrder(orderId, {
    status: 'cancelled' as OrderStatus,
    cancelled_at: new Date().toISOString(),
    cancelled_reason: reason || null,
  });
}

/**
 * Gets order statistics
 */
export async function getOrderStatistics() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be authenticated to view statistics.');
    }

    // Fetch all orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, priority, created_at');

    if (error) {
      throw new Error(`Failed to fetch order statistics: ${error.message}`);
    }

    const stats = {
      total: orders?.length || 0,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      recent: 0, // Last 7 days
    };

    if (orders) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      orders.forEach(order => {
        // Count by status
        const status = order.status || 'unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // Count by priority
        const priority = order.priority || 'unknown';
        stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

        // Count recent orders
        if (order.created_at && new Date(order.created_at) >= oneWeekAgo) {
          stats.recent++;
        }
      });
    }

    return stats;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
}



