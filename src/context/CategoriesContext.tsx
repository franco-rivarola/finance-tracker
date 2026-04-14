"use client";

import { createContext, useContext } from "react";
import type { TransactionType } from "@/types/transaction";
import type { CategoryItem } from "./app-data/shared";

type CategoriesContextValue = {
  categories: CategoryItem[];
  addCategory: (name: string, type: TransactionType) => Promise<boolean>;
  updateCategory: (id: string, name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export const CategoriesProvider = ({
  value,
  children,
}: {
  value: CategoriesContextValue;
  children: React.ReactNode;
}) => <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error("useCategories debe usarse dentro de CategoriesProvider");
  return context;
};
