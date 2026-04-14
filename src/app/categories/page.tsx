"use client";

import { useState } from "react";
import { useCategories } from "@/context/CategoriesContext";
import { TransactionType } from "@/types/transaction";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const expenseCategories = categories.filter(
    (c) => c.type === "expense"
  );

  const incomeCategories = categories.filter(
    (c) => c.type === "income"
  );

  const handleAdd = async () => {
    if (!name.trim()) return;

    const ok = await addCategory(name.trim(), type);
    if (!ok) return;
    setName("");
    setType("expense");
    setCreateOpen(false);
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const ok = await updateCategory(editingId, editingName);
    if (!ok) return;

    setEditingId(null);
    setEditingName("");
  };

  const renderCategoryList = (
    list: typeof categories,
    title: string,
    tone: "rose" | "emerald"
  ) => (
    <div className="rounded-3xl bg-white p-5 text-black shadow-sm ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-zinc-500">
            {list.length} {list.length === 1 ? "categoría" : "categorías"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tone === "rose"
              ? "bg-rose-100 text-rose-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {tone === "rose" ? "Gastos" : "Ingresos"}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
          No hay categorías todavía.
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4"
            >
              {editingId === category.id ? (
                <div className="space-y-3">
                  <input
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-zinc-400"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Nombre de la categoría"
                  />

                  <p className="text-sm text-zinc-500">
                    {category.type === "expense" ? "Gasto" : "Ingreso"}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 rounded-xl bg-[#FACC15] px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-zinc-950">{category.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {category.type === "expense" ? "Gasto" : "Ingreso"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(category.id, category.name)}
                      className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar categoría?")) {
                          void deleteCategory(category.id);
                        }
                      }}
                      className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FACC15] text-black transition hover:brightness-95"
          aria-label="Agregar categoría"
        >
          <AddIcon fontSize="small" />
        </button>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-black shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Nueva categoría</h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
                aria-label="Cerrar modal"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <select
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
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
                className="mx-auto block rounded-xl bg-[#FACC15] px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {renderCategoryList(expenseCategories, "Gastos", "rose")}
        {renderCategoryList(incomeCategories, "Ingresos", "emerald")}
      </div>
    </div>
  );
}
