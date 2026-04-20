"use client";

import type { Session } from "@supabase/supabase-js";
import type { Budget } from "@/types/budget";
import type { Transaction, TransactionType } from "@/types/transaction";
import { mapCategory, type AppDataClient, type CategoryItem, type Setter } from "./shared";

const getCategoryErrorMessage = (message?: string) => {
  switch (message) {
    case "duplicate_category_name":
      return "La categoría ya existe";
    case "blank_category_name":
      return "La categoría necesita un nombre";
    case "category_has_transactions":
      return "No podés eliminar una categoría con movimientos asociados.";
    case "category_has_budgets":
      return "No podés eliminar una categoría con presupuestos asociados.";
    case "category_not_found":
      return "No se encontró la categoría";
    case "invalid_category_type":
      return "El tipo de categoría no es válido";
    default:
      return "No se pudo guardar la categoría";
  }
};

export const resolveCategory = (categories: CategoryItem[], categoryId: string) => {
  const category = categories.find((item) => item.id === categoryId);
  if (!category) throw new Error("Categoría inválida");
  return category;
};

export const addCategoryRecord = async ({
  db,
  session,
  categories,
  setCategories,
  name,
  type,
}: {
  db: AppDataClient;
  session: Session | null;
  categories: CategoryItem[];
  setCategories: Setter<CategoryItem[]>;
  name: string;
  type: TransactionType;
}) => {
  const userId = session?.user.id;
  const trimmed = name.trim();
  if (!userId || !trimmed) return false;

  const exists = categories.some(
    (item) => item.name.toLowerCase() === trimmed.toLowerCase() && item.type === type
  );
  if (exists) {
    alert("La categoría ya existe");
    return false;
  }

  const { data, error } = await db.rpc("create_category", {
    p_name: trimmed,
    p_type: type,
  });

  if (error || !data) {
    console.error(error);
    alert(getCategoryErrorMessage(error?.message));
    return false;
  }

  setCategories((prev) => [...prev, mapCategory(data)]);
  return true;
};

export const updateCategoryRecord = async ({
  db,
  categories,
  setCategories,
  id,
  name,
}: {
  db: AppDataClient;
  categories: CategoryItem[];
  setCategories: Setter<CategoryItem[]>;
  id: string;
  name: string;
}) => {
  const trimmed = name.trim();
  if (!trimmed) return false;

  const current = categories.find((item) => item.id === id);
  if (!current) return false;

  const exists = categories.some(
    (item) =>
      item.id !== id &&
      item.name.toLowerCase() === trimmed.toLowerCase() &&
      item.type === current.type
  );
  if (exists) {
    alert("La categoría ya existe");
    return false;
  }

  const { data, error } = await db.rpc("update_category", {
    p_category_id: id,
    p_name: trimmed,
  });

  if (error || !data) {
    console.error(error);
    alert(getCategoryErrorMessage(error?.message));
    return false;
  }

  setCategories((prev) => prev.map((item) => (item.id === id ? mapCategory(data) : item)));
  return true;
};

export const deleteCategoryRecord = async ({
  db,
  transactions,
  budgets,
  setCategories,
  id,
}: {
  db: AppDataClient;
  transactions: Transaction[];
  budgets: Budget[];
  setCategories: Setter<CategoryItem[]>;
  id: string;
}) => {
  if (
    transactions.some((item) => item.category.id === id) ||
    budgets.some((item) => item.categoryId === id)
  ) {
    alert("No podés eliminar una categoría con movimientos o presupuestos asociados.");
    return false;
  }

  const { error } = await db.rpc("delete_category", { p_category_id: id });
  if (error) {
    console.error(error);
    alert(getCategoryErrorMessage(error.message));
    return false;
  }

  setCategories((prev) => prev.filter((item) => item.id !== id));
  return true;
};
