"use client";

import { useMemo } from "react";
import { useBudgets } from "@/context/BudgetsContext";
import { useCategories } from "@/context/CategoriesContext";
import { Transaction } from "@/types/transaction";
import { formatMoney } from "@/utils/currency";
import { getBudgetAlertLabel, getBudgetAlertLevel, getBudgetAlertTone } from "@/utils/finance";

type Props = {
  transactions: Transaction[];
  month: string;
};

export default function BudgetsOverview({ transactions, month }: Props) {
  const { budgets } = useBudgets();
  const { categories } = useCategories();

  const rows = useMemo(() => {
    const categoryNameById = new Map(
      categories.map((category) => [category.id, category.name])
    );

    return budgets
      .filter((budget) => budget.month === month)
      .map((budget) => {
        const spent = transactions
          .filter(
            (transaction) =>
              transaction.type === "expense" &&
              transaction.category.id === budget.categoryId
          )
          .reduce((total, transaction) => total + transaction.baseAmount, 0);

        return {
          ...budget,
          categoryName:
            categoryNameById.get(budget.categoryId) || "Categoría eliminada",
          spent,
          progress: budget.amount === 0 ? 0 : (spent / budget.amount) * 100,
          alertLevel: getBudgetAlertLevel(spent, budget.amount),
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 4);
  }, [budgets, categories, month, transactions]);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
      <div>
        <h2 className="text-xl text-white font-semibold">Presupuestos</h2>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const overBudget = row.spent > row.amount;

          return (
            <div key={row.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[#FACC15]">{row.categoryName}</p>
                  {row.alertLevel !== "none" ? (
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getBudgetAlertTone(row.alertLevel)}`}>
                      {getBudgetAlertLabel(row.alertLevel)}
                    </span>
                  ) : null}
                </div>
                <p
                  className={`text-sm font-semibold ${
                    overBudget ? "text-rose-400" : "text-zinc-300"
                  }`}
                >
                  {formatMoney(row.spent)} / {formatMoney(row.amount)}
                </p>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full ${
                    overBudget ? "bg-rose-500" : "bg-[#FACC15]"
                  }`}
                  style={{ width: `${Math.min(row.progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
