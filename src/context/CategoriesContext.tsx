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

export const CategoriesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("categories");

    if (stored) {
      const parsed = JSON.parse(stored);

      // 🔥 VALIDACIÓN PRO
      const valid = parsed.every(
        (c: any) => c.id && c.name && c.type
      );

      if (valid) {
        setCategories(parsed);
      } else {
        localStorage.removeItem("categories");
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("categories", JSON.stringify(categories));
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