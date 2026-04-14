"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Account, AccountType, CurrencyCode } from "@/types/account";
import { Budget } from "@/types/budget";
import { SavingGoal } from "@/types/saving-goal";
import { Transaction, TransactionInput, TransactionType } from "@/types/transaction";
import { AccountsProvider } from "./AccountsContext";
import { AuthProvider } from "./AuthContext";
import { BudgetsProvider } from "./BudgetsContext";
import { CategoriesProvider } from "./CategoriesContext";
import {
  bootstrapAuth,
  signInWithPassword,
  signOutUser,
  signUpWithPassword,
  subscribeToAuth,
} from "./app-data/auth";
import {
  addAccountRecord,
  deleteAccountRecord,
  getAccountBalanceFromList,
  updateAccountRecord,
} from "./app-data/accounts";
import {
  addBudgetRecord,
  deleteBudgetRecord,
  updateBudgetRecord,
} from "./app-data/budgets";
import {
  addCategoryRecord,
  deleteCategoryRecord,
  updateCategoryRecord,
} from "./app-data/categories";
import {
  addSavingGoalRecord,
  deleteSavingGoalRecord,
  updateSavingGoalRecord,
} from "./app-data/savingGoals";
import { refreshAppData, type AppDataClient, type CategoryItem } from "./app-data/shared";
import {
  addTransactionRecord,
  deleteTransactionRecord,
  transferBetweenAccountsRecord,
  updateTransactionRecord,
} from "./app-data/transactions";
import { SavingGoalsProvider } from "./SavingGoalsContext";
import { TransactionsProvider } from "./TransactionsContext";

