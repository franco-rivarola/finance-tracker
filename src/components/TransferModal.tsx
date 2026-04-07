"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAccounts } from "@/context/AccountsContext";
import { useTransactions } from "@/context/TransactionsContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function TransferModal({ open, onClose }: Props) {
  const { accounts } = useAccounts();
  const { transferBetweenAccounts, getAccountBalance } = useTransactions();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    date: today,
  });

  const selectedBalance = getAccountBalance(form.fromAccountId);
  const amountNumber = Number(form.amount || 0);
  const insufficient = amountNumber > selectedBalance;

  const handleTransfer = () => {
    if (
      !amountNumber ||
      !form.fromAccountId ||
      !form.toAccountId ||
      form.fromAccountId === form.toAccountId ||
      insufficient
    ) return;

    transferBetweenAccounts({
      ...form,
      amount: amountNumber,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 border border-gray-200"
          >
            <h2 className="text-xl font-bold text-black">
              Transferir dinero
            </h2>

            {/* DESDE */}
            <select
              value={form.fromAccountId}
              onChange={(e) =>
                setForm({ ...form, fromAccountId: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-yellow-500 outline-none"
            >
              <option value="">Desde cuenta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* SALDO */}
            {form.fromAccountId && (
              <p className="text-sm text-gray-500">
                Disponible:{" "}
                <span className="font-semibold text-black">
                  ${selectedBalance}
                </span>
              </p>
            )}

            {/* HACIA */}
            <select
              value={form.toAccountId}
              onChange={(e) =>
                setForm({ ...form, toAccountId: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-yellow-500 outline-none"
            >
              <option value="">Hacia cuenta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* MONTO */}
            <input
              type="text"
              inputMode="numeric"
              placeholder="Monto"
              value={form.amount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setForm({ ...form, amount: value });
                }
              }}
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-yellow-500 outline-none"
            />

            {/* ERROR */}
            {insufficient && (
              <p className="text-sm text-red-500 font-medium">
                No tenés saldo suficiente
              </p>
            )}

            {/* FECHA */}
            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-gray-300 focus:border-yellow-500 outline-none"
            />

            {/* BOTÓN PRINCIPAL */}
            <button
              onClick={handleTransfer}
              disabled={insufficient}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                insufficient
                  ? "bg-gray-300 text-gray-500"
                  : "bg-yellow-400 text-black hover:bg-yellow-500"
              }`}
            >
              Transferir
            </button>

            {/* CANCELAR */}
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
