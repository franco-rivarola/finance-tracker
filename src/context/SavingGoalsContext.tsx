"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SavingGoal } from "@/types/saving-goal";
import { v4 as uuid } from "uuid";

type SavingGoalsContextType = {
  savingGoals: SavingGoal[];
  addSavingGoal: (data: Omit<SavingGoal, "id">) => SavingGoal;
  updateSavingGoal: (id: string, data: Omit<SavingGoal, "id">) => boolean;
  deleteSavingGoal: (id: string) => void;
};

const SavingGoalsContext = createContext<SavingGoalsContextType | null>(null);
const STORAGE_KEY = "saving-goals";

export function SavingGoalsProvider({ children }: { children: React.ReactNode }) {
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as SavingGoal[];
      if (Array.isArray(parsed)) {
        setSavingGoals(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savingGoals));
  }, [savingGoals]);

  const addSavingGoal = (data: Omit<SavingGoal, "id">) => {
    const goal = { id: uuid(), ...data };
    setSavingGoals((prev) => [...prev, goal]);
    return goal;
  };

  const updateSavingGoal = (id: string, data: Omit<SavingGoal, "id">) => {
    setSavingGoals((prev) => prev.map((goal) => (goal.id === id ? { ...goal, ...data } : goal)));
    return true;
  };

  const deleteSavingGoal = (id: string) => {
    setSavingGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return (
    <SavingGoalsContext.Provider
      value={{ savingGoals, addSavingGoal, updateSavingGoal, deleteSavingGoal }}
    >
      {children}
    </SavingGoalsContext.Provider>
  );
}

export const useSavingGoals = () => {
  const context = useContext(SavingGoalsContext);
  if (!context) throw new Error("useSavingGoals fuera de provider");
  return context;
};
