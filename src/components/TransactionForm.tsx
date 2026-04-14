"use client";

import { useMemo, useState } from "react";
import { TransactionInput } from "@/types/transaction";
import { useAccounts } from "@/context/AccountsContext";
import { useTransactions } from "@/context/TransactionsContext";
import { useCategories } from "@/context/CategoriesContext";
import { formatMoney } from "@/utils/currency";

type Props = {
  initialData?: TransactionInput;
  onSubmit: (data: TransactionInput) => Promise<void>;
  submitText?: string;
};

export default function TransactionForm({
  initialData,
  onSubmit,
  submitText = "Guardar",
}: Props) {
  const { accounts } = useAccounts();
  const { getAccountBalance } = useTransactions();
  const { categories } = useCategories();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<TransactionInput>({
    amount: initialData?.amount ?? 0,
    description: initialData?.description ?? "",
    type: initialData?.type ?? "expense",
    categoryId: initialData?.categoryId ?? "",
    accountId: initialData?.accountId ?? accounts[0]?.id ?? "", // 🔥
    date: initialData?.date ?? today,
  });

  const [amountInput, setAmountInput] = useState(
    initialData?.amount ? formatNumber(initialData.amount) : ""
  );

  const filteredCategories = categories.filter(
    (c) => c.type === form.type
  );

  const selectedAccountBalance = getAccountBalance(form.accountId);
  const selectedAccount = accounts.find((account) => account.id === form.accountId);
  const availableBalance = useMemo(() => {
    if (!form.accountId) return 0;

    if (!initialData || initialData.accountId !== form.accountId) {
      return selectedAccountBalance;
    }

    if (initialData.type === "expense") {
      return selectedAccountBalance + initialData.amount;
    }

    if (initialData.type === "income") {
      return selectedAccountBalance - initialData.amount;
    }

    return selectedAccountBalance;
  }, [form.accountId, initialData, selectedAccountBalance]);

  const insufficientFunds =
    form.type === "expense" &&
    form.amount > 0 &&
    form.accountId !== "" &&
    form.amount > availableBalance;

  function formatNumber(value: number | string) {
    const num = Number(value);
    if (!num) return "";
    return num.toLocaleString("es-AR");
  }

  function parseNumber(value: string) {
    return Number(value.replace(/\./g, ""));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.amount ||
      !form.categoryId ||
      !form.accountId ||
      insufficientFunds
    ) {
      return;
    }

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TIPO */}
      <select
        value={form.type}
        onChange={(e) =>
          setForm({
            ...form,
            type: e.target.value as "income" | "expense",
            categoryId: "",
          })
        }
        className="w-full border p-3 rounded-xl"
      >
        <option value="expense">Gasto</option>
        <option value="income">Ingreso</option>
      </select>

      {/* CATEGORIA */}
      <select
        value={form.categoryId}
        onChange={(e) =>
          setForm({ ...form, categoryId: e.target.value })
        }
        className="w-full border p-3 rounded-xl"
      >
        <option value="">Seleccionar categoría</option>
        {filteredCategories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* 🏦 CUENTA 🔥 */}
      <select
        value={form.accountId}
        onChange={(e) =>
          setForm({ ...form, accountId: e.target.value })
        }
        className="w-full border p-3 rounded-xl"
      >
        <option value="">Seleccionar cuenta</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
          </option>
        ))}
      </select>

      {form.accountId && (
        <p className="text-sm text-gray-500">
          Disponible:{" "}
          <span className="font-semibold text-black">
            {formatMoney(availableBalance, selectedAccount?.currency ?? "ARS")}
          </span>
        </p>
      )}

      {insufficientFunds && (
        <p className="text-sm font-medium text-red-500">
          No tenés saldo suficiente en la cuenta seleccionada para registrar este gasto.
        </p>
      )}

      {/* MONTO */}
      <input
        type="text"
        inputMode="numeric"
        placeholder="$ 0"
        value={amountInput}
        onChange={(e) => {
          let value = e.target.value;
          value = value.replace(/\D/g, "");

          setAmountInput(formatNumber(value));

          setForm({
            ...form,
            amount: parseNumber(value),
          });
        }}
        className="w-full border p-3 rounded-xl text-lg font-medium"
      />

      {/* DESCRIPCION */}
      <input
        placeholder="Descripción (opcional)"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        className="w-full border p-3 rounded-xl"
      />

      {/* FECHA */}
      <input
        type="date"
        value={form.date}
        onChange={(e) =>
          setForm({ ...form, date: e.target.value })
        }
        className="w-full border p-3 rounded-xl"
      />

      {/* BOTÓN */}
      <button
        type="submit"
        disabled={
          !form.amount ||
          !form.categoryId ||
          !form.accountId ||
          insufficientFunds
        }
        className="w-full rounded-xl bg-[#FACC15] py-3 font-semibold text-[#020617] shadow transition hover:brightness-95 disabled:opacity-40"
      >
        {submitText}
      </button>
    </form>
  );
}
