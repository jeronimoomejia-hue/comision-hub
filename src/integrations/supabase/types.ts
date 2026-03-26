export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activation_codes: {
        Row: {
          assigned_to_sale_id: string | null
          code: string
          code_type: Database["public"]["Enums"]["code_type"]
          created_at: string
          delivered_at: string | null
          id: string
          password: string | null
          service_id: string
          status: Database["public"]["Enums"]["code_status"]
          username: string | null
        }
        Insert: {
          assigned_to_sale_id?: string | null
          code: string
          code_type?: Database["public"]["Enums"]["code_type"]
          created_at?: string
          delivered_at?: string | null
          id?: string
          password?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["code_status"]
          username?: string | null
        }
        Update: {
          assigned_to_sale_id?: string | null
          code?: string
          code_type?: Database["public"]["Enums"]["code_type"]
          created_at?: string
          delivered_at?: string | null
          id?: string
          password?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["code_status"]
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activation_codes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          facebook: string | null
          id: string
          industry: string | null
          instagram: string | null
          logo_url: string | null
          name: string
          owner_id: string
          plan: Database["public"]["Enums"]["company_plan"]
          preferred_channel: string | null
          primary_color: string | null
          secondary_color: string | null
          sla_response: string | null
          status: Database["public"]["Enums"]["entity_status"]
          support_hours: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          facebook?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          plan?: Database["public"]["Enums"]["company_plan"]
          preferred_channel?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sla_response?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          support_hours?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          facebook?: string | null
          id?: string
          industry?: string | null
          instagram?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          plan?: Database["public"]["Enums"]["company_plan"]
          preferred_channel?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sla_response?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          support_hours?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          company_id: string
          created_at: string
          discount_pct: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          service_id: string | null
          used_count: number
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          discount_pct: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          service_id?: string | null
          used_count?: number
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          discount_pct?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          service_id?: string | null
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_packages: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          price_cop: number
          sold_at: string | null
          sold_to: string | null
          status: Database["public"]["Enums"]["lead_package_status"]
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_cop?: number
          sold_at?: string | null
          sold_to?: string | null
          status?: Database["public"]["Enums"]["lead_package_status"]
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_cop?: number
          sold_at?: string | null
          sold_to?: string | null
          status?: Database["public"]["Enums"]["lead_package_status"]
        }
        Relationships: [
          {
            foreignKeyName: "lead_packages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          context: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          package_id: string
          phone: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          package_id: string
          phone: string
        }
        Update: {
          context?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          package_id?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "lead_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cop: number
          bank_reference: string | null
          created_at: string
          id: string
          period_end: string | null
          period_start: string | null
          recipient_id: string
          recipient_type: string
          status: string
        }
        Insert: {
          amount_cop: number
          bank_reference?: string | null
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          recipient_id: string
          recipient_type: string
          status?: string
        }
        Update: {
          amount_cop?: number
          bank_reference?: string | null
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          recipient_id?: string
          recipient_type?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prospects: {
        Row: {
          context: string | null
          created_at: string
          email: string | null
          follow_up_date: string | null
          from_lead_package: boolean
          id: string
          name: string
          notes: Json | null
          phone: string | null
          service_id: string | null
          stage: Database["public"]["Enums"]["prospect_stage"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          email?: string | null
          follow_up_date?: string | null
          from_lead_package?: boolean
          id?: string
          name: string
          notes?: Json | null
          phone?: string | null
          service_id?: string | null
          stage?: Database["public"]["Enums"]["prospect_stage"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          email?: string | null
          follow_up_date?: string | null
          from_lead_package?: boolean
          id?: string
          name?: string
          notes?: Json | null
          phone?: string | null
          service_id?: string | null
          stage?: Database["public"]["Enums"]["prospect_stage"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospects_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          activation_code_id: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          company_id: string
          coupon_code: string | null
          coupon_discount_pct: number | null
          created_at: string
          gross_amount: number
          hold_end_at: string | null
          hold_start_at: string | null
          id: string
          is_subscription: boolean
          mensualista_fee_amount: number
          mp_payment_id: string | null
          payment_provider: string | null
          provider_net_amount: number
          seller_commission_amount: number
          service_id: string
          status: Database["public"]["Enums"]["sale_status"]
          subscription_active: boolean | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          activation_code_id?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          company_id: string
          coupon_code?: string | null
          coupon_discount_pct?: number | null
          created_at?: string
          gross_amount: number
          hold_end_at?: string | null
          hold_start_at?: string | null
          id?: string
          is_subscription?: boolean
          mensualista_fee_amount?: number
          mp_payment_id?: string | null
          payment_provider?: string | null
          provider_net_amount?: number
          seller_commission_amount?: number
          service_id: string
          status?: Database["public"]["Enums"]["sale_status"]
          subscription_active?: boolean | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          activation_code_id?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          company_id?: string
          coupon_code?: string | null
          coupon_discount_pct?: number | null
          created_at?: string
          gross_amount?: number
          hold_end_at?: string | null
          hold_start_at?: string | null
          id?: string
          is_subscription?: boolean
          mensualista_fee_amount?: number
          mp_payment_id?: string | null
          payment_provider?: string | null
          provider_net_amount?: number
          seller_commission_amount?: number
          service_id?: string
          status?: Database["public"]["Enums"]["sale_status"]
          subscription_active?: boolean | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_activation_code_id_fkey"
            columns: ["activation_code_id"]
            isOneToOne: false
            referencedRelation: "activation_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          additional_notes: string | null
          auto_refund: boolean
          category: string | null
          code_type: Database["public"]["Enums"]["code_type"] | null
          company_id: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          mensualista_pct: number | null
          name: string
          objections: string | null
          pitch: string | null
          price_cop: number
          refund_window_days: number
          sales_material_urls: string[] | null
          status: Database["public"]["Enums"]["service_status"]
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string
          vendor_commission_pct: number
        }
        Insert: {
          additional_notes?: string | null
          auto_refund?: boolean
          category?: string | null
          code_type?: Database["public"]["Enums"]["code_type"] | null
          company_id: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mensualista_pct?: number | null
          name: string
          objections?: string | null
          pitch?: string | null
          price_cop?: number
          refund_window_days?: number
          sales_material_urls?: string[] | null
          status?: Database["public"]["Enums"]["service_status"]
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
          vendor_commission_pct?: number
        }
        Update: {
          additional_notes?: string | null
          auto_refund?: boolean
          category?: string | null
          code_type?: Database["public"]["Enums"]["code_type"] | null
          company_id?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mensualista_pct?: number | null
          name?: string
          objections?: string | null
          pitch?: string | null
          price_cop?: number
          refund_window_days?: number
          sales_material_urls?: string[] | null
          status?: Database["public"]["Enums"]["service_status"]
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
          vendor_commission_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          chapters: Json | null
          created_at: string
          description: string | null
          id: string
          service_id: string
          title: string
          updated_at: string
        }
        Insert: {
          chapters?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          service_id: string
          title: string
          updated_at?: string
        }
        Update: {
          chapters?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          service_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_company_links: {
        Row: {
          company_id: string
          id: string
          joined_at: string
          status: Database["public"]["Enums"]["entity_status"]
          training_completed: boolean
          vendor_id: string
        }
        Insert: {
          company_id: string
          id?: string
          joined_at?: string
          status?: Database["public"]["Enums"]["entity_status"]
          training_completed?: boolean
          vendor_id: string
        }
        Update: {
          company_id?: string
          id?: string
          joined_at?: string
          status?: Database["public"]["Enums"]["entity_status"]
          training_completed?: boolean
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_company_links_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_training_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_chapters: number[] | null
          created_at: string
          id: string
          quiz_scores: Json | null
          training_id: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_chapters?: number[] | null
          created_at?: string
          id?: string
          quiz_scores?: Json | null
          training_id: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_chapters?: number[] | null
          created_at?: string
          id?: string
          quiz_scores?: Json | null
          training_id?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_training_progress_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "vendor" | "company" | "admin"
      code_status: "available" | "delivered" | "expired"
      code_type: "code" | "link" | "credentials"
      company_plan: "freemium" | "premium" | "enterprise"
      entity_status: "active" | "paused" | "blocked"
      lead_package_status: "active" | "sold"
      prospect_stage:
        | "sin_contactar"
        | "contactado"
        | "interesado"
        | "negociando"
        | "cerrado"
      sale_status: "PENDING" | "HELD" | "COMPLETED" | "REFUNDED" | "CANCELLED"
      service_status: "activo" | "inactivo" | "borrador"
      service_type: "suscripción" | "puntual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["vendor", "company", "admin"],
      code_status: ["available", "delivered", "expired"],
      code_type: ["code", "link", "credentials"],
      company_plan: ["freemium", "premium", "enterprise"],
      entity_status: ["active", "paused", "blocked"],
      lead_package_status: ["active", "sold"],
      prospect_stage: [
        "sin_contactar",
        "contactado",
        "interesado",
        "negociando",
        "cerrado",
      ],
      sale_status: ["PENDING", "HELD", "COMPLETED", "REFUNDED", "CANCELLED"],
      service_status: ["activo", "inactivo", "borrador"],
      service_type: ["suscripción", "puntual"],
    },
  },
} as const
