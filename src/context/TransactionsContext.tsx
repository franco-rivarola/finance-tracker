"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Transaction, TransactionInput } from "@/types/transaction";
import { useCategories } from "./CategoriesContext";
import { v4 as uuid } from "uuid";

type TransferInput = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description?: string;
};

type TransactionsContextType = {
  transactions: Transaction[];

  addTransaction: (data: TransactionInput) => boolean;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, data: TransactionInput) => boolean;
  getTransaction: (id: string) => Transaction | undefined;

  transferBetweenAccounts: (data: TransferInput) => void;

  getAccountBalance: (accountId: string) => number;

  // 🔥 NUEVO (CLAVE)
  getAccountBalanceFromList: (
    accountId: string,
    list: Transaction[]
  ) => number;
};

const TransactionsContext = createContext<TransactionsContextType | null>(null);

export const TransactionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { categories } = useCategories();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("transactions");
    if (stored) setTransactions(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const resolveCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) throw new Error("Categoría inválida");
    return category;
  };

  // 💰 BALANCE GLOBAL POR CUENTA
  const getAccountBalance = (accountId: string) => {
    return transactions.reduce((acc, t) => {
      if (t.accountId !== accountId) return acc;

      return t.type === "income"
        ? acc + t.amount
        : acc - t.amount;
    }, 0);
  };

  // 💰 BALANCE DESDE LISTA (FILTROS 🔥)
  const getAccountBalanceFromList = (
    accountId: string,
    list: Transaction[]
  ) => {
    return list.reduce((acc, t) => {
      if (t.accountId !== accountId) return acc;

      return t.type === "income"
        ? acc + t.amount
        : acc - t.amount;
    }, 0);
  };

  const addTransaction = (data: TransactionInput) => {
    if (
      data.type === "expense" &&
      data.amount > getAccountBalance(data.accountId)
    ) {
      alert("No tenés saldo suficiente en esa cuenta");
      return false;
    }

    const category = resolveCategory(data.categoryId);

    const newTransaction: Transaction = {
      ...data,
      id: uuid(),
      category,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    return true;
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (id: string, data: TransactionInput) => {
    const currentTransaction = getTransaction(id);
    if (!currentTransaction) return false;

    const projectedTransactions = transactions.filter((t) => t.id !== id);

    if (
      data.type === "expense" &&
      data.amount >
        getAccountBalanceFromList(data.accountId, projectedTransactions)
    ) {
      alert("No tenés saldo suficiente en esa cuenta");
      return false;
    }

    const category = resolveCategory(data.categoryId);

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...data, category } : t
      )
    );
    return true;
  };

  const getTransaction = (id: string) => {
    return transactions.find((t) => t.id === id);
  };

  // 💸 TRANSFERENCIA CON VALIDACIÓN
  const transferBetweenAccounts = ({
    fromAccountId,
    toAccountId,
    amount,
    date,
    description,
  }: TransferInput) => {
    if (fromAccountId === toAccountId) return;

    const balance = getAccountBalance(fromAccountId);

    if (amount > balance) {
      alert("No tenés saldo suficiente en la cuenta origen");
      return;
    }

    const transferCategory = {
      id: "transfer",
      name: "Transferencia",
      type: "expense" as const,
    };

    const outTransaction: Transaction = {
      id: uuid(),
      amount,
      description: description || "Transferencia enviada",
      type: "expense",
      category: transferCategory,
      accountId: fromAccountId,
      date,
    };

    const inTransaction: Transaction = {
      id: uuid(),
      amount,
      description: description || "Transferencia recibida",
      type: "income",
      category: transferCategory,
      accountId: toAccountId,
      date,
    };

    setTransactions((prev) => [
      inTransaction,
      outTransaction,
      ...prev,
    ]);
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        getTransaction,
        transferBetweenAccounts,
        getAccountBalance,
        getAccountBalanceFromList, // 🔥
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions fuera de provider");
  return ctx;
};
