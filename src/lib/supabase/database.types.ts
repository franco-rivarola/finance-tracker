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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          is_system: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          is_system?: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          is_system?: boolean
          name?: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          month_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          month_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          month_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          base_currency: Database["public"]["Enums"]["currency_code"]
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          base_currency?: Database["public"]["Enums"]["currency_code"]
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          base_currency?: Database["public"]["Enums"]["currency_code"]
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      saving_goals: {
        Row: {
          account_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          name: string
          target_amount: number
          target_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          id?: string
          name: string
          target_amount: number
          target_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          name?: string
          target_amount?: number
          target_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saving_goals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saving_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          base_amount: number
          category_id: string | null
          category_name_snapshot: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          description: string
          exchange_rate: number
          id: string
          is_transfer: boolean
          transaction_date: string
          transfer_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          base_amount: number
          category_id?: string | null
          category_name_snapshot?: string | null
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          description?: string
          exchange_rate: number
          id?: string
          is_transfer?: boolean
          transaction_date: string
          transfer_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          base_amount?: number
          category_id?: string | null
          category_name_snapshot?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string
          exchange_rate?: number
          id?: string
          is_transfer?: boolean
          transaction_date?: string
          transfer_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          base_amount: number
          created_at: string
          description: string | null
          destination_amount: number
          destination_currency: Database["public"]["Enums"]["currency_code"]
          exchange_rate: number
          from_account_id: string
          id: string
          source_amount: number
          source_currency: Database["public"]["Enums"]["currency_code"]
          to_account_id: string
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_amount: number
          created_at?: string
          description?: string | null
          destination_amount: number
          destination_currency: Database["public"]["Enums"]["currency_code"]
          exchange_rate: number
          from_account_id: string
          id?: string
          source_amount: number
          source_currency: Database["public"]["Enums"]["currency_code"]
          to_account_id: string
          transaction_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_amount?: number
          created_at?: string
          description?: string | null
          destination_amount?: number
          destination_currency?: Database["public"]["Enums"]["currency_code"]
          exchange_rate?: number
          from_account_id?: string
          id?: string
          source_amount?: number
          source_currency?: Database["public"]["Enums"]["currency_code"]
          to_account_id?: string
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_account: {
        Args: { p_currency?: string; p_name: string; p_type: string }
        Returns: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          is_system: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_budget: {
        Args: { p_amount: number; p_category_id: string; p_month_start: string }
        Returns: {
          amount: number
          category_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          month_start: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "budgets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_category: {
        Args: { p_name: string; p_type: string }
        Returns: {
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "categories"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_saving_goal: {
        Args: {
          p_account_id: string
          p_currency: string
          p_name: string
          p_target_amount: number
          p_target_date: string
        }
        Returns: {
          account_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          name: string
          target_amount: number
          target_date: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "saving_goals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_transaction: {
        Args: {
          p_account_id: string
          p_amount: number
          p_category_id: string
          p_description?: string
          p_transaction_date: string
          p_type: string
        }
        Returns: {
          account_id: string
          amount: number
          base_amount: number
          category_id: string | null
          category_name_snapshot: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          description: string
          exchange_rate: number
          id: string
          is_transfer: boolean
          transaction_date: string
          transfer_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_transfer:
        | {
            Args: {
              p_base_amount: number
              p_description?: string
              p_destination_amount: number
              p_exchange_rate: number
              p_from_account_id: string
              p_source_amount: number
              p_to_account_id: string
              p_transaction_date: string
            }
            Returns: string
          }
        | {
            Args: {
              p_description?: string
              p_from_account_id: string
              p_source_amount: number
              p_to_account_id: string
              p_transaction_date: string
            }
            Returns: string
          }
      currency_to_ars_rate: { Args: { p_currency: string }; Returns: number }
      delete_account: { Args: { p_account_id: string }; Returns: string }
      delete_budget: { Args: { p_budget_id: string }; Returns: string }
      delete_category: { Args: { p_category_id: string }; Returns: string }
      delete_saving_goal: {
        Args: { p_saving_goal_id: string }
        Returns: string
      }
      delete_transaction: {
        Args: { p_transaction_id: string }
        Returns: string
      }
      get_account_available_balance: {
        Args: {
          p_account_id: string
          p_excluded_transaction_id?: string
          p_user_id: string
        }
        Returns: number
      }
      record_audit_event: {
        Args: {
          p_entity_id?: string
          p_entity_type?: string
          p_event_type: string
          p_metadata?: Json
          p_user_id?: string
        }
        Returns: undefined
      }
      seed_user_defaults: {
        Args: { p_base_currency?: string; p_user_id: string }
        Returns: undefined
      }
      update_account: {
        Args: { p_account_id: string; p_currency?: string; p_name: string }
        Returns: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          is_system: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_budget: {
        Args: {
          p_amount: number
          p_budget_id: string
          p_category_id: string
          p_month_start: string
        }
        Returns: {
          amount: number
          category_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          month_start: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "budgets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_category: {
        Args: { p_category_id: string; p_name: string }
        Returns: {
          created_at: string
          icon: string | null
          id: string
          is_system: boolean
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "categories"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_saving_goal: {
        Args: {
          p_account_id: string
          p_currency: string
          p_name: string
          p_saving_goal_id: string
          p_target_amount: number
          p_target_date: string
        }
        Returns: {
          account_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          name: string
          target_amount: number
          target_date: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "saving_goals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_transaction: {
        Args: {
          p_account_id: string
          p_amount: number
          p_category_id: string
          p_description?: string
          p_transaction_date: string
          p_transaction_id: string
          p_type: string
        }
        Returns: {
          account_id: string
          amount: number
          base_amount: number
          category_id: string | null
          category_name_snapshot: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          description: string
          exchange_rate: number
          id: string
          is_transfer: boolean
          transaction_date: string
          transfer_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      account_type: "cash" | "bank" | "card"
      currency_code: "ARS" | "USD" | "EUR"
      transaction_type: "income" | "expense"
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
      account_type: ["cash", "bank", "card"],
      currency_code: ["ARS", "USD", "EUR"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
