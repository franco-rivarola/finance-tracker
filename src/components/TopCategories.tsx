"use client";

import { Transaction } from "@/types/transaction";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

type Props = {
  transactions: Transaction[];
  top?: number;
};

export default function TopCategories({ transactions, top = 5 }: Props) {
  const data = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};

    transactions.forEach((t) => {
      const key = t.category.id;
      const current = map[key] || { name: t.category.name, value: 0 };
      map[key] = {
        name: t.category.name,
        value: current.value + t.amount,
      };
    });

    return Object.values(map)
      .sort((a, b) => b.value - a.value)
      .slice(0, top);
  }, [transactions, top]);

  return (
    <div className="bg-white border border-gray-200 p-5 rounded-3xl h-64">
      <h2 className="text-gray-500 mb-2">Top categorías</h2>

      {data.length === 0 ? (
        <p className="text-gray-400">Sin transacciones</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? `$${value.toLocaleString()}` : value
              }
            />
            <Bar
              dataKey="value"
              fill="#facc15" // 🟡 amarillo
              radius={[6, 6, 6, 6]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
