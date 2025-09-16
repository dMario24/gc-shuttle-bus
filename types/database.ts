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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      gsb_boarding_records: {
        Row: {
          boarded_at: string
          created_at: string
          id: string
          reservation_id: string
        }
        Insert: {
          boarded_at?: string
          created_at?: string
          id?: string
          reservation_id: string
        }
        Update: {
          boarded_at?: string
          created_at?: string
          id?: string
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gsb_boarding_records_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "gsb_reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      gsb_companies: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      gsb_reservations: {
        Row: {
          created_at: string
          id: string
          qr_code: string | null
          reservation_date: string
          schedule_id: string
          status: Database["public"]["Enums"]["gsb_reservation_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          qr_code?: string | null
          reservation_date: string
          schedule_id: string
          status?: Database["public"]["Enums"]["gsb_reservation_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          qr_code?: string | null
          reservation_date?: string
          schedule_id?: string
          status?: Database["public"]["Enums"]["gsb_reservation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gsb_reservations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "gsb_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gsb_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "gsb_users"
            referencedColumns: ["id"]
          },
        ]
      }
      gsb_rewards: {
        Row: {
          coupon_code: string
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          user_id: string
        }
        Insert: {
          coupon_code: string
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean
          user_id: string
        }
        Update: {
          coupon_code?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gsb_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "gsb_users"
            referencedColumns: ["id"]
          },
        ]
      }
      gsb_routes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      gsb_schedules: {
        Row: {
          created_at: string
          departure_time: string
          id: string
          is_active: boolean
          route_id: string
          total_seats: number
        }
        Insert: {
          created_at?: string
          departure_time: string
          id?: string
          is_active?: boolean
          route_id: string
          total_seats?: number
        }
        Update: {
          created_at?: string
          departure_time?: string
          id?: string
          is_active?: boolean
          route_id?: string
          total_seats?: number
        }
        Relationships: [
          {
            foreignKeyName: "gsb_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "gsb_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      gsb_stops: {
        Row: {
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          route_id: string
          stop_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          route_id: string
          stop_order: number
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          route_id?: string
          stop_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gsb_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "gsb_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      gsb_users: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_approved: boolean
          phone_number: string | null
          role: Database["public"]["Enums"]["gsb_user_role"]
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_approved?: boolean
          phone_number?: string | null
          role?: Database["public"]["Enums"]["gsb_user_role"]
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_approved?: boolean
          phone_number?: string | null
          role?: Database["public"]["Enums"]["gsb_user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "gsb_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "gsb_companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gsb_reservation_status: "confirmed" | "cancelled" | "completed"
      gsb_user_role: "employee" | "company_admin" | "operations_admin"
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
      gsb_reservation_status: ["confirmed", "cancelled", "completed"],
      gsb_user_role: ["employee", "company_admin", "operations_admin"],
    },
  },
} as const
