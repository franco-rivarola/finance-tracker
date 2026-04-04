"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/context/TransactionsContext";
import useTransactionsFilters from "@/hooks/useTransactionsFilters";
import TransactionModal from "@/components/TransactionModal";
import { TransactionInput } from "@/types/transaction";
import { motion, AnimatePresence } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function TransactionsPage() {
  const {
    transactions,
    deleteTransaction,
    addTransaction,
    updateTransaction,
    getTransaction,
  } = useTransactions();

  const {
    search,
    setSearch,
    type,
    setType,
    category,
    setCategory,
    month,
    setMonth,
    categories,
    filtered,
  } = useTransactionsFilters(transactions);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 🔥 data para edición
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
    };
  }, [editingId, getTransaction]);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transacciones</h1>

        <button
          onClick={() => {
            setEditingId(null);
            setOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow"
        >
          + Nueva
        </button>
      </div>

      {/* FILTROS PRO */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setType("all")}
          className={`px-3 py-1 rounded-full text-sm ${
            type === "all" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Todos
        </button>

        <button
          onClick={() => setType("income")}
          className={`px-3 py-1 rounded-full text-sm ${
            type === "income" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Ingresos
        </button>

        <button
          onClick={() => setType("expense")}
          className={`px-3 py-1 rounded-full text-sm ${
            type === "expense" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          Gastos
        </button>
      </div>

      {/* LISTA TIPO FINTECH */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x < -120) {
                  deleteTransaction(t.id);
                }
              }}
              className="bg-white p-4 rounded-2xl shadow flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {t.description || "Sin descripción"}
                </p>

                <p className="text-sm text-gray-400">
                  {t.category?.name} • {t.date}
                </p>
              </div>

              <div className="text-right flex items-center gap-3">
                <p
                  className={`font-bold ${
                    t.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}${t.amount}
                </p>

                {/* ICONOS 🔥 */}
                <button
                  onClick={() => {
                    setEditingId(t.id);
                    setOpen(true);
                  }}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <EditIcon fontSize="small" />
                </button>

                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL */}
      <TransactionModal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Editar transacción" : "Nueva transacción"}
        initialData={editingData}
        onSubmit={(data) => {
          if (editingId) {
            updateTransaction(editingId, data);
          } else {
            addTransaction(data);
          }
        }}
      />
    </div>
  );
}
