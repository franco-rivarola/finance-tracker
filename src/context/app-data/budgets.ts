"use client";

import type { Session } from "@supabase/supabase-js";
import type { Budget } from "@/types/budget";
import { mapBudget, toMonthStart, type AppDataClient, type Setter } from "./shared";

const getBudgetErrorMessage = (message?: string) => {
  switch (message) {
    case "duplicate_budget_month":
      return "Ya existe un presupuesto para esa categoría en ese mes";
    case "invalid_budget_category":
      return "La categoría elegida no es válida para presupuestos";
    case "invalid_budget_amount":
      return "El monto del presupuesto debe ser mayor a cero";
    case "invalid_budget_month":
      return "Elegí un mes válido";
    case "budget_not_found":
      return "No se encontró el presupuesto";
    default:
      return "No se pudo guardar el presupuesto";
  }
};

export const addBudgetRecord = async ({
  db,
  session,
  budgets,
  setBudgets,
  data,
}: {
  db: AppDataClient;
  session: Session | null;
  budgets: Budget[];
  setBudgets: Setter<Budget[]>;
  data: Omit<Budget, "id">;
}) => {
  const userId = session?.user.id;
  if (!userId) return false;

  const exists = budgets.some(
    (item) => item.categoryId === data.categoryId && item.month === data.month
  );
  if (exists) {
    alert("Ya existe un presupuesto para esa categoría en ese mes");
    return false;
  }

  const { data: inserted, error } = await db.rpc("create_budget", {
    p_category_id: data.categoryId,
    p_amount: data.amount,
    p_month_start: toMonthStart(data.month),
  });

  if (error || !inserted) {
    console.error(error);
    alert(getBudgetErrorMessage(error?.message));
    return false;
  }

  setBudgets((prev) => [...prev, mapBudget(inserted)]);
  return true;
};

export const updateBudgetRecord = async ({
  db,
  budgets,
  setBudgets,
  id,
  data,
}: {
  db: AppDataClient;
  budgets: Budget[];
  setBudgets: Setter<Budget[]>;
  id: string;
  data: Omit<Budget, "id">;
}) => {
  const exists = budgets.some(
    (item) => item.id !== id && item.categoryId === data.categoryId && item.month === data.month
  );
  if (exists) {
    alert("Ya existe un presupuesto para esa categoría en ese mes");
    return false;
  }

  const { data: updated, error } = await db.rpc("update_budget", {
    p_budget_id: id,
    p_category_id: data.categoryId,
    p_amount: data.amount,
    p_month_start: toMonthStart(data.month),
  });

  if (error || !updated) {
    console.error(error);
    alert(getBudgetErrorMessage(error?.message));
    return false;
  }

  setBudgets((prev) => prev.map((item) => (item.id === id ? mapBudget(updated) : item)));
  return true;
};

export const deleteBudgetRecord = async ({
  db,
  setBudgets,
  id,
}: {
  db: AppDataClient;
  setBudgets: Setter<Budget[]>;
  id: string;
}) => {
  const { error } = await db.rpc("delete_budget", { p_budget_id: id });
  if (error) {
    console.error(error);
    alert(getBudgetErrorMessage(error.message));
    return;
  }
  setBudgets((prev) => prev.filter((item) => item.id !== id));
};
