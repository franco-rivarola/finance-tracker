"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Budget } from "@/types/budget";

type BudgetsContextType = {
  budgets: Budget[];
  addBudget: (data: Omit<Budget, "id">) => boolean;
  updateBudget: (id: string, data: Omit<Budget, "id">) => boolean;
  deleteBudget: (id: string) => void;
};

const BudgetsContext = createContext<BudgetsContextType | null>(null);
const STORAGE_KEY = "budgets";

const isValidBudget = (value: unknown): value is Budget => {
  if (!value || typeof value !== "object") return false;

  const budget = value as Partial<Budget>;

  return Boolean(
    budget.id &&
      budget.categoryId &&
      typeof budget.amount === "number" &&
      budget.month
  );
};

export const BudgetsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed) && parsed.every(isValidBudget)) {
        setBudgets(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const addBudget = (data: Omit<Budget, "id">) => {
    const exists = budgets.some(
      (budget) =>
        budget.categoryId === data.categoryId && budget.month === data.month
    );

    if (exists) {
      alert("Ya existe un presupuesto para esa categoría en ese mes");
      return false;
    }

    setBudgets((prev) => [...prev, { id: uuid(), ...data }]);
    return true;
  };

  const updateBudget = (id: string, data: Omit<Budget, "id">) => {
    const exists = budgets.some(
      (item) =>
        item.id !== id &&
        item.categoryId === data.categoryId &&
        item.month === data.month
    );

    if (exists) {
      alert("Ya existe un presupuesto para esa categoría en ese mes");
      return false;
    }

    setBudgets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    return true;
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id));
  };

  return (
    <BudgetsContext.Provider value={{ budgets, addBudget, updateBudget, deleteBudget }}>
      {children}
    </BudgetsContext.Provider>
  );
};

export const useBudgets = () => {
  const ctx = useContext(BudgetsContext);
  if (!ctx) throw new Error("useBudgets fuera de provider");
  return ctx;
};
