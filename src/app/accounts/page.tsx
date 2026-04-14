"use client";

import { useMemo, useState } from "react";
import { useAccounts } from "@/context/AccountsContext";
import { useTransactions } from "@/context/TransactionsContext";
import TransferModal from "@/components/TransferModal";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { CurrencyCode } from "@/types/account";
import { formatMoney } from "@/utils/currency";
import { useSavingGoals } from "@/context/SavingGoalsContext";
import { getSavingGoalProgress } from "@/utils/finance";

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { getAccountBalance, transactions } = useTransactions();
  const { savingGoals, addSavingGoal, deleteSavingGoal } = useSavingGoals();

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("ARS");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCurrency, setEditingCurrency] = useState<CurrencyCode>("ARS");
  const [transferOpen, setTransferOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    accountId: "",
    targetDate: new Date().toISOString().slice(0, 10),
    currency: "ARS" as CurrencyCode,
  });

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      ),
    [accounts]
  );

  const handleAdd = async () => {
    const created = await addAccount(name, "bank", currency);
    if (!created) return;

    setName("");
    setCurrency("ARS");
    setCreateOpen(false);
  };

  const handleEdit = (id: string, currentName: string, currentCurrency: CurrencyCode) => {
    setEditingId(id);
    setEditingName(currentName);
    setEditingCurrency(currentCurrency);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const updated = await updateAccount(editingId, editingName, editingCurrency);
    if (!updated) return;

    setEditingId(null);
    setEditingName("");
    setEditingCurrency("ARS");
  };

  const handleAddGoal = async () => {
    const amount = Number(goalForm.targetAmount);
    if (!goalForm.name.trim() || !goalForm.accountId || !amount) return;

    const created = await addSavingGoal({
      name: goalForm.name.trim(),
      targetAmount: amount,
      accountId: goalForm.accountId,
      targetDate: goalForm.targetDate,
      currency: goalForm.currency,
    });
    if (!created) return;

    setGoalForm({
      name: "",
      targetAmount: "",
      accountId: "",
      targetDate: new Date().toISOString().slice(0, 10),
      currency: "ARS",
    });
    setGoalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Cuentas</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTransferOpen(true)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Transferir
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FACC15] text-black transition hover:brightness-95"
            aria-label="Agregar cuenta"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedAccounts.map((account) => (
          <div
            key={account.id}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
          >
            {editingId === account.id ? (
              <div className="space-y-3">
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 focus:bg-white"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <select
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 focus:bg-white"
                  value={editingCurrency}
                  onChange={(e) => setEditingCurrency(e.target.value as CurrencyCode)}
                >
                  <option value="ARS">Pesos argentinos</option>
                  <option value="USD">Dólares</option>
                  <option value="EUR">Euros</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 rounded-xl bg-[#FACC15] px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                    className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-zinc-950">{account.name}</h2>
                <p className="mt-1 text-sm text-zinc-500">{account.currency}</p>
              </div>
            )}
            <p className="mt-3 text-2xl font-bold text-zinc-950">
              {formatMoney(getAccountBalance(account.id), account.currency)}
            </p>

            {editingId !== account.id && (
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => handleEdit(account.id, account.name, account.currency)}
                  className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Editar
                </button>

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
                    void deleteAccount(account.id);
                  }}
                  className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 text-black shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Metas de ahorro</h2>
            <p className="mt-1 text-sm text-zinc-500">Objetivo, progreso y fecha estimada por cuenta.</p>
          </div>
          <button
            onClick={() => setGoalOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FACC15] text-black transition hover:brightness-95"
            aria-label="Agregar meta"
          >
            <AddIcon fontSize="small" />
          </button>
        </div>

        {savingGoals.length === 0 ? (
          <p className="text-sm text-zinc-500">Todavía no hay metas cargadas.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savingGoals.map((goal) => {
              const progress = getSavingGoalProgress(goal, accounts, transactions);
              return (
                <div key={goal.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-zinc-950">{goal.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {progress.account?.name ?? "Cuenta"} · vence {goal.targetDate}
                      </p>
                    </div>
                    <button
                      onClick={() => void deleteSavingGoal(goal.id)}
                      className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-zinc-200">
                    <div className="h-2 rounded-full bg-[#FACC15]" style={{ width: `${progress.progress}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-zinc-700">
                      {formatMoney(progress.currentAmount, goal.currency)} / {formatMoney(goal.targetAmount, goal.currency)}
                    </span>
                    <span className="text-zinc-500">
                      {progress.estimatedMonths ? `${progress.estimatedMonths} meses estimados` : "Sin proyección"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-black shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Nueva cuenta</h2>
              <button
                onClick={() => setCreateOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
                aria-label="Cerrar modal"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                placeholder="Nombre de la cuenta"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <select
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              >
                <option value="ARS">Pesos argentinos</option>
                <option value="USD">Dólares</option>
                <option value="EUR">Euros</option>
              </select>

              <button
                onClick={handleAdd}
                className="mx-auto block rounded-xl bg-[#FACC15] px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {goalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 text-black shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Nueva meta</h2>
              <button
                onClick={() => setGoalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
                aria-label="Cerrar modal"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                placeholder="Nombre de la meta"
                value={goalForm.name}
                onChange={(e) => setGoalForm((current) => ({ ...current, name: e.target.value }))}
              />
              <input
                type="number"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                placeholder="Monto objetivo"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm((current) => ({ ...current, targetAmount: e.target.value }))}
              />
              <select
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                value={goalForm.accountId}
                onChange={(e) => {
                  const account = accounts.find((item) => item.id === e.target.value);
                  setGoalForm((current) => ({
                    ...current,
                    accountId: e.target.value,
                    currency: account?.currency ?? current.currency,
                  }));
                }}
              >
                <option value="">Cuenta asociada</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-400 focus:bg-white"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm((current) => ({ ...current, targetDate: e.target.value }))}
              />
              <button
                onClick={handleAddGoal}
                className="mx-auto block rounded-xl bg-[#FACC15] px-3 py-2 text-sm font-semibold text-black transition hover:brightness-95"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
