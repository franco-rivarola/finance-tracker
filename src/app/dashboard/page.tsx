"use client";

import { useState } from "react";
import { useTransactions } from "@/context/TransactionsContext";
import { useAccounts } from "@/context/AccountsContext";

import BalanceCard from "@/components/BalanceCard";
import CategoryChart from "@/components/CategoryChart";
import TopCategories from "@/components/TopCategories";
import MonthlyComparison from "@/components/MonthlyComparison";
import AnimatedCard from "@/components/AnimatedCard";
/* import ExportDashboard from "@/components/ExportDashboard"; */
import Insights from "@/components/Insights";
import AccountsSummary from "@/components/AccountsSummary";
import BudgetsOverview from "@/components/BudgetsOverview";
import DateFilter from "@/components/DateFilter";
import TransferModal from "@/components/TransferModal";
import { BASE_CURRENCY, formatMoney, getTransactionBaseAmount } from "@/utils/currency";
import { useSavingGoals } from "@/context/SavingGoalsContext";
import { getSavingGoalProgress } from "@/utils/finance";
import Link from "next/link";

type DateRange = {
  start: string;
  end: string;
};

export default function DashboardPage() {
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { savingGoals } = useSavingGoals();

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
    .reduce((acc, t) => acc + getTransactionBaseAmount(t), 0);

  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + getTransactionBaseAmount(t), 0);

  const balance = income - expense;
  const expenseOnly = filtered.filter(
    (t) => t.type === "expense" && t.category.id !== "transfer"
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">

      </div>
      {/* 🔥 FILTER ARRIBA */}
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <DateFilter onChange={handleFilter} />
      </div>

      <div className="space-y-4 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <button
          onClick={() => setTransferOpen(true)}
          className="rounded-xl bg-[#FACC15] px-5 py-2 font-semibold text-black transition hover:scale-105"
        >
          Transferir
        </button>

        <AccountsSummary transactions={filtered} />
      </div>

      {month && !range && <BudgetsOverview transactions={filtered} month={month} />}

      {/* CUENTAS */}
      {/* BALANCE */}
      <div className="grid md:grid-cols-3 gap-4">
        <BalanceCard title="Ingresos" amount={income} currency={BASE_CURRENCY} />
        <BalanceCard title="Gastos" amount={expense} currency={BASE_CURRENCY} />
        <BalanceCard title="Balance" amount={balance} currency={BASE_CURRENCY} />
      </div>

      {/* INSIGHTS */}
      <Insights transactions={filtered} />

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatedCard>
          <CategoryChart transactions={expenseOnly} />
        </AnimatedCard>

        <AnimatedCard>
          <TopCategories transactions={expenseOnly} top={5} />
        </AnimatedCard>
      </div>

      {!range && (
        <AnimatedCard>
          <MonthlyComparison transactions={filtered} />
        </AnimatedCard>
      )}

      {savingGoals.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Metas de ahorro</h2>
            <Link href="/accounts" className="text-sm font-semibold text-[#FACC15]">
              Gestionar
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {savingGoals.slice(0, 4).map((goal) => {
              const progress = getSavingGoalProgress(goal, accounts, transactions);
              return (
                <div key={goal.id} className="rounded-2xl bg-zinc-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{goal.name}</p>
                      <p className="mt-1 text-sm text-zinc-400">{goal.currency} · vence {goal.targetDate}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#FACC15]">{progress.progress.toFixed(0)}%</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-zinc-800">
                    <div className="h-2 rounded-full bg-[#FACC15]" style={{ width: `${progress.progress}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-zinc-300">
                    {formatMoney(progress.currentAmount, goal.currency)} de {formatMoney(goal.targetAmount, goal.currency)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
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
