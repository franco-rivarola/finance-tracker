"use client";

import { createContext, useContext } from "react";
import type { Transaction, TransactionInput } from "@/types/transaction";

type TransactionsContextValue = {
  transactions: Transaction[];
  addTransaction: (data: TransactionInput) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, data: TransactionInput) => Promise<boolean>;
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
};

const TransactionsContext = createContext<TransactionsContextValue | null>(null);

export const TransactionsProvider = ({
  value,
  children,
}: {
  value: TransactionsContextValue;
  children: React.ReactNode;
}) => (
  <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
);

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error("useTransactions debe usarse dentro de TransactionsProvider");
  return context;
};
