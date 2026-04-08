"use client";

import { useMemo, useState } from "react";
import { useBudgets } from "@/context/BudgetsContext";
import { useCategories } from "@/context/CategoriesContext";
import { useTransactions } from "@/context/TransactionsContext";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { formatMoney, getTransactionBaseAmount } from "@/utils/currency";
import { getBudgetAlertLabel, getBudgetAlertLevel, getBudgetAlertTone } from "@/utils/finance";

export default function BudgetsPage() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const { transactions } = useTransactions();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories]
  );

  const [form, setForm] = useState({
    categoryId: expenseCategories[0]?.id ?? "",
    amount: "",
    month: currentMonth,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const budgetRows = useMemo(() => {
    const categoryNameById = new Map(
      expenseCategories.map((category) => [category.id, category.name])
    );

    return [...budgets]
      .map((budget) => {
        const spent = transactions
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.category.id === budget.categoryId &&
              transaction.date.startsWith(budget.month)
          )
          .reduce((total, transaction) => total + getTransactionBaseAmount(transaction), 0);

        return {
          ...budget,
          spent,
          remaining: budget.amount - spent,
          categoryName:
            categoryNameById.get(budget.categoryId) || "Categoría eliminada",
          alertLevel: getBudgetAlertLevel(spent, budget.amount),
        };
      })
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [budgets, expenseCategories, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(form.amount);
    if (!form.categoryId || !amount || !form.month) return;

    const payload = {
      categoryId: form.categoryId,
      amount,
      month: form.month,
    };

    const created = editingId
      ? updateBudget(editingId, payload)
      : addBudget(payload);

    if (!created) return;

    setForm({
      categoryId: expenseCategories[0]?.id ?? "",
      amount: "",
      month: currentMonth,
    });
    setEditingId(null);
    setModalOpen(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      categoryId: expenseCategories[0]?.id ?? "",
      amount: "",
      month: currentMonth,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Presupuestos</h1>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD600] text-black transition hover:brightness-95"
          aria-label="Agregar presupuesto"
        >
          <AddIcon fontSize="small" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgetRows.map((budget) => {
          const progress =
            budget.amount === 0 ? 0 : (budget.spent / budget.amount) * 100;
          const overBudget = budget.spent > budget.amount;

          return (
            <div
              key={budget.id}
              className="rounded-2xl bg-white p-5 text-black shadow-sm"
            >
              <p className="text-sm text-zinc-500">{budget.month}</p>
              <h2 className="mt-1 text-xl font-semibold">
                {budget.categoryName}
              </h2>
              {budget.alertLevel !== "none" ? (
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBudgetAlertTone(budget.alertLevel)}`}>
                  {getBudgetAlertLabel(budget.alertLevel)}
                </span>
              ) : null}

              <div className="mt-4 space-y-2">
                <p className="text-sm text-zinc-500">
                  Gastado: {formatMoney(budget.spent)}
                </p>
                <p className="text-sm text-zinc-500">
                  Límite: {formatMoney(budget.amount)}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    overBudget ? "text-rose-500" : "text-emerald-600"
                  }`}
                >
                  {overBudget ? "Excedido" : "Disponible"}: {formatMoney(Math.abs(budget.remaining))}
                </p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className={`h-full rounded-full ${
                    overBudget ? "bg-rose-500" : "bg-[#FFD600]"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(budget.id);
                    setForm({
                      categoryId: budget.categoryId,
                      amount: String(budget.amount),
                      month: budget.month,
                    });
                    setModalOpen(true);
                  }}
                  className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Editar
                </button>

                <button
                  onClick={() => deleteBudget(budget.id)}
                  className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 text-black shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Editar presupuesto" : "Nuevo presupuesto"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
                aria-label="Cerrar modal"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      categoryId: e.target.value,
                    }))
                  }
                >
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                  placeholder="Monto"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      amount: e.target.value,
                    }))
                  }
                />

                <input
                  type="month"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                  value={form.month}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      month: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-center gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-[#FFD600] px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95"
                >
                  {editingId ? "Guardar cambios" : "Guardar presupuesto"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
