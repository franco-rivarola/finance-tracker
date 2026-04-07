"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Category, TransactionType } from "@/types/transaction";
import { DEFAULT_CATEGORIES } from "@/constants/categories";
import { v4 as uuid } from "uuid";

type CategoriesContextType = {
  categories: Category[];
  addCategory: (name: string, type: TransactionType) => void;
  deleteCategory: (id: string) => void;
};

const CategoriesContext = createContext<CategoriesContextType | null>(null);
const STORAGE_KEY = "categories";

const isValidCategory = (value: unknown): value is Category => {
  if (!value || typeof value !== "object") return false;

  const category = value as Partial<Category>;

  return Boolean(category.id && category.name && category.type);
};

export const CategoriesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CATEGORIES;

    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return DEFAULT_CATEGORIES;

    try {
      const parsed = JSON.parse(stored);

      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(isValidCategory)
      ) {
        return parsed;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    return DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  const addCategory = (name: string, type: TransactionType) => {
    const exists = categories.some(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() &&
        c.type === type
    );

    if (exists) {
      alert("La categoría ya existe");
      return;
    }

    setCategories((prev) => [
      ...prev,
      { id: uuid(), name, type },
    ]);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CategoriesContext.Provider
      value={{ categories, addCategory, deleteCategory }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories fuera de provider");
  return ctx;
};
