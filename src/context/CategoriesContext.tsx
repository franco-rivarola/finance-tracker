"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Category, TransactionType } from "@/types/transaction";
import { DEFAULT_CATEGORIES } from "@/constants/categories";
import { v4 as uuid } from "uuid";

type CategoriesContextType = {
  categories: Category[];
  addCategory: (name: string, type: TransactionType) => void;
  updateCategory: (id: string, name: string) => boolean;
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
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(isValidCategory)
      ) {
        setCategories(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

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

  const updateCategory = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const current = categories.find((category) => category.id === id);
    if (!current) return false;

    const exists = categories.some(
      (category) =>
        category.id !== id &&
        category.name.toLowerCase() === trimmed.toLowerCase() &&
        category.type === current.type
    );

    if (exists) {
      alert("La categoría ya existe");
      return false;
    }

    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, name: trimmed } : category
      )
    );

    return true;
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CategoriesContext.Provider
      value={{ categories, addCategory, updateCategory, deleteCategory }}
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
