"use client";

import { createContext, useContext } from "react";
import type { SavingGoal } from "@/types/saving-goal";

type SavingGoalsContextValue = {
  savingGoals: SavingGoal[];
  addSavingGoal: (data: Omit<SavingGoal, "id">) => Promise<SavingGoal | null>;
  updateSavingGoal: (id: string, data: Omit<SavingGoal, "id">) => Promise<boolean>;
  deleteSavingGoal: (id: string) => Promise<void>;
};

const SavingGoalsContext = createContext<SavingGoalsContextValue | null>(null);

export const SavingGoalsProvider = ({
  value,
  children,
}: {
  value: SavingGoalsContextValue;
  children: React.ReactNode;
}) => (
  <SavingGoalsContext.Provider value={value}>{children}</SavingGoalsContext.Provider>
);

export const useSavingGoals = () => {
  const context = useContext(SavingGoalsContext);
  if (!context) throw new Error("useSavingGoals debe usarse dentro de SavingGoalsProvider");
  return context;
};
