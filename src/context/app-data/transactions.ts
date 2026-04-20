"use client";

import type { Session } from "@supabase/supabase-js";
import type { Transaction, TransactionInput } from "@/types/transaction";
import { getAccountBalanceFromList } from "./accounts";
import { mapTransaction, type AppDataClient, type CategoryItem, type Setter } from "./shared";

const normalizeDescription = (value: string) => {
  const trimmed = value.trim();
  return trimmed || "Movimiento sin descripcion";
};

const getTransactionErrorMessage = (message?: string) => {
  switch (message) {
    case "insufficient_balance":
      return "No tenés saldo suficiente en esa cuenta";
    case "invalid_category":
      return "La categoría elegida no es válida para ese movimiento";
    case "transfer_transaction_locked":
      return "Las transferencias se editan desde la sección de transferencias";
    case "invalid_amount":
      return "El importe debe ser mayor a cero";
    case "same_account_transfer":
      return "Elegí dos cuentas distintas";
    case "account_not_found":
    case "from_account_not_found":
    case "to_account_not_found":
      return "La cuenta elegida no es válida";
    case "transaction_not_found":
      return "No se encontró el movimiento";
    default:
      return "No se pudo guardar el movimiento";
  }
};

export const addTransactionRecord = async ({
  db,
  session,
  categories,
  transactions,
  setTransactions,
  data,
}: {
  db: AppDataClient;
  session: Session | null;
  categories: CategoryItem[];
  transactions: Transaction[];
  setTransactions: Setter<Transaction[]>;
  data: TransactionInput;
}) => {
  const userId = session?.user.id;
  if (!userId) return false;

  if (data.type === "expense" && data.amount > getAccountBalanceFromList(data.accountId, transactions)) {
    alert("No tenés saldo suficiente en esa cuenta");
    return false;
  }

  const { data: inserted, error } = await db.rpc("create_transaction", {
    p_account_id: data.accountId,
    p_category_id: data.categoryId,
    p_type: data.type,
    p_amount: data.amount,
    p_transaction_date: data.date,
    p_description: normalizeDescription(data.description),
  });

  if (error || !inserted) {
    console.error(error);
    alert(getTransactionErrorMessage(error?.message));
    return false;
  }

  setTransactions((prev) => [mapTransaction(inserted, categories), ...prev]);
  return true;
};

export const updateTransactionRecord = async ({
  db,
  categories,
  transactions,
  setTransactions,
  id,
  data,
}: {
  db: AppDataClient;
  categories: CategoryItem[];
  transactions: Transaction[];
  setTransactions: Setter<Transaction[]>;
  id: string;
  data: TransactionInput;
}) => {
  const current = transactions.find((item) => item.id === id);
  if (!current) return false;

  const projected = transactions.filter((item) => item.id !== id);
  if (data.type === "expense" && data.amount > getAccountBalanceFromList(data.accountId, projected)) {
    alert("No tenés saldo suficiente en esa cuenta");
    return false;
  }

  const { data: updated, error } = await db.rpc("update_transaction", {
    p_transaction_id: id,
    p_account_id: data.accountId,
    p_category_id: data.categoryId,
    p_type: data.type,
    p_amount: data.amount,
    p_transaction_date: data.date,
    p_description: normalizeDescription(data.description),
  });

  if (error || !updated) {
    console.error(error);
    alert(getTransactionErrorMessage(error?.message));
    return false;
  }

  setTransactions((prev) =>
    prev.map((item) => (item.id === id ? mapTransaction(updated, categories) : item))
  );
  return true;
};

export const deleteTransactionRecord = async ({
  db,
  setTransactions,
  id,
}: {
  db: AppDataClient;
  setTransactions: Setter<Transaction[]>;
  id: string;
}) => {
  const { error } = await db.rpc("delete_transaction", { p_transaction_id: id });
  if (error) {
    console.error(error);
    alert(getTransactionErrorMessage(error.message));
    return;
  }
  setTransactions((prev) => prev.filter((item) => item.id !== id));
};

export const transferBetweenAccountsRecord = async ({
  db,
  transactions,
  refreshData,
  fromAccountId,
  toAccountId,
  amount,
  date,
  description,
}: {
  db: AppDataClient;
  transactions: Transaction[];
  refreshData: () => Promise<void>;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description?: string;
}) => {
  if (amount > getAccountBalanceFromList(fromAccountId, transactions)) {
    alert("No tenés saldo suficiente en la cuenta origen");
    return;
  }

  if (fromAccountId === toAccountId) {
    alert("Elegí dos cuentas distintas");
    return;
  }

  const { error } = await db.rpc("create_transfer", {
    p_from_account_id: fromAccountId,
    p_to_account_id: toAccountId,
    p_source_amount: amount,
    p_transaction_date: date,
    p_description: description?.trim() || undefined,
  });

  if (error) {
    console.error(error);
    alert(getTransactionErrorMessage(error.message));
    return;
  }

  await refreshData();
};
