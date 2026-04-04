"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Transaction, TransactionInput } from "@/types/transaction";
import { useCategories } from "./CategoriesContext";
import { v4 as uuid } from "uuid";

type TransactionsContextType = {
  transactions: Transaction[];
  addTransaction: (data: TransactionInput) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, data: TransactionInput) => void;
  getTransaction: (id: string) => Transaction | undefined; // ✅ FIX
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

  const addTransaction = (data: TransactionInput) => {
    const category = resolveCategory(data.categoryId);

    const newTransaction: Transaction = {
      ...data,
      id: uuid(),
      category,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTransaction = (id: string, data: TransactionInput) => {
    const category = resolveCategory(data.categoryId);

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...data, category } : t
      )
    );
  };

  // ✅ FIX CLAVE
  const getTransaction = (id: string) => {
    return transactions.find((t) => t.id === id);
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        getTransaction, // ✅ FIX
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