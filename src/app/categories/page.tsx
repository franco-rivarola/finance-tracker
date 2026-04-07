"use client";

import { useState } from "react";
import { useCategories } from "@/context/CategoriesContext";
import { TransactionType } from "@/types/transaction";

export default function CategoriesPage() {
  const { categories, addCategory, deleteCategory } = useCategories();

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");

  const expenseCategories = categories.filter(
    (c) => c.type === "expense"
  );

  const incomeCategories = categories.filter(
    (c) => c.type === "income"
  );

  const handleAdd = () => {
    if (!name.trim()) return;

    addCategory(name.trim(), type);
    setName("");
  };

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">Categorías</h1>

      {/* FORM */}
      <div className="bg-white text-black p-5 rounded-2xl space-y-4">
        <h2 className="font-semibold">Nueva categoría</h2>

        <div className="flex gap-3">
          <input
            className="border p-2 rounded w-full"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={type}
            onChange={(e) =>
              setType(e.target.value as TransactionType)
            }
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>

          <button
            onClick={handleAdd}
            className="bg-[#FFD600] text-black px-4 rounded font-semibold"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* LISTAS */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* GASTOS */}
        <div className="bg-white text-black p-5 rounded-2xl">
          <h2 className="font-semibold mb-3">Gastos</h2>

          {expenseCategories.length === 0 ? (
            <p className="text-gray-400">No hay categorías</p>
          ) : (
            <ul className="space-y-2">
              {expenseCategories.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  {c.name}
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar categoría?")) {
                        deleteCategory(c.id);
                      }
                    }}
                    className="text-red-500 text-sm"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* INGRESOS */}
        <div className="bg-white text-black p-5 rounded-2xl">
          <h2 className="font-semibold mb-3">Ingresos</h2>

          {incomeCategories.length === 0 ? (
            <p className="text-gray-400">No hay categorías</p>
          ) : (
            <ul className="space-y-2">
              {incomeCategories.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  {c.name}
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar categoría?")) {
                        deleteCategory(c.id);
                      }
                    }}
                    className="text-red-500 text-sm"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}