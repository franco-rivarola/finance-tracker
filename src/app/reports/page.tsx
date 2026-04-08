"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import DateFilter from "@/components/DateFilter";
import { useAccounts } from "@/context/AccountsContext";
import { useTransactions } from "@/context/TransactionsContext";
import { BASE_CURRENCY, formatMoney, getTransactionBaseAmount } from "@/utils/currency";

type DateRange = {
  start: string;
  end: string;
};

type PreviousWindow =
  | { month: string }
  | { start: string; end: string };

export default function ReportsPage() {
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [range, setRange] = useState<DateRange | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      if (range) {
        return (
          transaction.date >= range.start && transaction.date <= range.end
        );
      }

      if (month) return transaction.date.startsWith(month);
      return true;
    });
  }, [month, range, transactions]);

  const expenseTransactions = filtered.filter(
    (transaction) =>
      transaction.type === "expense" && transaction.category.id !== "transfer"
  );
  const incomeTransactions = filtered.filter(
    (transaction) => transaction.type === "income"
  );

  const income = incomeTransactions.reduce(
    (total, transaction) => total + getTransactionBaseAmount(transaction),
    0
  );
  const expense = expenseTransactions.reduce(
    (total, transaction) => total + getTransactionBaseAmount(transaction),
    0
  );
  const balance = income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  const previousWindow = useMemo<PreviousWindow | null>(() => {
    if (range) {
      const start = new Date(range.start);
      const end = new Date(range.end);
      const duration =
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const previousEnd = new Date(start);
      previousEnd.setDate(previousEnd.getDate() - 1);

      const previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - (duration - 1));

      return {
        start: previousStart.toISOString().slice(0, 10),
        end: previousEnd.toISOString().slice(0, 10),
      };
    }

    if (!month) return null;

    const [year, monthNumber] = month.split("-").map(Number);
    const currentDate = new Date(year, monthNumber - 1, 1);
    const previousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    return {
      month: `${previousDate.getFullYear()}-${String(
        previousDate.getMonth() + 1
      ).padStart(2, "0")}`,
    };
  }, [month, range]);

  const previousTransactions = useMemo(() => {
    if (!previousWindow) return [];

    return transactions.filter((transaction) => {
      if ("month" in previousWindow) {
        return transaction.date.startsWith(previousWindow.month);
      }

      return (
        transaction.date >= previousWindow.start &&
        transaction.date <= previousWindow.end
      );
    });
  }, [previousWindow, transactions]);

  const previousIncome = previousTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + getTransactionBaseAmount(transaction), 0);
  const previousExpense = previousTransactions
    .filter(
      (transaction) =>
        transaction.type === "expense" && transaction.category.id !== "transfer"
    )
    .reduce((total, transaction) => total + getTransactionBaseAmount(transaction), 0);
  const previousBalance = previousIncome - previousExpense;

  const topCategories = (() => {
    const map = new Map<
      string,
      {
        name: string;
        amount: number;
        share: number;
        count: number;
      }
    >();

    expenseTransactions.forEach((transaction) => {
        const current = map.get(transaction.category.id) ?? {
        name: transaction.category.name,
        amount: 0,
        share: 0,
        count: 0,
      };

      map.set(transaction.category.id, {
        name: transaction.category.name,
        amount: current.amount + getTransactionBaseAmount(transaction),
        share: 0,
        count: current.count + 1,
      });
    });

    return Array.from(map.values())
      .map((category) => ({
        ...category,
        share: expense > 0 ? (category.amount / expense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  })();

  const accountBreakdown = useMemo(() => {
    return accounts
      .map((account) => {
        const accountTransactions = filtered.filter(
          (transaction) => transaction.accountId === account.id
        );

        const incomeTotal = accountTransactions
          .filter((transaction) => transaction.type === "income")
          .reduce((total, transaction) => total + getTransactionBaseAmount(transaction), 0);

        const expenseTotal = accountTransactions
          .filter((transaction) => transaction.type === "expense")
          .reduce((total, transaction) => total + getTransactionBaseAmount(transaction), 0);

        const movementCount = accountTransactions.length;

        return {
          id: account.id,
          name: account.name,
          income: incomeTotal,
          expense: expenseTotal,
          balance: incomeTotal - expenseTotal,
          movementCount,
        };
      })
      .sort((a, b) => b.balance - a.balance);
  }, [accounts, filtered]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const currentMonth = transaction.date.slice(0, 7);
      const current = map.get(currentMonth) ?? { income: 0, expense: 0 };

      if (transaction.type === "income") current.income += getTransactionBaseAmount(transaction);
      if (
        transaction.type === "expense" &&
        transaction.category.id !== "transfer"
      ) {
        current.expense += getTransactionBaseAmount(transaction);
      }

      map.set(currentMonth, current);
    });

    return Array.from(map.entries())
      .map(([label, values]) => ({
        label,
        income: values.income,
        expense: values.expense,
        balance: values.income - values.expense,
      }))
      .sort((a, b) => b.label.localeCompare(a.label))
      .slice(0, 6);
  }, [transactions]);

  const averageExpenseTicket =
    expenseTransactions.length > 0 ? expense / expenseTransactions.length : 0;
  const averageIncomeTicket =
    incomeTransactions.length > 0 ? income / incomeTransactions.length : 0;
  const biggestExpense = [...expenseTransactions].sort(
    (a, b) => getTransactionBaseAmount(b) - getTransactionBaseAmount(a)
  )[0];

  const exportCsv = () => {
    const csv = Papa.unparse(
      filtered.map((transaction) => ({
        fecha: transaction.date,
        tipo: transaction.type,
        categoria: transaction.category.name,
        cuenta:
          accounts.find((account) => account.id === transaction.accountId)?.name ||
          transaction.accountId,
        descripcion: transaction.description,
        monto: transaction.amount,
        moneda: transaction.currency,
        monto_base: transaction.baseAmount,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-${month || "personalizado"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const findings = [
    {
      title: "Resultado neto",
      text:
        balance >= 0
          ? `Cerraste el período con superávit de ${formatMoney(balance, BASE_CURRENCY)}.`
          : `Cerraste el período con déficit de ${formatMoney(Math.abs(balance), BASE_CURRENCY)}.`,
    },
    {
      title: "Peso de la categoría principal",
      text: topCategories[0]
        ? `${topCategories[0].name} explicó el ${topCategories[0].share.toFixed(
            1
          )}% del gasto.`
        : "Todavía no hay gasto suficiente para identificar una categoría dominante.",
    },
    {
      title: "Comparación contra el período anterior",
      text:
        previousWindow && previousExpense > 0
          ? `Tus gastos variaron ${formatDelta(
              percentChange(expense, previousExpense)
            )} frente al período anterior.`
          : "Todavía no hay un período comparable anterior con gastos registrados.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
        </div>

        <button
          onClick={exportCsv}
          className="rounded-xl bg-[#FFD600] px-4 py-2 font-semibold text-black"
        >
          Exportar CSV
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <DateFilter
          onChange={(selectedMonth, selectedRange) => {
            setMonth(selectedMonth);
            setRange(selectedRange);
          }}
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          {findings.map((finding) => (
            <div
              key={finding.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <p className="text-sm text-[#FFD600]">{finding.title}</p>
              <p className="mt-2 text-base font-medium text-white">
                {finding.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportTable
          title="Resumen ejecutivo"
          rows={[
            ["Ingresos", formatMoney(income, BASE_CURRENCY)],
            ["Gastos", formatMoney(expense, BASE_CURRENCY)],
            ["Balance", formatMoney(balance, BASE_CURRENCY)],
            ["Tasa de ahorro", `${savingsRate.toFixed(1)}%`],
            [
              "Ticket promedio de gasto",
              formatMoney(averageExpenseTicket, BASE_CURRENCY),
            ],
            [
              "Ticket promedio de ingreso",
              formatMoney(averageIncomeTicket, BASE_CURRENCY),
            ],
          ]}
        />

        <ReportTable
          title="Comparativa vs período anterior"
          rows={[
            [
              "Ingresos",
              compareLine(income, previousIncome),
            ],
            [
              "Gastos",
              compareLine(expense, previousExpense),
            ],
            [
              "Balance",
              compareLine(balance, previousBalance),
            ],
            [
              "Mayor gasto",
                biggestExpense
                ? `${biggestExpense.category.name ?? "-"} · ${formatMoney(
                    getTransactionBaseAmount(biggestExpense),
                    BASE_CURRENCY
                  )}`
                : "-",
            ],
          ]}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl text-white font-semibold">Ranking de categorías</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-400">
                <tr className="border-b border-zinc-800">
                  <th className="pb-3 text-[#FFD600] font-medium">Categoría</th>
                  <th className="pb-3 text-[#FFD600] font-medium">Gasto</th>
                  <th className="pb-3 text-[#FFD600] font-medium">Participación</th>
                  <th className="pb-3 text-[#FFD600] font-medium">Movimientos</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-zinc-500">
                      Sin gastos en el período.
                    </td>
                  </tr>
                ) : (
                  topCategories.map((category) => (
                    <tr key={category.name} className="border-b border-zinc-900">
                      <td className="py-3 font-medium text-white">
                        {category.name}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {formatMoney(category.amount, BASE_CURRENCY)}
                      </td>
                      <td className="py-3 text-zinc-300">
                        {category.share.toFixed(1)}%
                      </td>
                      <td className="py-3 text-zinc-300">{category.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl text-white font-semibold">Distribución por cuenta</h2>
          <div className="mt-4 space-y-3">
            {accountBreakdown.map((account) => (
              <div
                key={account.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[#FFD600]">{account.name}</p>
                  <p
                    className={`font-semibold ${
                      account.balance >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {formatMoney(account.balance, BASE_CURRENCY)}
                  </p>
                </div>
                <div className="mt-2 text-sm text-zinc-400">
                  <p>Ingresos: {formatMoney(account.income, BASE_CURRENCY)}</p>
                  <p>Gastos: {formatMoney(account.expense, BASE_CURRENCY)}</p>
                  <p>Movimientos: {account.movementCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-xl text-white font-semibold">Serie de los últimos 6 meses</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-zinc-800">
                <th className="pb-3 text-[#FFD600] font-medium">Mes</th>
                <th className="pb-3 text-[#FFD600] font-medium">Ingresos</th>
                <th className="pb-3 text-[#FFD600] font-medium">Gastos</th>
                <th className="pb-3 text-[#FFD600] font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrend.map((row) => (
                <tr key={row.label} className="border-b border-zinc-900">
                  <td className="py-3 font-medium text-white">{row.label}</td>
                  <td className="py-3 text-zinc-300">
                    {formatMoney(row.income, BASE_CURRENCY)}
                  </td>
                  <td className="py-3 text-zinc-300">
                    {formatMoney(row.expense, BASE_CURRENCY)}
                  </td>
                  <td
                    className={`py-3 font-medium ${
                      row.balance >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {formatMoney(row.balance, BASE_CURRENCY)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportTable({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center  justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <span className="text-zinc-400 ">{label}</span>
            <span className="font-medium text-white ">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function formatDelta(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function compareLine(current: number, previous: number) {
  if (previous === 0 && current === 0) return formatMoney(0, BASE_CURRENCY);
  if (previous === 0) {
    return `${formatMoney(current, BASE_CURRENCY)} · nuevo período comparable`;
  }

  return `${formatMoney(current, BASE_CURRENCY)} · ${formatDelta(
    percentChange(current, previous)
  )}`;
}
