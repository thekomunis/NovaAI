export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          order_id: string;
          invoice_token: string;
          product_slug: string;
          product_name: string;
          variant_id: string;
          variant_name: string;
          price: number;
          unique_code: number;
          total_amount: number;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          payment_method: string;
          status: string;
          fulfillment_status: string;
          admin_note: string | null;
          paid_at: string | null;
          paid_by: string | null;
          created_at: string;
          updated_at: string;
          expires_at: string;
          idempotency_key: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          invoice_token: string;
          product_slug: string;
          product_name: string;
          variant_id: string;
          variant_name: string;
          price: number;
          unique_code: number;
          total_amount: number;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          payment_method: string;
          status?: string;
          fulfillment_status?: string;
          admin_note?: string | null;
          paid_at?: string | null;
          paid_by?: string | null;
          created_at?: string;
          updated_at?: string;
          expires_at: string;
          idempotency_key?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          invoice_token?: string;
          product_slug?: string;
          product_name?: string;
          variant_id?: string;
          variant_name?: string;
          price?: number;
          unique_code?: number;
          total_amount?: number;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          payment_method?: string;
          status?: string;
          fulfillment_status?: string;
          admin_note?: string | null;
          paid_at?: string | null;
          paid_by?: string | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
          idempotency_key?: string | null;
        };
        Relationships: [];
      };
      social_proof_events: {
        Row: {
          id: string;
          masked_name: string;
          product_name: string;
          variant_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          masked_name: string;
          product_name: string;
          variant_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          masked_name?: string;
          product_name?: string;
          variant_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_next_order_counter: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
