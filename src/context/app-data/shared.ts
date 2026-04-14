"use client";

import type { Dispatch, SetStateAction } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Account, CurrencyCode } from "@/types/account";
import type { Budget } from "@/types/budget";
import type { SavingGoal } from "@/types/saving-goal";
import type { Transaction, TransactionType } from "@/types/transaction";

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
export type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"];
export type SavingGoalRow = Database["public"]["Tables"]["saving_goals"]["Row"];

export type CategoryItem = {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  isSystem: boolean;
};

export type Setter<T> = Dispatch<SetStateAction<T>>;
export type AppDataClient = SupabaseClient<Database>;

export type RefreshDependencies = {
  db: AppDataClient;
  session: Session | null;
  setLoading: Setter<boolean>;
  setAccounts: Setter<Account[]>;
  setCategories: Setter<CategoryItem[]>;
  setTransactions: Setter<Transaction[]>;
  setBudgets: Setter<Budget[]>;
  setSavingGoals: Setter<SavingGoal[]>;
};

export const toMonthStart = (month: string) => `${month}-01`;
export const fromMonthStart = (value: string) => value.slice(0, 7);
export const parseNumeric = (value: string) => Number(value);

export const mapAccount = (row: AccountRow): Account => ({
  id: row.id,
  name: row.name,
  type: row.type,
  currency: row.currency as CurrencyCode,
  isSystem: row.is_system,
});

export const mapCategory = (row: CategoryRow): CategoryItem => ({
  id: row.id,
  name: row.name,
  type: row.type,
  icon: row.icon ?? undefined,
  isSystem: row.is_system,
});

export const mapBudget = (row: BudgetRow): Budget => ({
  id: row.id,
  categoryId: row.category_id,
  amount: parseNumeric(row.amount),
  month: fromMonthStart(row.month_start),
});

export const mapSavingGoal = (row: SavingGoalRow): SavingGoal => ({
  id: row.id,
  name: row.name,
  targetAmount: parseNumeric(row.target_amount),
  accountId: row.account_id,
  targetDate: row.target_date,
  currency: row.currency as CurrencyCode,
});

export const mapTransaction = (
  row: TransactionRow,
  categories: CategoryItem[]
): Transaction => {
  const category = row.is_transfer
    ? {
        id: "transfer",
        name: "Transferencia",
        type: row.type,
      }
    : categories.find((item) => item.id === row.category_id) ?? {
        id: row.category_id ?? "unknown",
        name: row.category_name_snapshot ?? "Sin categoría",
        type: row.type,
      };

  return {
    id: row.id,
    amount: parseNumeric(row.amount),
    currency: row.currency as CurrencyCode,
    baseAmount: parseNumeric(row.base_amount),
    exchangeRate: parseNumeric(row.exchange_rate),
    description: row.description,
    type: row.type,
    category,
    accountId: row.account_id,
    date: row.transaction_date,
  };
};

export const refreshAppData = async ({
  db,
  session,
  setLoading,
  setAccounts,
  setCategories,
  setTransactions,
  setBudgets,
  setSavingGoals,
}: RefreshDependencies) => {
  if (!session?.user.id) return;

  setLoading(true);

  const [
    accountsResult,
    categoriesResult,
    transactionsResult,
    budgetsResult,
    savingGoalsResult,
  ] = await Promise.all([
    db.from("accounts").select("*").order("created_at", { ascending: true }),
    db.from("categories").select("*").order("created_at", { ascending: true }),
    db.from("transactions")
      .select("*")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false }),
    db.from("budgets").select("*").order("month_start", { ascending: false }),
    db.from("saving_goals").select("*").order("created_at", { ascending: false }),
  ]);

  if (accountsResult.error) throw accountsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (transactionsResult.error) throw transactionsResult.error;
  if (budgetsResult.error) throw budgetsResult.error;
  if (savingGoalsResult.error) throw savingGoalsResult.error;

  const mappedCategories = categoriesResult.data.map((row: CategoryRow) => mapCategory(row));

  setAccounts(accountsResult.data.map((row: AccountRow) => mapAccount(row)));
  setCategories(mappedCategories);
  setTransactions(
    transactionsResult.data.map((row: TransactionRow) =>
      mapTransaction(row, mappedCategories)
    )
  );
  setBudgets(budgetsResult.data.map((row: BudgetRow) => mapBudget(row)));
  setSavingGoals(
    savingGoalsResult.data.map((row: SavingGoalRow) => mapSavingGoal(row))
  );
  setLoading(false);
};
