"use client";

import { useState } from "react";
import { TransactionInput } from "@/types/transaction";
import { DEFAULT_CATEGORIES as categories } from "@/constants/categories";

type Props = {
  initialData?: TransactionInput;
  onSubmit: (data: TransactionInput) => void;
  submitText?: string;
};

export default function TransactionForm({
  initialData,
  onSubmit,
  submitText = "Guardar",
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<TransactionInput>({
    amount: initialData?.amount ?? 0,
    description: initialData?.description ?? "",
    type: initialData?.type ?? "expense",
    categoryId: initialData?.categoryId ?? "",
    date: initialData?.date ?? today,
  });

  const [amountInput, setAmountInput] = useState(
    initialData?.amount ? formatNumber(initialData.amount) : ""
  );

  // 🔥 categorías por tipo
  const filteredCategories = categories.filter(
    (c) => c.type === form.type
  );

  // 🔥 helpers monto
  function formatNumber(value: number | string) {
    const num = Number(value);
    if (!num) return "";
    return num.toLocaleString("es-AR");
  }

  function parseNumber(value: string) {
    return Number(value.replace(/\./g, ""));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.amount || !form.categoryId) return;

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* MONTO */}
      <input
        type="text"
        inputMode="numeric"
        placeholder="$ 0"
        value={amountInput}
        onChange={(e) => {
          let value = e.target.value;

          // solo números
          value = value.replace(/\D/g, "");

          setAmountInput(formatNumber(value));

          setForm({
            ...form,
            amount: parseNumber(value),
          });
        }}
        className="w-full border p-3 rounded-xl text-lg font-medium"
      />

      {/* DESCRIPCION */}
      <input
        placeholder="Descripción (opcional)"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        className="w-full border p-3 rounded-xl"
      />

      {/* TIPO */}
      <select
        value={form.type}
        onChange={(e) =>
          setForm({
            ...form,
            type: e.target.value as "income" | "expense",
            categoryId: "",
          })
        }
        className="w-full border p-3 rounded-xl"
      >
        <option value="expense">Gasto</option>
        <option value="income">Ingreso</option>
      </select>

      {/* CATEGORIA */}
      <select
        value={form.categoryId}
        onChange={(e) =>
          setForm({ ...form, categoryId: e.target.value })
        }
        className="w-full border p-3 rounded-xl"
      >
        <option value="">Seleccionar categoría</option>
        {filteredCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* FECHA */}
      <input
        type="date"
        value={form.date}
        onChange={(e) =>
          setForm({ ...form, date: e.target.value })
        }
        className="w-full border p-3 rounded-xl"
      />

      {/* BOTÓN GUARDAR */}
      <button
        type="submit"
        disabled={!form.amount || !form.categoryId}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition disabled:opacity-40"
      >
        {submitText}
      </button>
    </form>
  );
}