"use client";

import type { Session } from "@supabase/supabase-js";
import type { Account, AccountType, CurrencyCode } from "@/types/account";
import type { Transaction } from "@/types/transaction";
import { mapAccount, type AppDataClient, type Setter } from "./shared";

const getAccountErrorMessage = (message?: string) => {
  switch (message) {
    case "duplicate_account_name":
      return "Ya existe una cuenta con ese nombre";
    case "blank_account_name":
      return "La cuenta necesita un nombre";
    case "system_account_delete_forbidden":
      return "No podés eliminar una cuenta base";
    case "account_has_transactions":
      return "No podés eliminar una cuenta que ya tiene movimientos";
    case "account_has_saving_goals":
      return "No podés eliminar una cuenta con metas de ahorro asociadas";
    default:
      return "No se pudo guardar la cuenta";
  }
};

export const getAccountBalanceFromList = (accountId: string, list: Transaction[]) =>
  list.reduce((acc, item) => {
    if (item.accountId !== accountId) return acc;
    return item.type === "income" ? acc + item.amount : acc - item.amount;
  }, 0);

export const addAccountRecord = async ({
  db,
  session,
  accounts,
  setAccounts,
  name,
  type,
  currency = "ARS",
}: {
  db: AppDataClient;
  session: Session | null;
  accounts: Account[];
  setAccounts: Setter<Account[]>;
  name: string;
  type: AccountType;
  currency?: CurrencyCode;
}) => {
  const userId = session?.user.id;
  const trimmed = name.trim();
  if (!userId || !trimmed) return null;

  const exists = accounts.some((item) => item.name.toLowerCase() === trimmed.toLowerCase());
  if (exists) {
    alert("Ya existe una cuenta con ese nombre");
    return null;
  }

  const { data, error } = await db.rpc("create_account", {
    p_name: trimmed,
    p_type: type,
    p_currency: currency,
  });

  if (error || !data) {
    console.error(error);
    alert(getAccountErrorMessage(error?.message));
    return null;
  }

  const mapped = mapAccount(data);
  setAccounts((prev) => [...prev, mapped]);
  return mapped;
};

export const updateAccountRecord = async ({
  db,
  accounts,
  setAccounts,
  id,
  name,
  currency,
}: {
  db: AppDataClient;
  accounts: Account[];
  setAccounts: Setter<Account[]>;
  id: string;
  name: string;
  currency?: CurrencyCode;
}) => {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const account = accounts.find((item) => item.id === id);
  if (!account) return null;

  const exists = accounts.some(
    (item) => item.id !== id && item.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) {
    alert("Ya existe una cuenta con ese nombre");
    return null;
  }

  const { data, error } = await db.rpc("update_account", {
    p_account_id: id,
    p_name: trimmed,
    p_currency: currency ?? account.currency,
  });

  if (error || !data) {
    console.error(error);
    alert(getAccountErrorMessage(error?.message));
    return null;
  }

  const mapped = mapAccount(data);
  setAccounts((prev) => prev.map((item) => (item.id === id ? mapped : item)));
  return mapped;
};

export const deleteAccountRecord = async ({
  db,
  accounts,
  transactions,
  setAccounts,
  id,
}: {
  db: AppDataClient;
  accounts: Account[];
  transactions: Transaction[];
  setAccounts: Setter<Account[]>;
  id: string;
}) => {
  const account = accounts.find((item) => item.id === id);
  if (!account) return false;
  if (transactions.some((item) => item.accountId === id)) {
    alert("No podés eliminar una cuenta que ya tiene movimientos");
    return false;
  }
  if (account.isSystem) {
    alert("No podés eliminar una cuenta base");
    return false;
  }

  const { error } = await db.rpc("delete_account", { p_account_id: id });
  if (error) {
    console.error(error);
    alert(getAccountErrorMessage(error.message));
    return false;
  }

  setAccounts((prev) => prev.filter((item) => item.id !== id));
  return true;
};
