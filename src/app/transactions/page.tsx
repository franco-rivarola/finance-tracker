"use client";

import { Suspense, useState, useMemo } from "react";
import { useTransactions } from "@/context/TransactionsContext";
import { useAccounts } from "@/context/AccountsContext";
import useTransactionsFilters from "@/hooks/useTransactionsFilters";
import TransactionModal from "@/components/TransactionModal";
import DateFilter from "@/components/DateFilter";
import { TransactionInput, TransactionType } from "@/types/transaction";
import { motion, AnimatePresence } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { BASE_CURRENCY, formatMoney, getTransactionBaseAmount } from "@/utils/currency";

type DateRange = {
  start: string;
  end: string;
};

function TransactionsPageContent() {
  const {
    transactions,
    deleteTransaction,
    addTransaction,
    updateTransaction,
    getTransaction,
  } = useTransactions();
  const { accounts } = useAccounts();

  const {
    type,
    setType,
    category,
    setCategory,
    month,
    setMonth,
    categories,
    filtered,
  } = useTransactionsFilters(transactions);

  const typeOptions: Array<"all" | TransactionType> = [
    "all",
    "income",
    "expense",
  ];
  const [activeTab, setActiveTab] = useState<"movements" | "transfers">(
    "movements"
  );
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingData = useMemo<TransactionInput | undefined>(() => {
    if (!editingId) return undefined;

    const t = getTransaction(editingId);
    if (!t) return undefined;

    return {
      amount: t.amount,
      description: t.description,
      type: t.type,
      categoryId: t.category.id,
      date: t.date,
      accountId: t.accountId,
    };
  }, [editingId, getTransaction]);

  const accountNameById = useMemo(
    () =>
      new Map(accounts.map((account) => [account.id, account.name])),
    [accounts]
  );

  const regularMovements = useMemo(
    () => filtered.filter((transaction) => transaction.category.id !== "transfer"),
    [filtered]
  );

  const transferGroups = useMemo(() => {
    const transfers = transactions.filter((transaction) => {
      if (transaction.category.id !== "transfer") return false;
      if (dateRange) {
        return (
          transaction.date >= dateRange.start &&
          transaction.date <= dateRange.end
        );
      }
      if (month) {
        return transaction.date.startsWith(month);
      }
      return true;
    });
    const grouped = new Map<
      string,
      {
        incomeId?: string;
        expenseId?: string;
        amount: number;
        date: string;
        description: string;
        fromAccountId?: string;
        toAccountId?: string;
      }
    >();

    const getTransferKey = (description: string, amount: number, date: string) =>
      `${date}|${amount}|${description
        .replace("Transferencia enviada", "Transferencia")
        .replace("Transferencia recibida", "Transferencia")}`;

    transfers.forEach((transaction) => {
      const key = getTransferKey(
        transaction.description,
        transaction.amount,
        transaction.date
      );
      const current = grouped.get(key) ?? {
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description
          .replace("Transferencia enviada", "Transferencia")
          .replace("Transferencia recibida", "Transferencia"),
      };

      if (transaction.type === "expense") {
        current.expenseId = transaction.id;
        current.fromAccountId = transaction.accountId;
      } else {
        current.incomeId = transaction.id;
        current.toAccountId = transaction.accountId;
      }

      grouped.set(key, current);
    });

    return Array.from(grouped.values());
  }, [dateRange, month, transactions]);

  return (
    <div className="space-y-6 pb-20">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "movements", label: "Movimientos" },
            { id: "transfers", label: "Transferencias" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "movements" | "transfers")
              }
              className={`rounded-2xl px-5 py-3 text-base font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[#FACC15] text-black shadow-lg shadow-yellow-500/20"
                  : "bg-zinc-900 text-zinc-300 border border-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setOpen(true);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FACC15] text-black transition hover:brightness-95"
          aria-label="Agregar movimiento"
        >
          <span className="text-2xl leading-none">+</span>
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
        <DateFilter
          onChange={(selectedMonth, range) => {
            setDateRange(range);
            setMonth(range ? "" : selectedMonth);
          }}
        />

        {activeTab === "movements" && (
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex gap-2 flex-wrap">
              {typeOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-1 rounded-full text-sm transition ${
                    type === t
                      ? "bg-[#FACC15] text-black"
                      : "bg-zinc-800 text-white"
                  }`}
                >
                  {t === "all"
                    ? "Todos"
                    : t === "income"
                    ? "Ingresos"
                    : "Gastos"}
                </button>
              ))}
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map((currentCategory) => (
                <option key={currentCategory.id} value={currentCategory.id}>
                  {currentCategory.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeTab === "movements" && (
        <>
          {/* LISTA */}
          <div className="space-y-3">
            <AnimatePresence>
              {regularMovements.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  drag="x"
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -120) void deleteTransaction(t.id);
                  }}
                  className={`rounded-2xl border p-4 flex justify-between items-center ${
                    t.type === "income"
                      ? "border-emerald-200 bg-emerald-50/90 text-emerald-950"
                      : "border-rose-200 bg-rose-50/90 text-rose-950"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          t.type === "income"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {t.type === "income" ? "Ingreso" : "Gasto"}
                      </span>

                      <p className="text-base font-semibold">
                        {t.category?.name || "Sin categoría"}
                      </p>
                    </div>

                    <p
                      className={`mt-1 text-sm ${
                        t.type === "income"
                          ? "text-emerald-700/80"
                          : "text-rose-700/80"
                      }`}
                    >
                      {t.description || "Sin descripción"} • {t.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p
                      className={`font-bold ${
                        t.type === "income"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatMoney(getTransactionBaseAmount(t), BASE_CURRENCY)}
                    </p>

                    <button
                      onClick={() => {
                        setEditingId(t.id);
                        setOpen(true);
                      }}
                      className="text-zinc-500 hover:text-black"
                    >
                      <EditIcon fontSize="small" />
                    </button>

                    <button
                      onClick={() => void deleteTransaction(t.id)}
                      className="text-zinc-500 hover:text-black"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {activeTab === "transfers" && (
        <div className="space-y-3">
          <AnimatePresence>
            {transferGroups.map((transfer) => (
              <motion.div
                key={transfer.expenseId ?? transfer.incomeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-sky-200 bg-sky-50/90 p-4 text-sky-950"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                        Transferencia
                      </span>

                      <p className="font-medium">
                        {transfer.description || "Transferencia interna"}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-sky-700/80">
                      {accountNameById.get(transfer.fromAccountId || "") || "Cuenta origen"}{" "}
                      {" -> "}
                      {accountNameById.get(transfer.toAccountId || "") || "Cuenta destino"}{" "}
                      • {transfer.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-bold text-sky-700">
                      {formatMoney(transfer.amount, BASE_CURRENCY)}
                    </p>

                    <button
                      onClick={() => {
                        if (transfer.expenseId) void deleteTransaction(transfer.expenseId);
                        if (transfer.incomeId) void deleteTransaction(transfer.incomeId);
                      }}
                      className="text-zinc-500 hover:text-black"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <TransactionModal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Editar transacción" : "Nueva transacción"}
        initialData={editingData}
        onSubmit={async (data) => {
          if (editingId) return updateTransaction(editingId, data);
          return addTransaction(data);
        }}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="pb-20 text-zinc-400">Cargando transacciones...</div>}>
      <TransactionsPageContent />
    </Suspense>
  );
}
