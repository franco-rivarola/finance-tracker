"use client";

import { Transaction } from "@/types/transaction";
import { useMemo } from "react";

type Props = {
  transactions: Transaction[];
};

export default function Insights({ transactions }: Props) {
  const insights = useMemo(() => {
    if (!transactions.length) return [];

    const categoryMap: Record<string, { name: string; total: number }> = {};
    transactions.forEach(t => {
      if (t.type === "expense") {
        const key = t.category.id;
        const current = categoryMap[key] || { name: t.category.name, total: 0 };
        categoryMap[key] = {
          name: t.category.name,
          total: current.total + t.amount,
        };
      }
    });

    const topCategory = Object.values(categoryMap).sort((a, b) => b.total - a.total)[0];

    const dayMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === "expense") {
        dayMap[t.date] = (dayMap[t.date] || 0) + t.amount;
      }
    });

    const topDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

    return [
      topCategory && `Gastaste más en ${topCategory.name} ($${topCategory.total})`,
      topDay && `Mayor gasto el ${topDay[0]} ($${topDay[1]})`,
    ].filter(Boolean);
  }, [transactions]);

  if (!insights.length) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-3xl">
      <h3 className="font-semibold text-black mb-2">Insights</h3>

      {insights.map((text, i) => (
        <p key={i} className="text-sm text-gray-700">
          • {text}
        </p>
      ))}
    </div>
  );
}