type AppDataContextType = {
  ready: boolean;
  loading: boolean;
  session: Session | null;
  authLoading: boolean;
  accounts: Account[];
  categories: CategoryItem[];
  transactions: Transaction[];
  budgets: Budget[];
  savingGoals: SavingGoal[];
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  addTransaction: (data: TransactionInput) => Promise<boolean>;
  updateTransaction: (id: string, data: TransactionInput) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransaction: (id: string) => Transaction | undefined;
  transferBetweenAccounts: (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    description?: string;
  }) => Promise<void>;
  getAccountBalance: (accountId: string) => number;
  getAccountBalanceFromList: (accountId: string, list: Transaction[]) => number;
  addAccount: (
    name: string,
    type: AccountType,
    currency?: CurrencyCode
  ) => Promise<Account | null>;
  updateAccount: (
    id: string,
    name: string,
    currency?: CurrencyCode
  ) => Promise<Account | null>;
  deleteAccount: (id: string) => Promise<boolean>;
  addCategory: (name: string, type: TransactionType) => Promise<boolean>;
  updateCategory: (id: string, name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  addBudget: (data: Omit<Budget, "id">) => Promise<boolean>;
  updateBudget: (id: string, data: Omit<Budget, "id">) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<void>;
  addSavingGoal: (data: Omit<SavingGoal, "id">) => Promise<SavingGoal | null>;
  updateSavingGoal: (id: string, data: Omit<SavingGoal, "id">) => Promise<boolean>;
  deleteSavingGoal: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const db: AppDataClient = supabase;
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);

  const resetAppData = useCallback(() => {
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
    setBudgets([]);
    setSavingGoals([]);
    setLoading(false);
  }, []);

  const refreshData = useCallback(
    async () =>
      refreshAppData({
        db,
        session,
        setLoading,
        setAccounts,
        setCategories,
        setTransactions,
        setBudgets,
        setSavingGoals,
      }),
    [db, session]
  );

  useEffect(() => {
    let active = true;

    bootstrapAuth({ active, setSession, setReady, setLoading }).catch((error) => {
      console.error("Supabase bootstrap failed", error);
      setReady(true);
      setLoading(false);
    });

    const { data: authListener } = subscribeToAuth({
      setSession,
      setReady,
      onSignedOut: resetAppData,
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [db, resetAppData]);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    refreshData().catch((error) => {
      console.error("Failed to refresh app data", error);
      setLoading(false);
    });
  }, [session?.user.id, refreshData]);

  const signIn = (email: string, password: string) =>
    signInWithPassword({ email, password, setAuthLoading });

  const signUp = (email: string, password: string) =>
    signUpWithPassword({ email, password, setAuthLoading });

  const signOut = () => signOutUser({ setAuthLoading });

  const getAccountBalance = (accountId: string) =>
    getAccountBalanceFromList(accountId, transactions);

  const addTransaction = (data: TransactionInput) =>
    addTransactionRecord({
      db,
      session,
      categories,
      transactions,
      setTransactions,
      data,
    });

  const updateTransaction = (id: string, data: TransactionInput) =>
    updateTransactionRecord({
      db,
      categories,
      transactions,
      setTransactions,
      id,
      data,
    });

  const deleteTransaction = (id: string) =>
    deleteTransactionRecord({ db, setTransactions, id });

  const getTransaction = (id: string) =>
    transactions.find((item) => item.id === id);

  const transferBetweenAccounts = ({
    fromAccountId,
    toAccountId,
    amount,
    date,
    description,
  }: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    description?: string;
  }) =>
    transferBetweenAccountsRecord({
      db,
      transactions,
      refreshData,
      fromAccountId,
      toAccountId,
      amount,
      date,
      description,
    });

  const addAccount = (
    name: string,
    type: AccountType,
    currency?: CurrencyCode
  ) =>
    addAccountRecord({ db, session, accounts, setAccounts, name, type, currency });

  const updateAccount = (
    id: string,
    name: string,
    currency?: CurrencyCode
  ) =>
    updateAccountRecord({ db, accounts, setAccounts, id, name, currency });

  const deleteAccount = (id: string) =>
    deleteAccountRecord({ db, accounts, transactions, setAccounts, id });

  const addCategory = (name: string, type: TransactionType) =>
    addCategoryRecord({ db, session, categories, setCategories, name, type });

  const updateCategory = (id: string, name: string) =>
    updateCategoryRecord({ db, categories, setCategories, id, name });

  const deleteCategory = (id: string) =>
    deleteCategoryRecord({ db, transactions, budgets, setCategories, id });

  const addBudget = (data: Omit<Budget, "id">) =>
    addBudgetRecord({ db, session, budgets, setBudgets, data });

  const updateBudget = (id: string, data: Omit<Budget, "id">) =>
    updateBudgetRecord({ db, budgets, setBudgets, id, data });

  const deleteBudget = (id: string) =>
    deleteBudgetRecord({ db, setBudgets, id });

  const addSavingGoal = (data: Omit<SavingGoal, "id">) =>
    addSavingGoalRecord({ db, session, setSavingGoals, data });

  const updateSavingGoal = (id: string, data: Omit<SavingGoal, "id">) =>
    updateSavingGoalRecord({ db, setSavingGoals, id, data });

  const deleteSavingGoal = (id: string) =>
    deleteSavingGoalRecord({ db, setSavingGoals, id });

  const value: AppDataContextType = {
    ready,
    loading,
    session,
    authLoading,
    accounts,
    categories,
    transactions,
    budgets,
    savingGoals,
    signIn,
    signUp,
    signOut,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    transferBetweenAccounts,
    getAccountBalance,
    getAccountBalanceFromList,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addSavingGoal,
    updateSavingGoal,
    deleteSavingGoal,
    refreshData,
  };

  return (
    <AppDataContext.Provider value={value}>
      <AuthProvider
        value={{ ready, loading, session, authLoading, signIn, signUp, signOut }}
      >
        <AccountsProvider value={{ accounts, addAccount, updateAccount, deleteAccount }}>
          <CategoriesProvider
            value={{ categories, addCategory, updateCategory, deleteCategory }}
          >
            <BudgetsProvider value={{ budgets, addBudget, updateBudget, deleteBudget }}>
              <SavingGoalsProvider
                value={{
                  savingGoals,
                  addSavingGoal,
                  updateSavingGoal,
                  deleteSavingGoal,
                }}
              >
                <TransactionsProvider
                  value={{
                    transactions,
                    addTransaction,
                    deleteTransaction,
                    updateTransaction,
                    getTransaction,
                    transferBetweenAccounts,
                    getAccountBalance,
                    getAccountBalanceFromList,
                  }}
                >
                  {children}
                </TransactionsProvider>
              </SavingGoalsProvider>
            </BudgetsProvider>
          </CategoriesProvider>
        </AccountsProvider>
      </AuthProvider>
    </AppDataContext.Provider>
  );
}

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData fuera de provider");
  return context;
};
