"use client";

import { useState } from "react";
import { useTransactions } from "@/context/TransactionsContext";

import BalanceCard from "@/components/BalanceCard";
import CategoryChart from "@/components/CategoryChart";
import TopCategories from "@/components/TopCategories";
import MonthlyComparison from "@/components/MonthlyComparison";
import AnimatedCard from "@/components/AnimatedCard";
/* import ExportDashboard from "@/components/ExportDashboard"; */
import IncomeExpenseBarChart from "@/components/IncomeExpenseBarChart";
import Insights from "@/components/Insights";
import AccountsSummary from "@/components/AccountsSummary";
import DateFilter from "@/components/DateFilter";
import TransferModal from "@/components/TransferModal";

type DateRange = {
  start: string;
  end: string;
};

export default function DashboardPage() {
  const { transactions } = useTransactions();

  const [transferOpen, setTransferOpen] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [range, setRange] = useState<DateRange | null>(null);

  const handleFilter = (m: string, r: DateRange | null) => {
    setMonth(m);
    setRange(r);
  };

  const filtered = transactions.filter((t) => {
    if (range) return t.date >= range.start && t.date <= range.end;
    if (month) return t.date.startsWith(month);
    return true;
  });

  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inicio</h1>
          <p className="text-zinc-400 text-sm">Control total de tus finanzas</p>
        </div>
      </div>
      {/* 🔥 FILTER ARRIBA */}
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <DateFilter onChange={handleFilter} />
      </div>

      <div className="space-y-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setTransferOpen(true)}
          className="bg-[#FFD600] text-black px-5 py-2  rounded-xl font-semibold hover:scale-105 transition"
        >
          💸 Transferir
        </button>

        <AccountsSummary transactions={filtered} />
      </div>

      {/* CUENTAS */}
      {/* BALANCE */}
      <div className="grid md:grid-cols-3 gap-4">
        <BalanceCard title="Ingresos" amount={income} />
        <BalanceCard title="Gastos" amount={expense} />
        <BalanceCard title="Balance" amount={balance} />
      </div>

      {/* INSIGHTS */}
      <Insights transactions={filtered} />

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatedCard>
          <CategoryChart transactions={filtered} />
        </AnimatedCard>

        <AnimatedCard>
          <IncomeExpenseBarChart transactions={filtered} />
        </AnimatedCard>
      </div>

      <AnimatedCard>
        <TopCategories transactions={filtered} top={5} />
      </AnimatedCard>

      {!range && (
        <AnimatedCard>
          <MonthlyComparison transactions={filtered} />
        </AnimatedCard>
      )}

      {/*       <AnimatedCard>
        <ExportDashboard transactions={filtered} />
      </AnimatedCard> */}

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
      />
    </div>
  );
}
