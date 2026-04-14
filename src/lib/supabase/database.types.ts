export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          base_currency: "ARS" | "USD" | "EUR";
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          base_currency?: "ARS" | "USD" | "EUR";
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          base_currency?: "ARS" | "USD" | "EUR";
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "cash" | "bank" | "card";
          currency: "ARS" | "USD" | "EUR";
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "cash" | "bank" | "card";
          currency?: "ARS" | "USD" | "EUR";
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "cash" | "bank" | "card";
          currency?: "ARS" | "USD" | "EUR";
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          icon: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          icon?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "income" | "expense";
          icon?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      transfers: {
        Row: {
          id: string;
          user_id: string;
          from_account_id: string;
          to_account_id: string;
          description: string | null;
          transaction_date: string;
          source_amount: string;
          source_currency: "ARS" | "USD" | "EUR";
          destination_amount: string;
          destination_currency: "ARS" | "USD" | "EUR";
          exchange_rate: string;
          base_amount: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          from_account_id: string;
          to_account_id: string;
          description?: string | null;
          transaction_date: string;
          source_amount: string;
          source_currency: "ARS" | "USD" | "EUR";
          destination_amount: string;
          destination_currency: "ARS" | "USD" | "EUR";
          exchange_rate: string;
          base_amount: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          from_account_id?: string;
          to_account_id?: string;
          description?: string | null;
          transaction_date?: string;
          source_amount?: string;
          source_currency?: "ARS" | "USD" | "EUR";
          destination_amount?: string;
          destination_currency?: "ARS" | "USD" | "EUR";
          exchange_rate?: string;
          base_amount?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          category_id: string | null;
          transfer_id: string | null;
          type: "income" | "expense";
          amount: string;
          currency: "ARS" | "USD" | "EUR";
          exchange_rate: string;
          base_amount: string;
          description: string;
          transaction_date: string;
          is_transfer: boolean;
          category_name_snapshot: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          category_id?: string | null;
          transfer_id?: string | null;
          type: "income" | "expense";
          amount: string;
          currency: "ARS" | "USD" | "EUR";
          exchange_rate: string;
          base_amount: string;
          description?: string;
          transaction_date: string;
          is_transfer?: boolean;
          category_name_snapshot?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          category_id?: string | null;
          transfer_id?: string | null;
          type?: "income" | "expense";
          amount?: string;
          currency?: "ARS" | "USD" | "EUR";
          exchange_rate?: string;
          base_amount?: string;
          description?: string;
          transaction_date?: string;
          is_transfer?: boolean;
          category_name_snapshot?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          month_start: string;
          amount: string;
          currency: "ARS" | "USD" | "EUR";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          month_start: string;
          amount: string;
          currency?: "ARS" | "USD" | "EUR";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          month_start?: string;
          amount?: string;
          currency?: "ARS" | "USD" | "EUR";
          created_at?: string;
          updated_at?: string;
        };
      };
      saving_goals: {
        Row: {
          id: string;
          user_id: string;
          account_id: string;
          name: string;
          target_amount: string;
          currency: "ARS" | "USD" | "EUR";
          target_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          account_id: string;
          name: string;
          target_amount: string;
          currency: "ARS" | "USD" | "EUR";
          target_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          account_id?: string;
          name?: string;
          target_amount?: string;
          currency?: "ARS" | "USD" | "EUR";
          target_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      create_budget: {
        Args: {
          p_category_id: string;
          p_amount: number;
          p_month_start: string;
        };
        Returns: Database["public"]["Tables"]["budgets"]["Row"];
      };
      update_budget: {
        Args: {
          p_budget_id: string;
          p_category_id: string;
          p_amount: number;
          p_month_start: string;
        };
        Returns: Database["public"]["Tables"]["budgets"]["Row"];
      };
      delete_budget: {
        Args: {
          p_budget_id: string;
        };
        Returns: string;
      };
      create_category: {
        Args: {
          p_name: string;
          p_type: string;
        };
        Returns: Database["public"]["Tables"]["categories"]["Row"];
      };
      update_category: {
        Args: {
          p_category_id: string;
          p_name: string;
        };
        Returns: Database["public"]["Tables"]["categories"]["Row"];
      };
      delete_category: {
        Args: {
          p_category_id: string;
        };
        Returns: string;
      };
      create_account: {
        Args: {
          p_name: string;
          p_type: string;
          p_currency?: string | null;
        };
        Returns: Database["public"]["Tables"]["accounts"]["Row"];
      };
      update_account: {
        Args: {
          p_account_id: string;
          p_name: string;
          p_currency?: string | null;
        };
        Returns: Database["public"]["Tables"]["accounts"]["Row"];
      };
      delete_account: {
        Args: {
          p_account_id: string;
        };
        Returns: string;
      };
      create_transaction: {
        Args: {
          p_account_id: string;
          p_category_id: string;
          p_type: string;
          p_amount: number;
          p_transaction_date: string;
          p_description?: string | null;
        };
        Returns: Database["public"]["Tables"]["transactions"]["Row"];
      };
      update_transaction: {
        Args: {
          p_transaction_id: string;
          p_account_id: string;
          p_category_id: string;
          p_type: string;
          p_amount: number;
          p_transaction_date: string;
          p_description?: string | null;
        };
        Returns: Database["public"]["Tables"]["transactions"]["Row"];
      };
      delete_transaction: {
        Args: {
          p_transaction_id: string;
        };
        Returns: string;
      };
      create_saving_goal: {
        Args: {
          p_account_id: string;
          p_name: string;
          p_target_amount: number;
          p_target_date: string;
          p_currency: string;
        };
        Returns: Database["public"]["Tables"]["saving_goals"]["Row"];
      };
      update_saving_goal: {
        Args: {
          p_saving_goal_id: string;
          p_account_id: string;
          p_name: string;
          p_target_amount: number;
          p_target_date: string;
          p_currency: string;
        };
        Returns: Database["public"]["Tables"]["saving_goals"]["Row"];
      };
      delete_saving_goal: {
        Args: {
          p_saving_goal_id: string;
        };
        Returns: string;
      };
      create_transfer: {
        Args: {
          p_from_account_id: string;
          p_to_account_id: string;
          p_source_amount: number;
          p_transaction_date: string;
          p_description?: string | null;
        };
        Returns: string;
      };
    };
  };
};
