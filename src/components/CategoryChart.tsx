"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/types/transaction";
import { formatMoney, getTransactionBaseAmount } from "@/utils/currency";

type Props = {
  transactions: Transaction[];
};

// 🎨 Paleta amplia y variada
const COLORS = [
  "#4ade80", // green
  "#f87171", // red
  "#60a5fa", // blue
  "#facc15", // yellow
  "#a78bfa", // purple
  "#f97316", // orange
  "#34d399", // emerald
  "#fb7185", // rose
  "#22c55e", // strong green
  "#eab308", // strong yellow
  "#38bdf8", // sky
  "#c084fc", // violet
  "#f43f5e", // strong red
  "#10b981", // teal green
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#ec4899", // pink
  "#8b5cf6", // deep purple
  "#14b8a6", // teal
  "#ef4444", // red alt
  "#3b82f6", // blue alt
  "#e879f9", // fuchsia
];

export default function CategoryChart({ transactions }: Props) {
  // Agrupar monto por categoría
  const data = Object.values(
    transactions.reduce(
      (acc: Record<string, { name: string; value: number }>, t) => {
        const key = t.category.id;
        const current = acc[key] || {
          name: t.category.name,
          value: 0,
        };

        acc[key] = {
          name: t.category.name,
          value: current.value + getTransactionBaseAmount(t),
        };

        return acc;
      },
      {}
    )
  );

  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-white p-5 rounded-2xl shadow h-64">
      <h2 className="mb-2 font-semibold text-gray-800">
        Por categoría
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-400">Sin transacciones</p>
      ) : (
        <div className="flex items-center h-full">
          {/* Chart */}
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="w-1/2 pl-4 overflow-y-auto max-h-full">
            <ul className="space-y-2">
              {data.map((entry, index) => {
                const percentage = total
                  ? ((entry.value / total) * 100).toFixed(0)
                  : 0;

                return (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[index % COLORS.length],
                      }}
                    />

                    <span className="text-gray-700 truncate">
                      {entry.name}
                    </span>

                    <span className="ml-auto font-medium">
                      {formatMoney(entry.value)}
                    </span>

                    <span className="text-gray-400 text-xs">
                      ({percentage}%)
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
