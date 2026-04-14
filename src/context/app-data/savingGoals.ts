"use client";

import type { Session } from "@supabase/supabase-js";
import type { SavingGoal } from "@/types/saving-goal";
import { mapSavingGoal, type AppDataClient, type Setter } from "./shared";

const getSavingGoalErrorMessage = (message?: string) => {
  switch (message) {
    case "blank_saving_goal_name":
      return "La meta necesita un nombre";
    case "invalid_saving_goal_amount":
      return "El objetivo de ahorro debe ser mayor a cero";
    case "invalid_saving_goal_date":
      return "Elegí una fecha válida";
    case "saving_goal_not_found":
      return "No se encontró la meta de ahorro";
    case "account_not_found":
      return "La cuenta elegida no es válida";
    default:
      return "No se pudo guardar la meta de ahorro";
  }
};

export const addSavingGoalRecord = async ({
  db,
  session,
  setSavingGoals,
  data,
}: {
  db: AppDataClient;
  session: Session | null;
  setSavingGoals: Setter<SavingGoal[]>;
  data: Omit<SavingGoal, "id">;
}) => {
  const userId = session?.user.id;
  if (!userId) return null;

  const { data: inserted, error } = await db.rpc("create_saving_goal", {
    p_account_id: data.accountId,
    p_name: data.name.trim(),
    p_target_amount: data.targetAmount,
    p_target_date: data.targetDate,
    p_currency: data.currency,
  });

  if (error || !inserted) {
    console.error(error);
    alert(getSavingGoalErrorMessage(error?.message));
    return null;
  }

  const mapped = mapSavingGoal(inserted);
  setSavingGoals((prev) => [mapped, ...prev]);
  return mapped;
};

export const updateSavingGoalRecord = async ({
  db,
  setSavingGoals,
  id,
  data,
}: {
  db: AppDataClient;
  setSavingGoals: Setter<SavingGoal[]>;
  id: string;
  data: Omit<SavingGoal, "id">;
}) => {
  const { data: updated, error } = await db.rpc("update_saving_goal", {
    p_saving_goal_id: id,
    p_account_id: data.accountId,
    p_name: data.name.trim(),
    p_target_amount: data.targetAmount,
    p_target_date: data.targetDate,
    p_currency: data.currency,
  });

  if (error || !updated) {
    console.error(error);
    alert(getSavingGoalErrorMessage(error?.message));
    return false;
  }

  setSavingGoals((prev) =>
    prev.map((item) => (item.id === id ? mapSavingGoal(updated) : item))
  );
  return true;
};

export const deleteSavingGoalRecord = async ({
  db,
  setSavingGoals,
  id,
}: {
  db: AppDataClient;
  setSavingGoals: Setter<SavingGoal[]>;
  id: string;
}) => {
  const { error } = await db.rpc("delete_saving_goal", { p_saving_goal_id: id });
  if (error) {
    console.error(error);
    alert(getSavingGoalErrorMessage(error.message));
    return;
  }
  setSavingGoals((prev) => prev.filter((item) => item.id !== id));
};
