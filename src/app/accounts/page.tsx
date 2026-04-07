"use client";

import { useMemo, useState } from "react";
import { useAccounts } from "@/context/AccountsContext";
import { useTransactions } from "@/context/TransactionsContext";

export default function AccountsPage() {
  const { accounts, addAccount, deleteAccount } = useAccounts();
  const { getAccountBalance, transactions } = useTransactions();

  const [name, setName] = useState("");

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      ),
    [accounts]
  );

  const handleAdd = () => {
    const created = addAccount(name, "bank");
    if (!created) return;

    setName("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cuentas</h1>

      <div className="rounded-2xl bg-white p-5 text-black space-y-4">
        <h2 className="font-semibold">Nueva cuenta</h2>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="w-full rounded border p-2"
            placeholder="Nombre de la cuenta"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={handleAdd}
            className="rounded bg-[#FFD600] px-4 font-semibold text-black"
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedAccounts.map((account) => (
          <div
            key={account.id}
            className="rounded-2xl shadow-sm bg-white p-5"
          >
            <h2 className="text-xl font-semibold">{account.name}</h2>
            <p className="mt-3 text-2xl font-bold">
              ${getAccountBalance(account.id).toLocaleString("es-AR")}
            </p>

            <button
              onClick={() => {
                const hasTransactions = transactions.some(
                  (transaction) => transaction.accountId === account.id
                );

                if (hasTransactions) {
                  alert("No podés eliminar una cuenta que ya tiene movimientos");
                  return;
                }

                if (!confirm("¿Eliminar cuenta?")) return;
                deleteAccount(account.id);
              }}
              className="mt-4 text-sm text-red-400 hover:text-red-300"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
