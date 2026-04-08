"use client";

import { Transaction } from "@/types/transaction";
import { useMemo } from "react";
import { getTransactionBaseAmount } from "@/utils/currency";

type Props = {
  transactions: Transaction[];
};

export default function MonthlyComparison({ transactions }: Props) {
  const { changeIncome, changeExpense, changeBalance } = useMemo(() => {
    const now = new Date();
    const current = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prev = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, "0")}`;

    const sumByMonth = (month: string, type: "income" | "expense") =>
      transactions
        .filter(t => t.date.startsWith(month) && t.type === type)
        .reduce((sum, t) => sum + getTransactionBaseAmount(t), 0);

    const currentIncome = sumByMonth(current, "income");
    const prevIncome = sumByMonth(prev, "income");
    const currentExpense = sumByMonth(current, "expense");
    const prevExpense = sumByMonth(prev, "expense");

    const currentBalance = currentIncome - currentExpense;
    const prevBalance = prevIncome - prevExpense;

    const percentChange = (currentVal: number, prevVal: number) =>
      prevVal === 0 ? 100 : ((currentVal - prevVal) / Math.abs(prevVal)) * 100;

    return {
      changeIncome: percentChange(currentIncome, prevIncome),
      changeExpense: percentChange(currentExpense, prevExpense),
      changeBalance: percentChange(currentBalance, prevBalance)
    };
  }, [transactions]);

  const format = (num: number) => (num >= 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`);

  return (
    <div className="bg-white border border-gray-200 p-5 rounded-3xl grid grid-cols-3 text-center">
      <div>
        <h3 className="text-sm font-medium text-gray-700">Ingresos</h3>
        <p className="text-lg font-bold text-black">{format(changeIncome)}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700">Gastos</h3>
        <p className="text-lg font-bold text-black">{format(changeExpense)}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700">Balance</h3>
        <p className="text-lg font-bold text-black">{format(changeBalance)}</p>
      </div>
    </div>
  );
}
