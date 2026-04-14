"use client";

import { createContext, useContext } from "react";
import type { Budget } from "@/types/budget";

type BudgetsContextValue = {
  budgets: Budget[];
  addBudget: (data: Omit<Budget, "id">) => Promise<boolean>;
  updateBudget: (id: string, data: Omit<Budget, "id">) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<void>;
};

const BudgetsContext = createContext<BudgetsContextValue | null>(null);

export const BudgetsProvider = ({
  value,
  children,
}: {
  value: BudgetsContextValue;
  children: React.ReactNode;
}) => <BudgetsContext.Provider value={value}>{children}</BudgetsContext.Provider>;

export const useBudgets = () => {
  const context = useContext(BudgetsContext);
  if (!context) throw new Error("useBudgets debe usarse dentro de BudgetsProvider");
  return context;
};
