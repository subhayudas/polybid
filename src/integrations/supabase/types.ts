export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bid_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string
          related_bid_id: string | null
          related_order_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id: string
          related_bid_id?: string | null
          related_order_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string
          related_bid_id?: string | null
          related_order_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_notifications_related_bid_id_fkey"
            columns: ["related_bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          }
        ]
      }
      bids: {
        Row: {
          bid_amount: number
          estimated_delivery_days: number
          expires_at: string | null
          id: string
          materials_breakdown: Json | null
          notes: string | null
          order_id: string
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          bid_amount: number
          estimated_delivery_days: number
          expires_at?: string | null
          id?: string
          materials_breakdown?: Json | null
          notes?: string | null
          order_id: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          bid_amount?: number
          estimated_delivery_days?: number
          expires_at?: string | null
          id?: string
          materials_breakdown?: Json | null
          notes?: string | null
          order_id?: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_assignments: {
        Row: {
          actual_completion: string | null
          assigned_at: string | null
          completion_notes: string | null
          created_at: string | null
          expected_completion: string | null
          id: string
          order_id: string
          quality_rating: number | null
          status: string | null
          updated_at: string | null
          vendor_id: string
          winning_bid_id: string
        }
        Insert: {
          actual_completion?: string | null
          assigned_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          expected_completion?: string | null
          id?: string
          order_id: string
          quality_rating?: number | null
          status?: string | null
          updated_at?: string | null
          vendor_id: string
          winning_bid_id: string
        }
        Update: {
          actual_completion?: string | null
          assigned_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          expected_completion?: string | null
          id?: string
          order_id?: string
          quality_rating?: number | null
          status?: string | null
          updated_at?: string | null
          vendor_id?: string
          winning_bid_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_assignments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_assignments_winning_bid_id_fkey"
            columns: ["winning_bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          }
        ]
      }
      vendor_applications: {
        Row: {
          address: Json | null
          business_description: string | null
          business_email: string
          business_license: string | null
          capabilities: string[] | null
          certifications: string[] | null
          company_name: string
          created_at: string | null
          id: string
          materials_offered: string[] | null
          phone: string | null
          portfolio_urls: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          business_description?: string | null
          business_email: string
          business_license?: string | null
          capabilities?: string[] | null
          certifications?: string[] | null
          company_name: string
          created_at?: string | null
          id?: string
          materials_offered?: string[] | null
          phone?: string | null
          portfolio_urls?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          business_description?: string | null
          business_email?: string
          business_license?: string | null
          capabilities?: string[] | null
          certifications?: string[] | null
          company_name?: string
          created_at?: string | null
          id?: string
          materials_offered?: string[] | null
          phone?: string | null
          portfolio_urls?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      vendor_profiles: {
        Row: {
          address: Json | null
          business_email: string
          business_license: string | null
          capabilities: string[] | null
          certifications: string[] | null
          company_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          materials_offered: string[] | null
          phone: string | null
          rating: number | null
          tax_id: string | null
          total_orders_completed: number | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          business_email: string
          business_license?: string | null
          capabilities?: string[] | null
          certifications?: string[] | null
          company_name: string
          created_at?: string | null
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          materials_offered?: string[] | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          total_orders_completed?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          business_email?: string
          business_license?: string | null
          capabilities?: string[] | null
          certifications?: string[] | null
          company_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          materials_offered?: string[] | null
          phone?: string | null
          rating?: number | null
          tax_id?: string | null
          total_orders_completed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      vendor_reviews: {
        Row: {
          communication_rating: number | null
          created_at: string | null
          delivery_rating: number | null
          id: string
          order_assignment_id: string
          quality_rating: number | null
          rating: number
          review_text: string | null
          reviewer_id: string
          vendor_id: string
        }
        Insert: {
          communication_rating?: number | null
          created_at?: string | null
          delivery_rating?: number | null
          id?: string
          order_assignment_id: string
          quality_rating?: number | null
          rating: number
          review_text?: string | null
          reviewer_id: string
          vendor_id: string
        }
        Update: {
          communication_rating?: number | null
          created_at?: string | null
          delivery_rating?: number | null
          id?: string
          order_assignment_id?: string
          quality_rating?: number | null
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_reviews_order_assignment_id_fkey"
            columns: ["order_assignment_id"]
            isOneToOne: false
            referencedRelation: "order_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_old_bids: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_vendor_rating: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Helper types for the polybid system
export type VendorProfile = Tables<'vendor_profiles'>
export type VendorApplication = Tables<'vendor_applications'>
export type Bid = Tables<'bids'>
export type OrderAssignment = Tables<'order_assignments'>
export type BidNotification = Tables<'bid_notifications'>
export type VendorReview = Tables<'vendor_reviews'>
